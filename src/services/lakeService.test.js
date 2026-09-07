import assert from "node:assert/strict";
import test from "node:test";
import {
  getLakeFishingStatus,
  getLakeFishingStatusDetails,
} from "./lakeService.js";

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

test("returns diagnostic details through the same matching path", () => {
  const allowed = getLakeFishingStatusDetails(matchingLake(), choices);
  const missingPlace = getLakeFishingStatusDetails(
    matchingLake({ watercraft: {} }),
    choices,
  );
  const missingMultiple = getLakeFishingStatusDetails(
    matchingLake({
      watercraft: {},
      methods: {},
      species: {},
    }),
    choices,
  );
  const warning = getLakeFishingStatusDetails(
    matchingLake({ watercraft: { boat: fact("prohibited") } }),
    choices,
  );

  assert.deepEqual(allowed, { status: "allowed", missing: [] });
  assert.deepEqual(missingPlace, { status: "unknown", missing: ["place"] });
  assert.deepEqual(missingMultiple, {
    status: "unknown",
    missing: ["place", "method", "species"],
  });
  assert.deepEqual(warning, { status: "warning", missing: [] });
  assert.equal(getLakeFishingStatus(matchingLake(), choices), allowed.status);
  assert.equal(
    getLakeFishingStatus(matchingLake({ watercraft: {} }), choices),
    missingPlace.status,
  );
});

test("returns unknown when a selected method or place is missing", () => {
  assert.equal(
    getLakeFishingStatus(matchingLake({ methods: {} }), choices),
    "unknown",
  );
  assert.equal(
    getLakeFishingStatus(matchingLake({ watercraft: {} }), choices),
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

test("keeps unverified choices unknown", () => {
  const unverifiedMethodLake = matchingLake({
    methods: { spin: fact("allowed", { status: "unknown" }) },
  });

  assert.equal(getLakeFishingStatus(unverifiedMethodLake, choices), "unknown");
});

test("returns warnings for verified prohibited places and methods", () => {
  assert.equal(
    getLakeFishingStatus(matchingLake({ watercraft: { boat: fact("prohibited") } }), choices),
    "warning",
  );
  assert.equal(
    getLakeFishingStatus(matchingLake({ methods: { spin: fact("prohibited") } }), choices),
    "warning",
  );
});

test("treats Land as supported with verified method and species", () => {
  assert.equal(
    getLakeFishingStatus(matchingLake(), { ...choices, place: "Land" }),
    "allowed",
  );
});

test("accepts verified boat-specific rules as evidence for boat use", () => {
  const lake = matchingLake({
    watercraft: {},
    boat: { speedLimits: fact(5) },
  });

  assert.equal(getLakeFishingStatus(lake, choices), "warning");
});

test("applies conditional restrictions only while active", () => {
  const lake = matchingLake({
    methods: {
      spin: fact("restricted", {
        conditions: {
          dateFrom: "08-01",
          dateTo: "08-15",
          timeFrom: "06:00",
          timeTo: "21:00",
        },
      }),
    },
  });

  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-08-10T12:00:00")), "warning");
  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-09-01T12:00:00")), "allowed");
});

test("keeps limited allowed fishing hours as a warning for the applicable dates", () => {
  const lake = matchingLake({
    methods: {
      spin: fact("allowed"),
      augustSportFishingHours: fact("allowed", {
        conditions: {
          dateFrom: "08-01",
          dateTo: "08-15",
          timeFrom: "06:00",
          timeTo: "21:00",
        },
      }),
    },
  });

  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-08-10T12:00:00")), "warning");
  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-08-10T22:00:00")), "warning");
  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-09-01T12:00:00")), "allowed");
});

test("evaluates conditional restrictions with time windows crossing midnight", () => {
  const lake = matchingLake({
    methods: {
      spin: fact("restricted", {
        conditions: {
          dateFrom: null,
          dateTo: null,
          timeFrom: "21:00",
          timeTo: "03:00",
        },
      }),
    },
  });

  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-08-10T22:00:00")), "warning");
  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-08-11T02:00:00")), "warning");
  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-08-10T12:00:00")), "allowed");
});

test("evaluates cross-year conditional restrictions", () => {
  const lake = matchingLake({
    methods: {
      spin: fact("restricted", {
        conditions: {
          dateFrom: "10-01",
          dateTo: "01-31",
          timeFrom: null,
          timeTo: null,
        },
      }),
    },
  });

  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-12-01T12:00:00")), "warning");
  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-02-01T12:00:00")), "allowed");
});

test("keeps seasonal trolling prohibitions known outside their active period", () => {
  const lake = matchingLake({
    methods: {
      trolling: fact("prohibited", {
        conditions: {
          dateFrom: "08-01",
          dateTo: "08-15",
          timeFrom: null,
          timeTo: null,
        },
      }),
    },
  });
  const trollingChoices = { ...choices, method: "Trolling" };

  assert.equal(
    getLakeFishingStatus(lake, trollingChoices, new Date("2026-08-10T12:00:00")),
    "warning",
  );
  assert.equal(
    getLakeFishingStatus(lake, trollingChoices, new Date("2026-09-01T12:00:00")),
    "allowed",
  );
});

test("applies species closed seasons only while active", () => {
  const lake = matchingLake({
    species: {
      closedSeasons: [
        fact("prohibited", {
          species: "gadda",
          conditions: {
            dateFrom: "05-01",
            dateTo: "05-31",
            timeFrom: null,
            timeTo: null,
          },
        }),
      ],
    },
  });

  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-05-10T12:00:00")), "warning");
  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-06-01T12:00:00")), "allowed");
});
