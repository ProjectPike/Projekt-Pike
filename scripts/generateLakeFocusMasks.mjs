import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { LAKE_FOCUS_MASK_BLOCKED_IDS } from "../src/components/map/lakeFocusMask.js";
import { LAKE_MAP_FRAMING_BY_ID } from "../src/components/map/lakeMapBounds.js";
import { lakes } from "../src/data/lakes.js";

export const MASK_SCHEMA_VERSION = 1;
export const MASK_SHELL = Object.freeze([
  Object.freeze([5, 54]),
  Object.freeze([30, 54]),
  Object.freeze([30, 71]),
  Object.freeze([5, 71]),
  Object.freeze([5, 54]),
]);

const API_ROOT = "https://api.openstreetmap.org/api/0.6";
const USER_AGENT = "ProjectPike-focus-mask-generator/1.0";
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIRECTORY = resolve(REPOSITORY_ROOT, "public/lake-focus");

function coordinatesEqual(left, right) {
  return left[0] === right[0] && left[1] === right[1];
}

function compareCoordinates(left, right) {
  return left[0] - right[0] || left[1] - right[1];
}

function signedArea(openRing) {
  let area = 0;

  for (let index = 0; index < openRing.length; index += 1) {
    const current = openRing[index];
    const next = openRing[(index + 1) % openRing.length];
    area += current[0] * next[1] - next[0] * current[1];
  }

  return area / 2;
}

function rotateRing(openRing) {
  let bestIndex = 0;

  for (let index = 1; index < openRing.length; index += 1) {
    const coordinateOrder = compareCoordinates(openRing[index], openRing[bestIndex]);
    if (coordinateOrder < 0) {
      bestIndex = index;
      continue;
    }

    if (coordinateOrder !== 0) {
      continue;
    }

    for (let offset = 1; offset < openRing.length; offset += 1) {
      const candidate = openRing[(index + offset) % openRing.length];
      const best = openRing[(bestIndex + offset) % openRing.length];
      const order = compareCoordinates(candidate, best);
      if (order < 0) {
        bestIndex = index;
        break;
      }
      if (order > 0) {
        break;
      }
    }
  }

  return [...openRing.slice(bestIndex), ...openRing.slice(0, bestIndex)];
}

export function normalizeRing(coordinates, { clockwise }) {
  if (!Array.isArray(coordinates)) {
    throw new Error("Ring coordinates must be an array");
  }

  const deduplicated = [];
  for (const coordinate of coordinates) {
    if (
      !Array.isArray(coordinate) ||
      coordinate.length !== 2 ||
      !coordinate.every(Number.isFinite)
    ) {
      throw new Error("Ring contains an invalid coordinate");
    }

    if (!deduplicated.at(-1) || !coordinatesEqual(deduplicated.at(-1), coordinate)) {
      deduplicated.push([...coordinate]);
    }
  }

  if (
    deduplicated.length > 1 &&
    coordinatesEqual(deduplicated[0], deduplicated.at(-1))
  ) {
    deduplicated.pop();
  }

  if (deduplicated.length < 3) {
    throw new Error("Ring must contain at least three distinct coordinates");
  }

  const area = signedArea(deduplicated);
  if (area === 0) {
    throw new Error("Ring has zero area");
  }

  const isClockwise = area < 0;
  const oriented = isClockwise === clockwise ? deduplicated : [...deduplicated].reverse();
  const rotated = rotateRing(oriented);
  return [...rotated, [...rotated[0]]];
}

function compareRings(left, right) {
  const leftBounds = getRingBounds(left);
  const rightBounds = getRingBounds(right);
  for (let index = 0; index < 4; index += 1) {
    const difference = leftBounds[index] - rightBounds[index];
    if (difference !== 0) {
      return difference;
    }
  }
  return JSON.stringify(left).localeCompare(JSON.stringify(right));
}

function getRingBounds(ring) {
  const longitudes = ring.map(([longitude]) => longitude);
  const latitudes = ring.map(([, latitude]) => latitude);
  return [
    Math.min(...longitudes),
    Math.min(...latitudes),
    Math.max(...longitudes),
    Math.max(...latitudes),
  ];
}

