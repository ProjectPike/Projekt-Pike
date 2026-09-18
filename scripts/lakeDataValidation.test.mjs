import assert from "node:assert/strict";
import test from "node:test";
import { validateLakeDataState } from "./lakeDataValidation.mjs";

const lake = {
  id: "test-lake",
  name: "Test lake",
  coordinates: [14, 58],
  coordinateSource: "https://example.org/location",
  details: Object.fromEntries([
    "access", "methods", "species", "watercraft", "boat", "practical", "geography", "safety",
  ].map((section) => [section, {}])),
};

const available = (overrides = {}) => ({
  status: "available",
  checkedAt: "2026-09-18",
  provider: "Example FVOF",
  sourceUrl: "https://example.org/depth-map",
  maps: [{ mapNumber: null, formats: [], source: "Example FVOF" }],
  bathymetry: {
    sourceType: "FVO-published depth map",
    processingState: "needs-review",
    georeferencingStatus: "unverified",
    qualityStatus: "needs-review",
    published: false,
  },
  ...overrides,
});

function validate(depth) {
  return validateLakeDataState({
    lakes: { [lake.id]: structuredClone(lake) },
    lakeDepthMapResearch: { [lake.id]: structuredClone(depth) },
    lakePointsByLakeId: {},
    expectedLakeCount: 1,
  });
}

test("existing SMHI available research remains valid", () => {
  const result = validate(available({
    provider: "SMHI Damm- och sjöregister",
    smhiLakeId: "123456-123456",
    sourceUrl: "https://vattenwebb.smhi.se/example/123456-123456",
  }));
  assert.deepEqual(result.errors, []);
});

test("provider-neutral available research is valid without smhiLakeId", () => {
  const record = available();
  assert.equal(Object.hasOwn(record, "smhiLakeId"), false);
  assert.deepEqual(validate(record).errors, []);
});

test("provider-neutral available research accepts explicit null smhiLakeId", () => {
  assert.deepEqual(validate(available({ smhiLakeId: null })).errors, []);
});

test("a provider-neutral record may retain a valid SMHI-style identifier", () => {
  assert.deepEqual(validate(available({ smhiLakeId: "654321-123456" })).errors, []);
});

test("malformed non-null smhiLakeId is rejected", () => {
  for (const smhiLakeId of ["test", "123456123456", 123, undefined]) {
    assert.ok(validate(available({ smhiLakeId })).errors.some((error) =>
      error.includes("depthMapResearch.smhiLakeId")));
  }
});

test("missing and empty providers are rejected for available research", () => {
  const missing = available();
  delete missing.provider;
  assert.ok(validate(missing).errors.some((error) => error.includes("depthMapResearch.provider")));
  assert.ok(validate(available({ provider: "  " })).errors.some((error) =>
    error.includes("depthMapResearch.provider")));
});

test("available research requires an HTTP(S) source URL", () => {
  for (const sourceUrl of [undefined, "not a URL", "ftp://example.org/depth-map"]) {
    assert.ok(validate(available({ sourceUrl })).errors.some((error) =>
      error.includes("depthMapResearch.sourceUrl")));
  }
  assert.deepEqual(validate(available({ sourceUrl: "http://example.org/depth-map" })).errors, []);
});

test("available research requires a non-empty maps material list", () => {
  for (const maps of [undefined, null, []]) {
    assert.ok(validate(available({ maps })).errors.some((error) =>
      error.includes("depthMapResearch.maps")));
  }
});

test("not-found behavior remains unchanged", () => {
  assert.deepEqual(validate({
    status: "not-found",
    checkedAt: "2026-09-18",
    maps: [],
  }).errors, []);
});
