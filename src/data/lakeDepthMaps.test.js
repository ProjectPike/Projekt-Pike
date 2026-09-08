import assert from "node:assert/strict";
import test from "node:test";
import {
  getLakeBathymetryStatus,
  getLakeDepthMap,
} from "./lakeDepthMaps.js";

test("exposes only verified and published bathymetry", () => {
  assert.equal(getLakeDepthMap("hokesjon")?.dataUrl, "/bathymetry/hokesjon.geojson");
  assert.equal(getLakeDepthMap("knipesjon")?.dataUrl, "/bathymetry/knipesjon.geojson");
  assert.equal(getLakeDepthMap("munksjon")?.dataUrl, "/bathymetry/munksjon.geojson");
  assert.equal(getLakeDepthMap("svansjon")?.dataUrl, "/bathymetry/svansjon.geojson");
  assert.equal(getLakeDepthMap("tenhultasjon"), null);
  assert.equal(getLakeDepthMap("bolmen"), null);
  assert.equal(getLakeDepthMap("klappasjon"), null);
});

test("distinguishes review data from unavailable data", () => {
  assert.equal(getLakeBathymetryStatus("bolmen").state, "needs-review");
  assert.equal(getLakeBathymetryStatus("ulvstorpasjon").state, "unavailable");
  assert.equal(getLakeBathymetryStatus("hokesjon").state, "published");
  assert.equal(getLakeBathymetryStatus("munksjon").state, "published");
  assert.equal(getLakeBathymetryStatus("svansjon").state, "published");
  assert.equal(getLakeBathymetryStatus("tenhultasjon").state, "needs-review");
});