function validateMemberWays(members, wayById, role) {
  const seen = new Set();

  return members
    .filter((member) => member.role === role)
    .map((member) => {
      if (seen.has(member.ref)) {
        throw new Error(`Relation repeats ${role} way ${member.ref}`);
      }
      seen.add(member.ref);

      const way = wayById.get(member.ref);
      if (!way || !Array.isArray(way.nodes) || way.nodes.length < 2) {
        throw new Error(`Relation is missing ${role} way ${member.ref}`);
      }

      return { id: member.ref, nodes: [...way.nodes] };
    });
}

export function stitchWayRings(segments, role = "outer") {
  const closedRings = [];
  const openSegments = new Map();

  for (const segment of segments) {
    if (!Array.isArray(segment.nodes) || segment.nodes.length < 2) {
      throw new Error(`${role} way ${segment.id} has too few nodes`);
    }

    const nodes = segment.nodes.filter(
      (nodeId, index, values) => index === 0 || nodeId !== values[index - 1],
    );
    if (nodes.length < 2) {
      throw new Error(`${role} way ${segment.id} collapses after deduplication`);
    }

    if (nodes[0] === nodes.at(-1)) {
      closedRings.push(nodes);
    } else {
      openSegments.set(segment.id, { id: segment.id, nodes });
    }
  }

  const endpointSegments = new Map();
  for (const segment of openSegments.values()) {
    for (const endpoint of [segment.nodes[0], segment.nodes.at(-1)]) {
      const adjacent = endpointSegments.get(endpoint) ?? [];
      adjacent.push(segment.id);
      endpointSegments.set(endpoint, adjacent);
    }
  }

  for (const [endpoint, adjacent] of endpointSegments) {
    if (adjacent.length !== 2) {
      throw new Error(
        `${role} topology at node ${endpoint} has ${adjacent.length} connected ways`,
      );
    }
  }

  const remaining = new Set(openSegments.keys());
  const stitchedRings = [];

  while (remaining.size > 0) {
    const seedId = [...remaining].sort((left, right) => left - right)[0];
    const seed = openSegments.get(seedId);
    const ring = [...seed.nodes];
    remaining.delete(seedId);

    while (ring.at(-1) !== ring[0]) {
      const endpoint = ring.at(-1);
      const candidates = (endpointSegments.get(endpoint) ?? []).filter((id) =>
        remaining.has(id),
      );

      if (candidates.length !== 1) {
        throw new Error(
          `${role} ring cannot continue uniquely at node ${endpoint}`,
        );
      }

      const nextId = candidates[0];
      const next = openSegments.get(nextId);
      const oriented = next.nodes[0] === endpoint
        ? next.nodes
        : next.nodes.at(-1) === endpoint
          ? [...next.nodes].reverse()
          : null;

      if (!oriented) {
        throw new Error(`${role} way ${nextId} does not meet node ${endpoint}`);
      }

      ring.push(...oriented.slice(1));
      remaining.delete(nextId);
    }

    stitchedRings.push(ring);
  }

  return [...closedRings, ...stitchedRings];
}

function mapNodeRings(nodeRings, nodeById, role) {
  return nodeRings.map((nodeRing) =>
    nodeRing.map((nodeId) => {
      const node = nodeById.get(nodeId);
      if (!node || !Number.isFinite(node.lon) || !Number.isFinite(node.lat)) {
        throw new Error(`${role} ring is missing valid node ${nodeId}`);
      }
      return [node.lon, node.lat];
    }),
  );
}

