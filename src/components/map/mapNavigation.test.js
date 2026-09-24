import test from "node:test";
import assert from "node:assert/strict";
import { lakes } from "../../data/lakes.js";
import {
  getLakePointLayers,
  getLakePoints,
  getPointTypes,
  lakePointsByLakeId,
} from "../../data/lakePoints.js";
import {
  DEFAULT_LAKE_MAP_ZOOM,
  LAKE_MAP_BOUNDS_BY_ID,
  LAKE_MAP_BOUNDS_MARGIN,
  LAKE_MAP_BOUNDS_PROVENANCE_BY_ID,
  LAKE_MAP_ZOOM_BY_ID,
  expandLakeMapBounds,
  getDiscoveryClusterTargetZoom,
  getLakeMapBounds,
  getLakeMapFitPadding,
  getLakeMapLocalConstraint,
  getLakeMapMinZoom,
  getLakeMapZoom,
  hasPlausibleSwedishCoordinates,
} from "./mapNavigation.js";

test("all 24 production lakes have plausible ordered coordinates and safe framing", () => {
  assert.equal(Object.keys(lakes).length, 24);

  for (const lake of Object.values(lakes)) {
    assert.equal(
      hasPlausibleSwedishCoordinates(lake.coordinates),
      true,
      `${lake.id} must use [longitude, latitude] inside Sweden`,
    );

    if (!getLakeMapBounds(lake.id)) {
      const zoom = getLakeMapZoom(lake.id);
      assert.equal(Number.isFinite(zoom), true, `${lake.id} must have a finite zoom`);
      assert.equal(zoom >= 8 && zoom <= 15, true, `${lake.id} zoom must be useful and safe`);
    }
  }
});

test("only unresolved Bunn entities retain explicit fallback zooms", () => {
  assert.deepEqual(Object.keys(LAKE_MAP_ZOOM_BY_ID).sort(), [
    "bunn-norra-mellersta",
    "bunn-sodra",
  ]);
  assert.equal(LAKE_MAP_ZOOM_BY_ID.bunn, undefined);
  assert.equal(getLakeMapZoom("bunn-norra-mellersta"), 11);
  assert.equal(getLakeMapZoom("bunn-sodra"), 11);
  assert.equal(getLakeMapZoom("unknown-lake"), DEFAULT_LAKE_MAP_ZOOM);
});

test("approved pilot lake bounds remain exact", () => {
  assert.deepEqual(getLakeMapBounds("ulvstorpasjon"), [
    [14.0893048, 57.7557063],
    [14.0968151, 57.7583418],
  ]);
  assert.deepEqual(getLakeMapBounds("bolmen"), [
    [13.5648438, 56.7612877],
    [13.8538054, 57.0789265],
  ]);
});

test("22 resolved production lakes have valid bounds and OSM provenance", () => {
  const resolvedIds = Object.keys(LAKE_MAP_BOUNDS_BY_ID);

  assert.equal(resolvedIds.length, 22);
  assert.deepEqual(
    Object.keys(lakes).filter((id) => !getLakeMapBounds(id)),
    ["bunn-norra-mellersta", "bunn-sodra"],
  );

  for (const id of resolvedIds) {
    const bounds = getLakeMapBounds(id);
    const provenance = LAKE_MAP_BOUNDS_PROVENANCE_BY_ID[id];
    assert.equal(bounds.length, 2, `${id} must have two bounds corners`);
    assert.equal(bounds[0].length, 2, `${id} southwest corner must be a pair`);
    assert.equal(bounds[1].length, 2, `${id} northeast corner must be a pair`);

    const [[west, south], [east, north]] = bounds;
    const [longitude, latitude] = lakes[id].coordinates;

    for (const value of [west, south, east, north]) {
      assert.equal(Number.isFinite(value), true, `${id} bounds must be finite`);
    }
    assert.equal(west < east, true, `${id} must have west before east`);
    assert.equal(south < north, true, `${id} must have south before north`);
    assert.equal(west >= 10 && east <= 25, true, `${id} longitude must be plausible`);
    assert.equal(south >= 55 && north <= 70, true, `${id} latitude must be plausible`);
    assert.equal(longitude >= west && longitude <= east, true);
    assert.equal(latitude >= south && latitude <= north, true);
    assert.equal(["way", "relation"].includes(provenance.osmObjectType), true);
    assert.equal(Number.isInteger(provenance.osmObjectId), true);
    assert.equal(provenance.osmObjectId > 0, true);
    assert.match(provenance.sourceUrl, /^https:\/\/www\.openstreetmap\.org\/(way|relation)\/\d+$/);
    assert.equal(provenance.retrievedAt, "2026-09-24");

    if (lakes[id].coordinateSource.startsWith("https://www.openstreetmap.org/")) {
      assert.equal(provenance.sourceUrl, lakes[id].coordinateSource);
    }
  }
});

