import assert from "node:assert/strict";
import test from "node:test";
import { getLakeFishingStatus } from "./lakeService.js";

const choices = {
  place: "Båt",
  method: "Spinn",
  species: "Gädda",
};

function fact(value, overrides = {}) {
  return {
    value,
    status: "verified",
    ruleType: "rule",
    verifiedAt: "2026-08-09",
    sources: [],
    note: null,
    conditions: null,
    ...overrides,
  };
}

function matchingLake(overrides = {}) {
  return {
    details: {
      watercraft: { boat: fact("allowed") },
      methods: { spin: fact("allowed") },
      species: { knownSpecies: fact(["gädda"]) },
      boat: {},
      ...overrides,
    },
  };
}

test("returns allowed only when place, method and species are verified", () => {
  assert.equal(getLakeFishingStatus(matchingLake(), choices), "allowed");
  assert.equal(
    getLakeFishingStatus(matchingLake({ species: {} }), choices),
    "unknown",
  );
});

test("returns warning for a verified restriction that affects the selected species", () => {
  const lake = matchingLake({
    species: {
      sizeLimits: [fact({ minSizeCm: 50 }, { species: "gadda" })],
    },
  });

  assert.equal(getLakeFishingStatus(lake, choices), "warning");
});

test("does not apply another species restriction to the selected species", () => {
  const lake = matchingLake({
    species: {
      knownSpecies: fact(["gädda"]),
      sizeLimits: [fact({ minSizeCm: 40 }, { species: "gös" })],
    },
  });

  assert.equal(getLakeFishingStatus(lake, choices), "allowed");
});

test("keeps unverified and unsupported choices unknown", () => {
  const unverifiedMethodLake = matchingLake({
    methods: { spin: fact("allowed", { status: "unknown" }) },
  });

  assert.equal(getLakeFishingStatus(unverifiedMethodLake, choices), "unknown");
  assert.equal(
    getLakeFishingStatus(matchingLake(), { ...choices, place: "Land" }),
    "unknown",
  );
});

test("accepts verified boat-specific rules as evidence for boat use", () => {
  const lake = matchingLake({
    watercraft: {},
    boat: { speedLimits: fact(5) },
  });

  assert.equal(getLakeFishingStatus(lake, choices), "warning");
});
