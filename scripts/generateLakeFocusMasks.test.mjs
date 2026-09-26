import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFocusMaskArtifact,
  extractLakeGeometry,
  MASK_SHELL,
  normalizeRing,
  serializeFocusMaskArtifact,
  stitchWayRings,
} from "./generateLakeFocusMasks.mjs";

function node(id, lon, lat) {
  return { type: "node", id, lon, lat };
}

function way(id, nodes) {
  return { type: "way", id, nodes };
}

function relation(id, members) {
  return {
    type: "relation",
    id,
    version: 3,
    timestamp: "2026-09-26T12:00:00Z",
    members,
  };
}

const relationFraming = {
  osmObjectType: "relation",
  osmObjectId: 99,
  bounds: [[0, 0], [4, 4]],
};

test("closed way becomes one deterministic lake opening", () => {
  const document = {
    elements: [
      node(1, 0, 0),
      node(2, 2, 0),
      node(3, 2, 2),
      node(4, 0, 2),
      { ...way(10, [1, 2, 3, 4, 1]), version: 2, timestamp: "2026-09-26T12:00:00Z" },
    ],
  };
  const geometry = extractLakeGeometry(document, {
    osmObjectType: "way",
    osmObjectId: 10,
  });

  assert.equal(geometry.outerRings.length, 1);
  assert.equal(geometry.innerRings.length, 0);
  assert.deepEqual(geometry.outerRings[0][0], geometry.outerRings[0].at(-1));
});

test("relation ways stitch by node identity despite reversed member direction", () => {
  const rings = stitchWayRings([
    { id: 12, nodes: [3, 4, 1] },
    { id: 10, nodes: [1, 2] },
    { id: 11, nodes: [3, 2] },
  ]);

  assert.deepEqual(rings, [[1, 2, 3, 4, 1]]);
});

test("multiple outer rings and an inner island remain separate and deterministic", () => {
  const elements = [
    node(1, 0, 0), node(2, 2, 0), node(3, 2, 2), node(4, 0, 2),
    node(5, 3, 3), node(6, 4, 3), node(7, 4, 4), node(8, 3, 4),
    node(9, 0.5, 0.5), node(10, 1, 0.5), node(11, 1, 1), node(12, 0.5, 1),
    way(20, [1, 2]), way(21, [3, 2]), way(22, [3, 4, 1]),
    way(23, [5, 6, 7, 8, 5]),
    way(24, [9, 10, 11, 12, 9]),
    relation(99, [
      { type: "way", ref: 23, role: "outer" },
      { type: "way", ref: 22, role: "outer" },
      { type: "way", ref: 20, role: "outer" },
      { type: "way", ref: 21, role: "outer" },
      { type: "way", ref: 24, role: "inner" },
    ]),
  ];

  const first = extractLakeGeometry({ elements }, relationFraming);
  const second = extractLakeGeometry({ elements: [...elements].reverse() }, relationFraming);
  assert.equal(first.outerRings.length, 2);
  assert.equal(first.innerRings.length, 1);
  assert.deepEqual(first, second);

  const artifact = buildFocusMaskArtifact("fixture", relationFraming, first);
  assert.deepEqual(artifact.features[0].geometry.coordinates[0], MASK_SHELL);
  assert.equal(artifact.features[0].geometry.coordinates.length, 3);
  assert.equal(artifact.features[1].geometry.type, "MultiPolygon");
  assert.equal(artifact.features[1].geometry.coordinates.length, 1);
  assert.equal(serializeFocusMaskArtifact(artifact), serializeFocusMaskArtifact(artifact));
});

test("unclosed or ambiguous relation topology is rejected", () => {
  assert.throws(
    () => stitchWayRings([
      { id: 1, nodes: [1, 2] },
      { id: 2, nodes: [2, 3] },
    ]),
    /topology|cannot continue/,
  );
});

test("ring normalization removes consecutive duplicates and enforces winding", () => {
  const clockwise = normalizeRing(
    [[0, 0], [0, 2], [0, 2], [2, 2], [2, 0], [0, 0]],
    { clockwise: true },
  );
  const counterClockwise = normalizeRing(clockwise, { clockwise: false });

  assert.deepEqual(clockwise[0], clockwise.at(-1));
  assert.deepEqual(counterClockwise[0], counterClockwise.at(-1));
  assert.equal(clockwise.length, 5);
  assert.notDeepEqual(clockwise, counterClockwise);
});

test("nested relation members are explicitly unsupported", () => {
  assert.throws(
    () => extractLakeGeometry({
      elements: [relation(99, [{ type: "relation", ref: 100, role: "outer" }])],
    }, relationFraming),
    /unsupported relation member/,
  );
});
