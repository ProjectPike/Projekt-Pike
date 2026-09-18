import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { candidateHash } from "./publishCandidateLake.mjs";
import {
  assessPublishedLakeCompatibility,
  mapPublishedLakeCompatibleFields,
} from "./publishedLakeCompatibility.mjs";

function appIntegration() {
  return JSON.parse(readFileSync(new URL("./fixtures/candidate-app.json", import.meta.url), "utf8")).app;
}

function publication(details = [], includeApp = true) {
  const candidate = {
    schemaVersion: 1,
    id: "synthetic-lake",
    name: "Synthetic lake",
    region: "Småland",
    counties: ["Jönköping"],
    sources: [{
      id: "rules",
      type: "authority",
      title: "Synthetic authority",
      url: "https://example.org/rules",
      checkedAt: "2026-09-10",
    }],
    location: {
      coordinates: [14, 57],
      sources: ["rules"],
      verifiedAt: "2026-09-10",
    },
    details,
    ...(includeApp ? { app: appIntegration() } : {}),
  };
  return {
    schemaVersion: 1,
    candidate,
    review: {
      schemaVersion: 1,
      candidateId: candidate.id,
      decision: "approved",
      reviewer: "Test reviewer",
      reviewedAt: "2026-09-10",
      hashStrategy: "sha256-canonical-json-v1",
      candidateHash: candidateHash(candidate),
    },
  };
}

function fact(section, key, overrides = {}) {
  return {
    section,
    key,
    valueType: "state",
    value: "allowed",
    status: "verified",
    ruleType: "rule",
    sources: ["rules"],
    verifiedAt: "2026-09-10",
    ...overrides,
  };
}

test("maps only compatible candidate fields and expands source references", () => {
  const input = publication([
    fact("methods", "spin", { conditions: { dateFrom: "05-01", dateTo: "05-31" } }),
    fact("species", "knownSpecies", {
      valueType: "string-list",
      value: ["gädda", "abborre"],
      ruleType: "advisory",
    }),
  ]);

  const assessment = assessPublishedLakeCompatibility(input);
  assert.equal(assessment.compatible, true);
  assert.deepEqual(assessment.requiredExplicitFields, []);

  const mapped = mapPublishedLakeCompatibleFields(input);
  assert.deepEqual(mapped.coordinates, [14, 57]);
  assert.deepEqual(mapped.details.methods.spin.sources, [
    { url: "https://example.org/rules", type: "authority" },
  ]);
  assert.deepEqual(mapped.details.methods.spin.conditions, {
    dateFrom: "05-01",
    dateTo: "05-31",
    timeFrom: null,
    timeTo: null,
  });
  assert.deepEqual(mapped.details.access, {});
  assert.deepEqual(mapped.fishing, input.candidate.app.fishing);
  assert.deepEqual(mapped.practical, input.candidate.app.practical);
  assert.deepEqual(mapped.lakeDepthMapResearch, input.candidate.app.lakeDepthMapResearch);
});

test("maps generic rod, chumming and floating-craft facts without semantic aliases", () => {
  const input = publication([
    fact("methods", "maxRodsPerPerson", { valueType: "number", value: 2 }),
    fact("methods", "chumming"),
    fact("watercraft", "floatingCraft", { value: "prohibited" }),
  ]);

  const assessment = assessPublishedLakeCompatibility(input);
  assert.equal(assessment.compatible, true);

  const mapped = mapPublishedLakeCompatibleFields(input);
  assert.equal(mapped.details.methods.maxRodsPerPerson.value, 2);
  assert.equal(mapped.details.methods.maxRodsPerPerson.valueType, undefined);
  assert.equal(Object.hasOwn(mapped.details.methods, "maxRodsPerPermit"), false);
  assert.equal(mapped.details.methods.chumming.value, "allowed");
  assert.equal(mapped.details.watercraft.floatingCraft.value, "prohibited");
  for (const key of ["boat", "kayak", "floatTube"]) {
    assert.equal(Object.hasOwn(mapped.details.watercraft, key), false, key);
  }

  const prohibitedChumming = mapPublishedLakeCompatibleFields(publication([
    fact("methods", "chumming", { value: "prohibited" }),
  ]));
  assert.equal(prohibitedChumming.details.methods.chumming.value, "prohibited");
});

test("maps membership requirement without creating permit semantics", () => {
  const input = publication([
    fact("access", "membershipRequirement", {
      valueType: "text",
      value: "required",
    }),
  ]);

  assert.equal(assessPublishedLakeCompatibility(input).compatible, true);
  const mapped = mapPublishedLakeCompatibleFields(input);
  assert.equal(mapped.details.access.membershipRequirement.value, "required");
  for (const key of [
    "permitRequirement", "permitCost", "permitProducts", "purchase",
  ]) {
    assert.equal(Object.hasOwn(mapped.details.access, key), false, key);
  }

  const permitInput = publication([fact("access", "permitRequirement")]);
  assert.equal(
    mapPublishedLakeCompatibleFields(permitInput).details.access.permitRequirement.value,
    "allowed",
  );
});

test("maps permit-method support without inventing method facts", () => {
  const value = [
    { permitType: "ordinary-open-water", methods: ["spin", "fly"] },
    { permitType: "ice-fishing", methods: ["ice"] },
  ];
  const input = publication([
    fact("access", "permitMethodSupport", {
      valueType: "permit-method-support",
      value,
    }),
  ]);

  assert.equal(assessPublishedLakeCompatibility(input).compatible, true);
  const mapped = mapPublishedLakeCompatibleFields(input);
  assert.deepEqual(mapped.details.access.permitMethodSupport.value, value);
  assert.deepEqual(mapped.details.methods, {});
});

