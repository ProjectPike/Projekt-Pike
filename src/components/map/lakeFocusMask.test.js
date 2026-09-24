import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { lakes } from "../../data/lakes.js";
import {
  getLakeFocusMaskUrl,
  LAKE_FOCUS_MASK_COLOR,
  LAKE_FOCUS_MASK_OPACITY,
  LAKE_FOCUS_MASK_URL_BY_ID,
} from "./lakeFocusMask.js";
import {
  getDiscoveryClusterTargetZoom,
  getLakeMapBounds,
  getLakeMapFitPadding,
  getLakeMapLocalConstraint,
} from "./mapNavigation.js";

const PILOT_IDS = ["bolmen", "ulvstorpasjon"];

async function readMask(lakeId) {
  const url = getLakeFocusMaskUrl(lakeId);
  return JSON.parse(
    await readFile(new URL(`../../../public${url}`, import.meta.url), "utf8"),
  );
}

function assertClosedRing(ring) {
  assert.ok(ring.length >= 4);
  assert.deepEqual(ring[0], ring.at(-1));
  for (const coordinate of ring) {
    assert.equal(coordinate.length, 2);
    assert.ok(coordinate.every(Number.isFinite));
  }
}

function pointInRing([longitude, latitude], ring) {
  let inside = false;

  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current++) {
    const [currentLongitude, currentLatitude] = ring[current];
    const [previousLongitude, previousLatitude] = ring[previous];
    const intersects =
      currentLatitude > latitude !== previousLatitude > latitude &&
      longitude <
        ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) +
          currentLongitude;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

test("focus-mask metadata enables exactly the two approved pilot lakes", () => {
  assert.deepEqual(Object.keys(LAKE_FOCUS_MASK_URL_BY_ID).sort(), PILOT_IDS);
  assert.equal(getLakeFocusMaskUrl("bunn"), null);
  assert.equal(getLakeFocusMaskUrl("bunn-norra-mellersta"), null);
  assert.equal(getLakeFocusMaskUrl("sommen"), null);

  for (const lakeId of PILOT_IDS) {
    assert.match(getLakeFocusMaskUrl(lakeId), /^\/lake-focus\/[a-z0-9-]+\.geojson$/);
  }
  assert.match(LAKE_FOCUS_MASK_COLOR, /^#[0-9a-f]{6}$/i);
  assert.equal(LAKE_FOCUS_MASK_OPACITY, 0.62);
});

test("pilot artifacts provide a Sweden shell with a real lake opening", async () => {
  for (const lakeId of PILOT_IDS) {
    const mask = await readMask(lakeId);
    assert.equal(mask.type, "FeatureCollection");
    assert.equal(mask.pike.lakeId, lakeId);
    assert.equal(mask.pike.runtimePublished, undefined);
    assert.equal(mask.features[0].properties.kind, "outside-lake-focus-mask");
    assert.equal(mask.features[0].geometry.type, "Polygon");

    const [shell, ...lakeOpenings] = mask.features[0].geometry.coordinates;
    assertClosedRing(shell);
    assert.ok(lakeOpenings.length >= 1);
    lakeOpenings.forEach(assertClosedRing);
    assert.equal(
      lakeOpenings.some((ring) => pointInRing(lakes[lakeId].coordinates, ring)),
      true,
      `${lakeId} production coordinate must be inside the transparent opening`,
    );
    assert.deepEqual(shell, [
      [5, 54],
      [30, 54],
      [30, 71],
      [5, 71],
      [5, 54],
    ]);
  }
});

test("Bolmen islands are restored as dimmed land while Ulvstorpasjön has none", async () => {
  const bolmen = await readMask("bolmen");
  const ulvstorpasjon = await readMask("ulvstorpasjon");
  const islands = bolmen.features.find(
    (feature) => feature.properties.kind === "lake-islands-focus-mask",
  );

  assert.equal(islands.geometry.type, "MultiPolygon");
  assert.equal(islands.geometry.coordinates.length, 308);
  for (const polygon of islands.geometry.coordinates) {
    assert.equal(polygon.length, 1);
    assertClosedRing(polygon[0]);
  }
  assert.equal(ulvstorpasjon.features.length, 1);
});

test("focus-mask pilot leaves approved framing and discovery policies unchanged", () => {
  assert.deepEqual(getLakeMapBounds("ulvstorpasjon"), [
    [14.0893048, 57.7557063],
    [14.0968151, 57.7583418],
  ]);
  assert.deepEqual(getLakeMapBounds("bolmen"), [
    [13.5648438, 56.7612877],
    [13.8538054, 57.0789265],
  ]);
  assert.equal(getLakeMapFitPadding(360, 700), 29);
  assert.deepEqual(
    getLakeMapLocalConstraint(12.5, [
      [14, 57],
      [15, 58],
    ]),
    {
      minZoom: 11.75,
      maxBounds: [
        [13.6, 56.6],
        [15.4, 58.4],
      ],
    },
  );
  assert.equal(getDiscoveryClusterTargetZoom(10, 7.4), 11.2);
  assert.equal(Object.keys(lakes).length, 24);
});
