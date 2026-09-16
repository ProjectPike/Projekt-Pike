import assert from "node:assert/strict";
import test from "node:test";
import {
  getLakeFishingStatus,
  getLakeFishingStatusDetails,
  getLakeFishingSelectionDetails,
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

test("keeps an empty selection outside matching", () => {
  assert.deepEqual(getLakeFishingSelectionDetails(matchingLake()), {
    status: null,
    hasUnknownSelections: false,
    categories: { place: [], method: [], species: [] },
  });
});

test("evaluates one optional selected category", () => {
  const result = getLakeFishingSelectionDetails(matchingLake(), {
    species: ["Gädda"],
  });

  assert.equal(result.status, "allowed");
  assert.equal(result.hasUnknownSelections, false);
  assert.deepEqual(result.categories.species, [
    { choice: "Gädda", status: "allowed", missing: [] },
  ]);
  assert.deepEqual(result.categories.place, []);
  assert.deepEqual(result.categories.method, []);
});

test("uses OR for multiple selected values in a category", () => {
  const result = getLakeFishingSelectionDetails(matchingLake(), {
    species: ["Gädda", "Öring"],
  });

  assert.equal(result.status, "allowed");
  assert.equal(result.hasUnknownSelections, true);
  assert.deepEqual(result.categories.species, [
    { choice: "Gädda", status: "allowed", missing: [] },
    { choice: "Öring", status: "unknown", missing: ["species"] },
  ]);
});

test("keeps selected warnings visible without converting unknown selections", () => {
  const result = getLakeFishingSelectionDetails(
    matchingLake({ watercraft: { boat: fact("prohibited") } }),
    {
      place: ["Land", "Båt"],
      species: ["Gädda", "Öring"],
    },
  );

  assert.equal(result.status, "warning");
  assert.equal(result.hasUnknownSelections, true);
  assert.deepEqual(result.categories.place, [
    { choice: "Land", status: "allowed", missing: [] },
    { choice: "Båt", status: "warning", missing: [] },
  ]);
  assert.deepEqual(result.categories.species.at(-1), {
    choice: "Öring",
    status: "unknown",
    missing: ["species"],
  });
});

test("returns unknown when every selected alternative lacks support", () => {
  const result = getLakeFishingSelectionDetails(matchingLake({ methods: {} }), {
    method: ["Trolling", "Flugfiske"],
  });

  assert.equal(result.status, "unknown");
  assert.equal(result.hasUnknownSelections, true);
});

test("returns warning when every selected alternative has a verified restriction", () => {
  const result = getLakeFishingSelectionDetails(
    matchingLake({
      methods: {
        spin: fact("prohibited"),
        bait: fact("restricted"),
      },
    }),
    { method: ["Spinn", "Mete"] },
  );

  assert.equal(result.status, "warning");
  assert.equal(result.hasUnknownSelections, false);
});

test("infers lightweight watercraft support only from a verified allowed boat", () => {
  const lake = matchingLake({ watercraft: { boat: fact("allowed") } });

  assert.deepEqual(
    getLakeFishingSelectionDetails(lake, { place: ["Kajak"] }).categories.place,
    [{ choice: "Kajak", status: "allowed", missing: [], inferred: true }],
  );
  assert.deepEqual(
    getLakeFishingSelectionDetails(lake, { place: ["Flytring"] }).categories.place,
    [{ choice: "Flytring", status: "allowed", missing: [], inferred: true }],
  );
  assert.deepEqual(
    getLakeFishingSelectionDetails(
      matchingLake({ watercraft: { boat: fact("allowed"), kayak: fact("unknown") } }),
      { place: ["Kajak"] },
    ).categories.place,
    [{ choice: "Kajak", status: "allowed", missing: [], inferred: true }],
  );
});

test("gives explicit lightweight watercraft facts precedence over boat inference", () => {
  const boatAllowed = fact("allowed");

  assert.deepEqual(
    getLakeFishingSelectionDetails(
      matchingLake({ watercraft: { boat: boatAllowed, kayak: fact("prohibited") } }),
      { place: ["Kajak"] },
    ).categories.place,
    [{ choice: "Kajak", status: "warning", missing: [] }],
  );
  assert.deepEqual(
    getLakeFishingSelectionDetails(
      matchingLake({ watercraft: { boat: boatAllowed, floatTube: fact("restricted") } }),
      { place: ["Flytring"] },
    ).categories.place,
    [{ choice: "Flytring", status: "warning", missing: [] }],
  );
  assert.deepEqual(
    getLakeFishingSelectionDetails(
      matchingLake({
        watercraft: { boat: boatAllowed, kayak: fact("prohibited", { status: "unverified" }) },
      }),
      { place: ["Kajak"] },
    ).categories.place,
    [{ choice: "Kajak", status: "unknown", missing: ["place"] }],
  );
  assert.deepEqual(
    getLakeFishingSelectionDetails(
      matchingLake({ watercraft: { boat: fact("allowed"), kayak: fact("allowed") } }),
      { place: ["Kajak"] },
    ).categories.place,
    [{ choice: "Kajak", status: "allowed", missing: [] }],
  );
});

test("does not infer lightweight watercraft from prohibited, restricted, or unknown boats", () => {
  for (const boatValue of ["prohibited", "restricted", "unknown"]) {
    assert.deepEqual(
      getLakeFishingSelectionDetails(
        matchingLake({ watercraft: { boat: fact(boatValue) } }),
        { place: ["Kajak"] },
      ).categories.place,
      [{ choice: "Kajak", status: "unknown", missing: ["place"] }],
    );
  }
});

test("does not inherit boat-specific warnings into inferred lightweight watercraft", () => {
  const result = getLakeFishingSelectionDetails(
    matchingLake({
      watercraft: { boat: fact("allowed") },
      boat: { speedLimits: fact(5) },
    }),
    { place: ["Kajak"] },
  );

  assert.deepEqual(result.categories.place, [
    { choice: "Kajak", status: "allowed", missing: [], inferred: true },
  ]);
});

test("keeps Båt as a warning for verified administrative boat requirements", () => {
  const requirements = {
    fvoNotificationRequirement: fact("required"),
    boatMarkingRequirement: fact("required"),
  };

  for (const boat of [
    { fvoNotificationRequirement: requirements.fvoNotificationRequirement },
    { boatMarkingRequirement: requirements.boatMarkingRequirement },
    requirements,
  ]) {
    assert.deepEqual(
      getLakeFishingSelectionDetails(
        matchingLake({ watercraft: { boat: fact("allowed") }, boat }),
        { place: ["Båt"] },
      ).categories.place,
      [{ choice: "Båt", status: "warning", missing: [] }],
    );
  }
});

test("does not apply Båt administrative requirements to inferred lightweight watercraft", () => {
  const result = getLakeFishingSelectionDetails(
    matchingLake({
      watercraft: { boat: fact("allowed") },
      boat: {
        fvoNotificationRequirement: fact("required"),
        boatMarkingRequirement: fact("required"),
      },
    }),
    { place: ["Kajak", "Flytring"] },
  );

  assert.deepEqual(result.categories.place, [
    { choice: "Kajak", status: "allowed", missing: [], inferred: true },
    { choice: "Flytring", status: "allowed", missing: [], inferred: true },
  ]);
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

test("matches additional selectable species from verified lake presence", () => {
  const lake = matchingLake({
    species: { knownSpecies: fact(["mört", "lake", "regnbage", "gers"]) },
  });

  for (const species of ["Mört", "Lake", "Regnbåge", "Gärs"]) {
    assert.equal(
      getLakeFishingStatus(lake, { ...choices, species }),
      "allowed",
    );
  }
});

test("matches comma-separated species restrictions and salmonid groups", () => {
  const lake = matchingLake({
    species: {
      knownSpecies: fact(["röding", "lax", "regnbåge"]),
      sizeLimits: [
        fact({ minSizeCm: 50 }, { species: "röding,öring,lax" }),
        fact({ minSizeCm: 40 }, { speciesGroup: "laxartad" }),
      ],
    },
  });

  for (const species of ["Röding", "Lax", "Regnbåge"]) {
    assert.equal(
      getLakeFishingStatus(lake, { ...choices, species }),
      "warning",
    );
  }
});

test("species groups warn only for species with independent presence evidence", () => {
  const lake = matchingLake({
    species: {
      knownSpecies: fact(["röding", "öring"]),
      bagLimits: [fact({ maxPerDay: 2 }, { speciesGroup: "laxartad" })],
    },
  });
  const result = getLakeFishingSelectionDetails(lake, {
    species: ["Röding", "Öring", "Lax", "Regnbåge"],
  });

  assert.deepEqual(result.categories.species, [
    { choice: "Röding", status: "warning", missing: [] },
    { choice: "Öring", status: "warning", missing: [] },
    { choice: "Lax", status: "unknown", missing: ["species"] },
    { choice: "Regnbåge", status: "unknown", missing: ["species"] },
  ]);
});

test("direct species restrictions still establish normalized species support", () => {
  const lake = matchingLake({
    species: {
      sizeLimits: [
        fact({ minSizeCm: 50 }, { species: "gadda" }),
        fact({ minSizeCm: 40 }, { species: "gös" }),
      ],
    },
  });
  const result = getLakeFishingSelectionDetails(lake, {
    species: ["Gädda", "Abborre"],
  });

  assert.deepEqual(result.categories.species, [
    { choice: "Gädda", status: "warning", missing: [] },
    { choice: "Abborre", status: "unknown", missing: ["species"] },
  ]);
});

test("stocked salmonids receive group warnings without broadening presence", () => {
  const lake = matchingLake({
    species: {
      stockedSportFish: fact(["regnbage"]),
      bagLimits: [fact({ maxPerDay: 2 }, { speciesGroup: "laxartad" })],
    },
  });
  const result = getLakeFishingSelectionDetails(lake, {
    species: ["Regnbåge", "Lax"],
  });

  assert.deepEqual(result.categories.species, [
    { choice: "Regnbåge", status: "warning", missing: [] },
    { choice: "Lax", status: "unknown", missing: ["species"] },
  ]);
});

test("inactive group restrictions neither warn nor establish presence", () => {
  const lake = matchingLake({
    species: {
      knownSpecies: fact(["röding"]),
      bagLimits: [fact({ maxPerDay: 2 }, {
        speciesGroup: "laxartad",
        conditions: {
          dateFrom: "06-01",
          dateTo: "08-31",
          timeFrom: null,
          timeTo: null,
        },
      })],
    },
  });
  const result = getLakeFishingSelectionDetails(
    lake,
    { species: ["Röding", "Lax"] },
    new Date("2026-11-15T12:00:00Z"),
  );

  assert.deepEqual(result.categories.species, [
    { choice: "Röding", status: "allowed", missing: [] },
    { choice: "Lax", status: "unknown", missing: ["species"] },
  ]);
});

test("array and compound species groups never establish presence", () => {
  const lake = matchingLake({
    species: {
      bagLimits: [
        fact({ maxPerDay: 2 }, { speciesGroup: ["röding", "öring", "lax"] }),
        fact({ maxPerDay: 4 }, { speciesGroup: "gädda+gös" }),
      ],
    },
  });
  const result = getLakeFishingSelectionDetails(lake, {
    species: ["Röding", "Öring", "Lax", "Gädda", "Gös"],
  });

  assert.deepEqual(result.categories.species, [
    { choice: "Röding", status: "unknown", missing: ["species"] },
    { choice: "Öring", status: "unknown", missing: ["species"] },
    { choice: "Lax", status: "unknown", missing: ["species"] },
    { choice: "Gädda", status: "unknown", missing: ["species"] },
    { choice: "Gös", status: "unknown", missing: ["species"] },
  ]);
});

test("species-group evidence does not affect method or place matching", () => {
  const lake = matchingLake({
    species: {
      bagLimits: [fact({ maxPerDay: 2 }, { speciesGroup: "laxartad" })],
    },
  });
  const result = getLakeFishingSelectionDetails(lake, {
    place: ["Båt"],
    method: ["Spinn"],
  });

  assert.deepEqual(result.categories.place, [
    { choice: "Båt", status: "allowed", missing: [] },
  ]);
  assert.deepEqual(result.categories.method, [
    { choice: "Spinn", status: "allowed", missing: [] },
  ]);
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
  assert.equal(
    getLakeFishingStatus(
      matchingLake({
        watercraft: { boat: fact("prohibited") },
        species: {},
      }),
      choices,
    ),
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

test("treats a verified hand-gear-only rule as support for hand-gear methods", () => {
  const lake = matchingLake({
    methods: { handGearOnly: fact("restricted") },
  });

  assert.equal(getLakeFishingStatus(lake, choices), "warning");
});

test("does not treat advisory or recommendation facts as method permission", () => {
  for (const [key, method] of [
    ["spin", "Spinn"],
    ["trolling", "Trolling"],
  ]) {
    for (const ruleType of ["advisory", "recommendation"]) {
      const lake = matchingLake({
        methods: { [key]: fact("allowed", { ruleType }) },
      });

      assert.equal(
        getLakeFishingStatus(lake, { ...choices, method }),
        "unknown",
      );
    }
  }
});

test("infers only baseline Spinn from a normative permit requirement", () => {
  const lake = matchingLake({
    access: { permitRequirement: fact("required") },
    methods: {},
  });
  const result = getLakeFishingSelectionDetails(lake, {
    method: ["Spinn", "Mete", "Flugfiske", "Trolling"],
  });

  assert.deepEqual(result.categories.method, [
    { choice: "Spinn", status: "allowed", missing: [], inferred: true },
    { choice: "Mete", status: "unknown", missing: ["method"] },
    { choice: "Flugfiske", status: "unknown", missing: ["method"] },
    { choice: "Trolling", status: "unknown", missing: ["method"] },
  ]);
});

test("scoped permit support binds ordinary and ice permits to exact methods", () => {
  const permitMethodSupport = fact([
    { permitType: "ordinary-open-water", methods: ["spin", "fly"] },
    { permitType: "ice-fishing", methods: ["ice"] },
  ]);
  const lake = matchingLake({
    access: {
      permitRequirement: fact("required"),
      permitMethodSupport,
    },
    methods: {},
  });

  assert.deepEqual(
    getLakeFishingSelectionDetails(lake, {
      method: ["Spinn", "Flugfiske", "Pimpelfiske", "Mete", "Trolling"],
    }).categories.method,
    [
      { choice: "Spinn", status: "allowed", missing: [], inferred: true },
      { choice: "Flugfiske", status: "allowed", missing: [], inferred: true },
      { choice: "Pimpelfiske", status: "allowed", missing: [], inferred: true },
      { choice: "Mete", status: "unknown", missing: ["method"] },
      { choice: "Trolling", status: "unknown", missing: ["method"] },
    ],
  );
  assert.equal(permitMethodSupport.conditions, null);
});

test("an ice-only permit never becomes ordinary-method evidence", () => {
  const lake = matchingLake({
    access: {
      permitRequirement: fact("required"),
      permitMethodSupport: fact([
        { permitType: "ice-fishing", methods: ["ice"] },
      ]),
    },
    methods: {},
  });

  assert.deepEqual(
    getLakeFishingSelectionDetails(lake, {
      method: ["Pimpelfiske", "Spinn", "Flugfiske", "Mete", "Trolling"],
    }).categories.method,
    [
      { choice: "Pimpelfiske", status: "allowed", missing: [], inferred: true },
      { choice: "Spinn", status: "unknown", missing: ["method"] },
      { choice: "Flugfiske", status: "unknown", missing: ["method"] },
      { choice: "Mete", status: "unknown", missing: ["method"] },
      { choice: "Trolling", status: "unknown", missing: ["method"] },
    ],
  );
});

test("scoped permit support requires no fabricated calendar season", () => {
  const lake = matchingLake({
    access: {
      permitMethodSupport: fact([
        { permitType: "ordinary-open-water", methods: ["spin", "fly"] },
        { permitType: "ice-fishing", methods: ["ice"] },
      ]),
    },
    methods: {},
  });

  for (const now of [
    new Date("2026-01-15T12:00:00"),
    new Date("2026-06-15T12:00:00"),
    new Date("2026-11-15T12:00:00"),
  ]) {
    assert.equal(getLakeFishingStatus(lake, { method: "Spinn" }, now), "allowed");
    assert.equal(getLakeFishingStatus(lake, { method: "Flugfiske" }, now), "allowed");
    assert.equal(getLakeFishingStatus(lake, { method: "Pimpelfiske" }, now), "allowed");
  }
});

test("explicit method restrictions override scoped permit support", () => {
  const lake = matchingLake({
    access: {
      permitMethodSupport: fact([
        { permitType: "ordinary-open-water", methods: ["spin"] },
      ]),
    },
    methods: { spin: fact("restricted") },
  });

  assert.deepEqual(
    getLakeFishingSelectionDetails(lake, { method: ["Spinn"] }).categories.method,
    [{ choice: "Spinn", status: "warning", missing: [] }],
  );
});

test("advisory and unverified access facts do not provide baseline Spinn", () => {
  for (const permitRequirement of [
    fact("required", { ruleType: "advisory" }),
    fact("required", { ruleType: "recommendation" }),
    fact("required", { status: "unverified" }),
  ]) {
    assert.deepEqual(
      getLakeFishingSelectionDetails(
        matchingLake({ access: { permitRequirement }, methods: {} }),
        { method: ["Spinn"] },
      ).categories.method,
      [{ choice: "Spinn", status: "unknown", missing: ["method"] }],
    );
  }
});

test("explicit Spinn rules take precedence over generic fishing permission", () => {
  for (const [value, status] of [["prohibited", "warning"], ["restricted", "warning"]]) {
    const result = getLakeFishingSelectionDetails(
      matchingLake({
        access: { permitRequirement: fact("required") },
        methods: { spin: fact(value) },
      }),
      { method: ["Spinn"] },
    );

    assert.deepEqual(result.categories.method, [
      { choice: "Spinn", status, missing: [] },
    ]);
  }

  assert.deepEqual(
    getLakeFishingSelectionDetails(
      matchingLake({
        access: { permitRequirement: fact("required") },
        methods: { spin: fact("allowed") },
      }),
      { method: ["Spinn"] },
    ).categories.method,
    [{ choice: "Spinn", status: "allowed", missing: [] }],
  );
});

test("seasonal general fishing permission bounds baseline Spinn inference", () => {
  for (const access of [{}, { permitRequirement: fact("required") }]) {
    const lake = matchingLake({
      access,
      methods: {
        fishingSeason: fact("allowed", {
          conditions: {
            dateFrom: "05-01",
            dateTo: "09-30",
            timeFrom: null,
            timeTo: null,
          },
        }),
      },
    });

    assert.deepEqual(
      getLakeFishingSelectionDetails(
        lake,
        { method: ["Spinn"] },
        new Date("2026-06-15T12:00:00"),
      ).categories.method,
      [{ choice: "Spinn", status: "allowed", missing: [], inferred: true }],
    );
    assert.deepEqual(
      getLakeFishingSelectionDetails(
        lake,
        { method: ["Spinn"] },
        new Date("2026-11-15T12:00:00"),
      ).categories.method,
      [{ choice: "Spinn", status: "unknown", missing: ["method"] }],
    );
  }
});

test("an active general fishing closure overrides permit-based Spinn", () => {
  const lake = matchingLake({
    access: { permitRequirement: fact("required") },
    methods: {
      publicFishing: fact("prohibited", {
        conditions: {
          dateFrom: "08-01",
          dateTo: "08-31",
          timeFrom: null,
          timeTo: null,
        },
      }),
    },
  });

  assert.equal(
    getLakeFishingStatus(lake, choices, new Date("2026-08-10T12:00:00")),
    "warning",
  );
  assert.equal(
    getLakeFishingStatus(lake, choices, new Date("2026-09-01T12:00:00")),
    "allowed",
  );
});

test("uses an active normative Spinn permission only during its season", () => {
  const lake = matchingLake({
    methods: {
      spin: fact("allowed", {
        conditions: {
          dateFrom: "06-01",
          dateTo: "09-30",
          timeFrom: null,
          timeTo: null,
        },
      }),
    },
  });

  assert.equal(
    getLakeFishingStatus(lake, choices, new Date("2026-06-15T12:00:00")),
    "allowed",
  );
  assert.equal(
    getLakeFishingStatus(lake, choices, new Date("2026-11-15T12:00:00")),
    "unknown",
  );
});

test("infers only hand methods from an active hand-gear-only rule", () => {
  for (const value of ["allowed", "restricted"]) {
    const lake = matchingLake({ methods: { handGearOnly: fact(value) } });
    const result = getLakeFishingSelectionDetails(
      lake,
      { method: ["Spinn", "Mete", "Flugfiske", "Trolling"] },
    );
    const expectedStatus = value === "restricted" ? "warning" : "allowed";

    for (const method of ["Spinn", "Mete", "Flugfiske"]) {
      assert.deepEqual(
        result.categories.method.find((choice) => choice.choice === method),
        { choice: method, status: expectedStatus, missing: [], inferred: true },
      );
    }
    assert.deepEqual(result.categories.method.at(-1), {
      choice: "Trolling",
      status: "unknown",
      missing: ["method"],
    });
  }
});

test("infers hand methods, but not Trolling, from normative Spinn permission", () => {
  for (const key of ["spin", "lureFishing"]) {
    const result = getLakeFishingSelectionDetails(
      matchingLake({ methods: { [key]: fact("allowed") } }),
      { method: ["Spinn", "Mete", "Flugfiske", "Trolling"] },
    );

    assert.deepEqual(result.categories.method, [
      { choice: "Spinn", status: "allowed", missing: [] },
      { choice: "Mete", status: "allowed", missing: [], inferred: true },
      { choice: "Flugfiske", status: "allowed", missing: [], inferred: true },
      { choice: "Trolling", status: "unknown", missing: ["method"] },
    ]);
  }
});

test("infers ordinary hand methods only from normative allowed Trolling", () => {
  const allowedLake = matchingLake({
    methods: { trolling: fact("allowed") },
  });
  const allowed = getLakeFishingSelectionDetails(allowedLake, {
    method: ["Trolling", "Spinn", "Mete", "Flugfiske"],
  });

  assert.deepEqual(allowed.categories.method, [
    { choice: "Trolling", status: "allowed", missing: [] },
    { choice: "Spinn", status: "allowed", missing: [], inferred: true },
    { choice: "Mete", status: "allowed", missing: [], inferred: true },
    { choice: "Flugfiske", status: "allowed", missing: [], inferred: true },
  ]);

  for (const overrides of [
    { value: "allowed", ruleType: "advisory" },
    { value: "allowed", ruleType: "recommendation" },
    { value: "restricted", ruleType: "rule" },
  ]) {
    const lake = matchingLake({
      methods: { trolling: fact(overrides.value, overrides) },
    });

    for (const method of ["Spinn", "Mete", "Flugfiske"]) {
      assert.equal(
        getLakeFishingStatus(lake, { ...choices, method }),
        "unknown",
      );
    }
  }
});

test("lets an active explicit method restriction override inferred permission", () => {
  const lake = matchingLake({
    methods: {
      handGearOnly: fact("allowed"),
      fly: fact("prohibited"),
    },
  });
  const result = getLakeFishingSelectionDetails(lake, {
    method: ["Spinn", "Flugfiske"],
  });

  assert.deepEqual(result.categories.method, [
    { choice: "Spinn", status: "allowed", missing: [], inferred: true },
    { choice: "Flugfiske", status: "warning", missing: [] },
  ]);
});

test("inherits source conditions for controlled method inference", () => {
  const lake = matchingLake({
    methods: {
      trolling: fact("allowed", {
        conditions: {
          dateFrom: "06-01",
          dateTo: "09-30",
          timeFrom: null,
          timeTo: null,
        },
      }),
    },
  });

  assert.deepEqual(
    getLakeFishingSelectionDetails(
      lake,
      { method: ["Spinn"] },
      new Date("2026-06-15T12:00:00"),
    ).categories.method[0],
    { choice: "Spinn", status: "allowed", missing: [], inferred: true },
  );
  assert.deepEqual(
    getLakeFishingSelectionDetails(
      lake,
      { method: ["Spinn"] },
      new Date("2026-11-15T12:00:00"),
    ).categories.method[0],
    { choice: "Spinn", status: "unknown", missing: ["method"] },
  );
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

test("supports absolute start dates for rules that continue indefinitely", () => {
  const lake = matchingLake({
    methods: {
      spin: fact("prohibited", {
        conditions: {
          dateFrom: "2025-03-15",
          dateTo: null,
          timeFrom: null,
          timeTo: null,
        },
      }),
    },
  });

  assert.equal(getLakeFishingStatus(lake, choices, new Date("2025-03-14T12:00:00")), "allowed");
  assert.equal(getLakeFishingStatus(lake, choices, new Date("2026-09-07T12:00:00")), "warning");
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