test("reports app fields that an incomplete candidate must explicitly supply", () => {
  const input = publication([], false);
  delete input.candidate.region;
  delete input.candidate.counties;
  delete input.candidate.location;
  input.review.candidateHash = candidateHash(input.candidate);

  const result = assessPublishedLakeCompatibility(input);
  assert.equal(result.compatible, false);
  assert.deepEqual(result.requiredExplicitFields, [
    "type", "coordinateSource", "verification", "fishing",
    "practical", "lakeDepthMapResearch", "region", "counties", "coordinates",
  ]);
  assert.equal(
    result.blockers.filter(({ code }) => code === "missing-explicit-field").length,
    9,
  );
});

test("distance is optional but remains strictly validated and preserved when supplied", () => {
  const input = publication();
  delete input.candidate.app.distance;
  input.review.candidateHash = candidateHash(input.candidate);
  const missing = assessPublishedLakeCompatibility(input);
  assert.equal(missing.compatible, true);
  const mappedMissing = mapPublishedLakeCompatibleFields(input);
  assert.equal(Object.hasOwn(mappedMissing, "distance"), false);

  const supplied = publication();
  const mappedSupplied = mapPublishedLakeCompatibleFields(supplied);
  assert.deepEqual(mappedSupplied.distance, supplied.candidate.app.distance);

  const malformed = publication();
  malformed.candidate.app.distance = { kilometers: -1, travelTime: "1 min" };
  malformed.review.candidateHash = candidateHash(malformed.candidate);
  assert.equal(assessPublishedLakeCompatibility(malformed).compatible, false);
});

test("reports one missing reviewed integration field exactly", () => {
  const input = publication();
  delete input.candidate.app.fishing;
  input.review.candidateHash = candidateHash(input.candidate);
  const result = assessPublishedLakeCompatibility(input);

  assert.equal(result.compatible, false);
  assert.deepEqual(result.requiredExplicitFields, ["fishing"]);
  assert.deepEqual(
    result.blockers.find(({ code }) => code === "missing-explicit-field"),
    {
      code: "missing-explicit-field",
      path: "$.candidate.app.fishing",
      message: "fishing must be explicitly reviewed for app integration",
    },
  );
});

test("blocks constructions the current app cannot preserve", () => {
  const cases = [
    [fact("depthMap", "source", { valueType: "text", value: "Map" }), "unsupported-depth-map"],
    [fact("species", "sizeLimits", { valueType: "number", value: 50 }), "unsupported-array-fact"],
    [fact("access", "futureAccessFact", { valueType: "text", value: "required" }), "unsupported-fact-key"],
    [fact("methods", "futureMethod"), "unsupported-fact-key"],
    [fact("methods", "spin", { conditions: { species: ["Gädda"] } }), "unsupported-selection-condition"],
    [fact("methods", "spin", { conditions: { method: ["Trolling"] } }), "unsupported-selection-condition"],
    [fact("methods", "spin", { conditions: { place: ["Båt"] } }), "unsupported-selection-condition"],
  ];

  for (const [candidateFact, code] of cases) {
    const result = assessPublishedLakeCompatibility(publication([candidateFact]));
    assert.equal(result.compatible, false, code);
    assert.ok(result.blockers.some((entry) => entry.code === code), code);
    assert.throws(() => mapPublishedLakeCompatibleFields(publication([candidateFact])), code);
  }
});

test("blocks multiple condition variants for an app singleton", () => {
  const input = publication([
    fact("methods", "spin", { conditions: { dateFrom: "05-01" } }),
    fact("methods", "spin", { conditions: { dateFrom: "06-01" } }),
  ]);
  const result = assessPublishedLakeCompatibility(input);

  assert.equal(result.compatible, false);
  assert.ok(result.blockers.some(({ code }) => code === "multiple-singleton-facts"));
});

test("requires an intact approved hash-bound published wrapper", () => {
  const input = publication([fact("watercraft", "boat")]);
  input.candidate.name = "Changed after review";
  const result = assessPublishedLakeCompatibility(input);

  assert.equal(result.compatible, false);
  assert.ok(result.blockers.some(({ code }) => code === "review-hash-mismatch"));
  assert.deepEqual(result.safeMappings, []);
  assert.deepEqual(result.requiredExplicitFields, []);
});

test("blocks candidate value types that change current app fact semantics", () => {
  const input = publication([
    fact("species", "knownSpecies", { valueType: "text", value: "gädda" }),
  ]);
  const result = assessPublishedLakeCompatibility(input);

  assert.equal(result.compatible, false);
  assert.ok(result.blockers.some(({ code }) => code === "unsupported-value-type"));
});

test("preserves unknown domain semantics without deriving app permissions", () => {
  const input = publication([
    fact("methods", "spin", {
      value: "unknown",
      status: "unknown",
      ruleType: null,
      sources: [],
      verifiedAt: null,
    }),
  ]);

  assert.deepEqual(mapPublishedLakeCompatibleFields(input).details.methods.spin, {
    value: "unknown",
    status: "unknown",
    ruleType: null,
    verifiedAt: null,
    sources: [],
    note: null,
    conditions: null,
  });
});
