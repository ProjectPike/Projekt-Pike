import assert from "node:assert/strict";
import test from "node:test";
import { candidateHash } from "./publishCandidateLake.mjs";
import {
  assessPublishedLakeCompatibility,
  mapPublishedLakeCompatibleFields,
} from "./publishedLakeCompatibility.mjs";

function publication(details = []) {
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
  assert.deepEqual(assessment.requiredExplicitFields, [
    "type", "coordinateSource", "distance", "verification", "fishing",
    "practical", "lakeDepthMapResearch",
  ]);

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
});

test("reports app fields that an incomplete candidate must explicitly supply", () => {
  const input = publication();
  delete input.candidate.region;
  delete input.candidate.counties;
  delete input.candidate.location;
  input.review.candidateHash = candidateHash(input.candidate);

  assert.deepEqual(
    assessPublishedLakeCompatibility(input).requiredExplicitFields.slice(-3),
    ["region", "counties", "coordinates"],
  );
});

test("blocks constructions the current app cannot preserve", () => {
  const cases = [
    [fact("depthMap", "source", { valueType: "text", value: "Map" }), "unsupported-depth-map"],
    [fact("species", "sizeLimits", { valueType: "number", value: 50 }), "unsupported-array-fact"],
    [fact("methods", "futureMethod"), "unsupported-fact-key"],
    [fact("methods", "spin", { conditions: { species: ["Gädda"] } }), "unsupported-selection-condition"],
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