export function extractLakeGeometry(osmDocument, framing) {
  if (!osmDocument || !Array.isArray(osmDocument.elements)) {
    throw new Error("OSM response has no elements array");
  }

  const root = osmDocument.elements.find(
    (element) =>
      element.type === framing.osmObjectType && element.id === framing.osmObjectId,
  );
  if (!root) {
    throw new Error(
      `OSM response is missing ${framing.osmObjectType} ${framing.osmObjectId}`,
    );
  }

  const nodeById = new Map(
    osmDocument.elements
      .filter((element) => element.type === "node")
      .map((node) => [node.id, node]),
  );

  let outerNodeRings;
  let innerNodeRings = [];

  if (framing.osmObjectType === "way") {
    if (!Array.isArray(root.nodes) || root.nodes[0] !== root.nodes.at(-1)) {
      throw new Error(`Way ${root.id} is not a closed polygon`);
    }
    outerNodeRings = [root.nodes];
  } else if (framing.osmObjectType === "relation") {
    const unsupportedMember = root.members?.find(
      (member) =>
        member.type !== "way" || !["outer", "inner"].includes(member.role),
    );
    if (unsupportedMember) {
      throw new Error(
        `Relation ${root.id} has unsupported ${unsupportedMember.type} member ${unsupportedMember.ref} with role ${unsupportedMember.role || "(empty)"}`,
      );
    }

    const wayById = new Map(
      osmDocument.elements
        .filter((element) => element.type === "way")
        .map((way) => [way.id, way]),
    );
    const outerWays = validateMemberWays(root.members ?? [], wayById, "outer");
    const innerWays = validateMemberWays(root.members ?? [], wayById, "inner");
    if (outerWays.length === 0) {
      throw new Error(`Relation ${root.id} has no outer ways`);
    }

    outerNodeRings = stitchWayRings(outerWays, "outer");
    innerNodeRings = stitchWayRings(innerWays, "inner");
  } else {
    throw new Error(`Unsupported OSM object type ${framing.osmObjectType}`);
  }

  const outerRings = mapNodeRings(outerNodeRings, nodeById, "outer")
    .map((ring) => normalizeRing(ring, { clockwise: true }))
    .sort(compareRings);
  const innerRings = mapNodeRings(innerNodeRings, nodeById, "inner")
    .map((ring) => normalizeRing(ring, { clockwise: false }))
    .sort(compareRings);

  return {
    innerRings,
    outerRings,
    sourceTimestamp: root.timestamp ?? null,
    sourceVersion: root.version ?? null,
  };
}

export function getGeometryBounds(rings) {
  const coordinates = rings.flat();
  if (coordinates.length === 0) {
    throw new Error("Cannot calculate bounds without outer geometry");
  }

  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ];
}

export function assertBoundsMatch(actual, expected, tolerance = 1e-7) {
  for (let corner = 0; corner < 2; corner += 1) {
    for (let axis = 0; axis < 2; axis += 1) {
      if (Math.abs(actual[corner][axis] - expected[corner][axis]) > tolerance) {
        throw new Error(
          `OSM geometry bounds ${JSON.stringify(actual)} do not match reviewed bounds ${JSON.stringify(expected)}`,
        );
      }
    }
  }
}

