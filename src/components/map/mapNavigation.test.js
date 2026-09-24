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

test("all 24 production lakes have plausible ordered coordinates and safe map zooms", () => {
  assert.equal(Object.keys(lakes).length, 24);

  for (const lake of Object.values(lakes)) {
    assert.equal(
      hasPlausibleSwedishCoordinates(lake.coordinates),
      true,
      `${lake.id} must use [longitude, latitude] inside Sweden`,
    );

    const zoom = getLakeMapZoom(lake.id);
    assert.equal(Number.isFinite(zoom), true, `${lake.id} must have a finite zoom`);
    assert.equal(zoom >= 8 && zoom <= 15, true, `${lake.id} zoom must be useful and safe`);
  }
});

test("lake zoom configuration keeps both current Bunn IDs and no legacy Bunn ID", () => {
  assert.equal(LAKE_MAP_ZOOM_BY_ID.bunn, undefined);
  assert.equal(getLakeMapZoom("bunn-norra-mellersta"), 11);
  assert.equal(getLakeMapZoom("bunn-sodra"), 11);
  assert.equal(getLakeMapZoom("unknown-lake"), DEFAULT_LAKE_MAP_ZOOM);
});

test("Ulvstorpasjön retains its small-lake focus override", () => {
  assert.equal(getLakeMapZoom("ulvstorpasjon"), 14.2);
});

test("pilot lakes have valid real bounds containing their production coordinates", () => {
  assert.deepEqual(getLakeMapBounds("ulvstorpasjon"), [
    [14.0893048, 57.7557063],
    [14.0968151, 57.7583418],
  ]);
  assert.deepEqual(getLakeMapBounds("bolmen"), [
    [13.5648438, 56.7612877],
    [13.8538054, 57.0789265],
  ]);

  for (const id of ["ulvstorpasjon", "bolmen"]) {
    const [[west, south], [east, north]] = getLakeMapBounds(id);
    const [longitude, latitude] = lakes[id].coordinates;

    assert.equal(west < east, true, `${id} must have west before east`);
    assert.equal(south < north, true, `${id} must have south before north`);
    assert.equal(longitude >= west && longitude <= east, true);
    assert.equal(latitude >= south && latitude <= north, true);
    assert.equal(
      LAKE_MAP_BOUNDS_PROVENANCE_BY_ID[id].sourceUrl,
      lakes[id].coordinateSource,
    );
  }
});

test("non-pilot lakes retain center-and-zoom fallback framing", () => {
  assert.equal(getLakeMapBounds("klappasjon"), null);
  assert.equal(getLakeMapZoom("klappasjon"), 13.1);
  assert.equal(getLakeMapBounds("unknown-lake"), null);
  assert.equal(getLakeMapZoom("unknown-lake"), DEFAULT_LAKE_MAP_ZOOM);
});

test("lake bounds fitting uses modest responsive padding", () => {
  assert.equal(getLakeMapFitPadding(1200, 800), 56);
  assert.equal(getLakeMapFitPadding(360, 700), 29);
  assert.equal(getLakeMapFitPadding(0, 0), 32);
});

test("lake maps allow only a modest zoom-out for small, large and fallback lakes", () => {
  assert.equal(getLakeMapMinZoom(getLakeMapZoom("ulvstorpasjon")), 13.45);
  assert.ok(Math.abs(getLakeMapMinZoom(getLakeMapZoom("vattern")) - 7.55) < 1e-9);
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