test("Bunn split entities and unknown lakes retain center-and-zoom fallback framing", () => {
  assert.equal(getLakeMapBounds("bunn"), null);
  assert.equal(getLakeMapBounds("bunn-norra-mellersta"), null);
  assert.equal(getLakeMapBounds("bunn-sodra"), null);
  assert.equal(getLakeMapZoom("bunn-norra-mellersta"), 11);
  assert.equal(getLakeMapZoom("bunn-sodra"), 11);
  assert.equal(getLakeMapBounds("unknown-lake"), null);
  assert.equal(getLakeMapZoom("unknown-lake"), DEFAULT_LAKE_MAP_ZOOM);
});

test("lake bounds fitting uses modest responsive padding", () => {
  assert.equal(getLakeMapFitPadding(1200, 800), 56);
  assert.equal(getLakeMapFitPadding(360, 700), 29);
  assert.equal(getLakeMapFitPadding(0, 0), 32);
});

test("lake maps allow only a modest zoom-out for small, large and fallback lakes", () => {
  assert.equal(getLakeMapMinZoom(14.2), 13.45);
  assert.ok(Math.abs(getLakeMapMinZoom(8.3) - 7.55) < 1e-9);
  assert.equal(getLakeMapMinZoom(getLakeMapZoom("unknown-lake")), 11.25);
});

test("lake-map working bounds expand the rendered viewport symmetrically", () => {
  assert.equal(LAKE_MAP_BOUNDS_MARGIN, 0.4);
  assert.deepEqual(
    expandLakeMapBounds([
      [14, 57],
      [15, 58],
    ]),
    [
      [13.6, 56.6],
      [15.4, 58.4],
    ],
  );
});

test("wide-lake local constraints derive from the fitted portrait viewport", () => {
  const realWideLakeBounds = [
    [14, 57],
    [15, 57.2],
  ];
  const fittedPortraitViewportBounds = [
    [13.95, 56.2],
    [15.05, 58],
  ];
  const constraint = getLakeMapLocalConstraint(
    12.5,
    fittedPortraitViewportBounds,
  );

  assert.equal(constraint.minZoom, 11.75);
  assert.deepEqual(
    constraint.maxBounds,
    expandLakeMapBounds(fittedPortraitViewportBounds),
  );
  assert.notDeepEqual(
    constraint.maxBounds,
    expandLakeMapBounds(realWideLakeBounds),
  );
});

test("discovery cluster zoom remains accelerated and capped", () => {
  assert.equal(getDiscoveryClusterTargetZoom(8, 7.4), 9.4);
  assert.equal(getDiscoveryClusterTargetZoom(10, 7.4), 11.2);
  assert.equal(getDiscoveryClusterTargetZoom(13.5, 12), 14);
});

test("all stored practical points have safe coordinates and supported map layers", () => {
  const supportedTypes = new Set([
    "boat-ramp",
    "parking",
    "bathing-area",
    "shore-access",
    "boat-rental",
  ]);

  for (const [lakeId, points] of Object.entries(lakePointsByLakeId)) {
    assert.equal(lakes[lakeId]?.id, lakeId, `${lakeId} must be a production lake`);

    for (const point of points) {
      assert.equal(
        hasPlausibleSwedishCoordinates(point.coordinates),
        true,
        `${point.id} must use [longitude, latitude] inside Sweden`,
      );

      for (const type of getPointTypes(point)) {
        assert.equal(supportedTypes.has(type), true, `${point.id} has unsupported type ${type}`);
      }
    }

    const layeredPointIds = new Set(
      getLakePointLayers(lakeId).flatMap((layer) => layer.points.map((point) => point.id)),
    );

    for (const point of getLakePoints(lakeId)) {
      assert.equal(layeredPointIds.has(point.id), true, `${point.id} must render in a POI layer`);
    }
  }
});