export function pointInRing([longitude, latitude], ring) {
  let inside = false;

  for (
    let current = 0, previous = ring.length - 1;
    current < ring.length;
    previous = current, current += 1
  ) {
    const [currentLongitude, currentLatitude] = ring[current];
    const [previousLongitude, previousLatitude] = ring[previous];
    const intersects =
      currentLatitude > latitude !== previousLatitude > latitude &&
      longitude <
        ((previousLongitude - currentLongitude) *
          (latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

export function assertProductionCoordinateInside(lakeId, outerRings) {
  const coordinate = lakes[lakeId]?.coordinates;
  if (!coordinate || !outerRings.some((ring) => pointInRing(coordinate, ring))) {
    throw new Error(
      `production coordinate ${JSON.stringify(coordinate)} is outside the OSM lake opening`,
    );
  }
}

export function buildFocusMaskArtifact(lakeId, framing, geometry) {
  const source = `https://www.openstreetmap.org/${framing.osmObjectType}/${framing.osmObjectId}`;
  const rings = [...geometry.outerRings, ...geometry.innerRings];
  const features = [
    {
      type: "Feature",
      properties: { kind: "outside-lake-focus-mask" },
      geometry: {
        type: "Polygon",
        coordinates: [MASK_SHELL.map((coordinate) => [...coordinate]), ...geometry.outerRings],
      },
    },
  ];

  if (geometry.innerRings.length > 0) {
    features.push({
      type: "Feature",
      properties: { kind: "lake-islands-focus-mask" },
      geometry: {
        type: "MultiPolygon",
        coordinates: geometry.innerRings.map((ring) => [ring]),
      },
    });
  }

  return {
    type: "FeatureCollection",
    pike: {
      schemaVersion: MASK_SCHEMA_VERSION,
      lakeId,
      purpose: "non-interactive outside-lake focus mask",
      source,
      osmObjectType: framing.osmObjectType,
      osmObjectId: framing.osmObjectId,
      sourceVersion: geometry.sourceVersion,
      sourceTimestamp: geometry.sourceTimestamp,
      outerRingCount: geometry.outerRings.length,
      innerRingCount: geometry.innerRings.length,
      vertexCount: rings.reduce((total, ring) => total + ring.length, 0),
    },
    features,
  };
}

export function serializeFocusMaskArtifact(artifact) {
  return `${JSON.stringify(artifact)}\n`;
}

export function getOsmFullUrl(framing) {
  return `${API_ROOT}/${framing.osmObjectType}/${framing.osmObjectId}/full.json`;
}

async function fetchOsmDocument(framing, fetchOsm = globalThis.fetch) {
  const response = await fetchOsm(getOsmFullUrl(framing), {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`OSM API returned HTTP ${response.status}`);
  }
  return response.json();
}

export async function generateFocusMasks({ check = false, fetchOsm = globalThis.fetch } = {}) {
  const generated = [];
  const blocked = [];

  await mkdir(OUTPUT_DIRECTORY, { recursive: true });

  for (const [lakeId, framing] of Object.entries(LAKE_MAP_FRAMING_BY_ID)) {
    try {
      const osmDocument = await fetchOsmDocument(framing, fetchOsm);
      const geometry = extractLakeGeometry(osmDocument, framing);
      assertBoundsMatch(getGeometryBounds(geometry.outerRings), framing.bounds);
      assertProductionCoordinateInside(lakeId, geometry.outerRings);
      const artifact = buildFocusMaskArtifact(lakeId, framing, geometry);
      const serialized = serializeFocusMaskArtifact(artifact);
      const outputPath = resolve(OUTPUT_DIRECTORY, `${lakeId}.geojson`);

      if (check) {
        const existing = await readFile(outputPath, "utf8").catch(() => null);
        if (existing !== serialized) {
          throw new Error("generated artifact differs from committed file");
        }
      } else {
        await writeFile(outputPath, serialized, "utf8");
      }

      generated.push({
        lakeId,
        outerRingCount: geometry.outerRings.length,
        innerRingCount: geometry.innerRings.length,
        bytes: Buffer.byteLength(serialized),
      });
      console.log(
        `${check ? "checked" : "generated"} ${lakeId}: ${geometry.outerRings.length} outer, ${geometry.innerRings.length} inner, ${Buffer.byteLength(serialized)} bytes`,
      );
    } catch (error) {
      blocked.push({ lakeId, reason: error.message });
      console.error(`blocked ${lakeId}: ${error.message}`);
    }
  }

  return { blocked, generated };
}

async function main() {
  const unsupportedArguments = process.argv.slice(2).filter((argument) => argument !== "--check");
  if (unsupportedArguments.length > 0) {
    throw new Error(`Unsupported arguments: ${unsupportedArguments.join(", ")}`);
  }

  const result = await generateFocusMasks({ check: process.argv.includes("--check") });
  const blockedIds = result.blocked.map(({ lakeId }) => lakeId).sort();
  const expectedBlockedIds = [...LAKE_FOCUS_MASK_BLOCKED_IDS].sort();
  if (JSON.stringify(blockedIds) !== JSON.stringify(expectedBlockedIds)) {
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
