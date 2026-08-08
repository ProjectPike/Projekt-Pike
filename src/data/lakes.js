// Optional additive lake-details convention.
// Existing runtime consumers do not use this yet.
export const lakeDetailSourceTypes = [
  "authority",
  "municipality",
  "fvo-club",
  "open-data",
  "commercial-aggregator",
  "other",
];

export const lakeDetailValueStates = [
  "allowed",
  "prohibited",
  "restricted",
  "unknown",
];

export const lakeDetailRuleTypes = [
  "rule",
  "recommendation",
  "advisory",
  "unknown",
];

export const lakeDetailVerificationStatuses = [
  "verified",
  "unverified",
  "unknown",
];

export const lakeDetailFactTemplate = {
  value: "unknown",
  status: "unknown",
  ruleType: null,
  verifiedAt: null,
  sources: [],
  note: null,
  conditions: {
    dateFrom: null,
    dateTo: null,
    timeFrom: null,
    timeTo: null,
  },
};

// Shape guide for optional lake.details entries.
export const lakeDetailsTemplate = {
  access: {},
  methods: {},
  species: {},
  watercraft: {},
  boat: {},
  practical: {},
  geography: {},
  safety: {},
};

export const lakes = {
  bolmen: {
    id: "bolmen",
    name: "Bolmen",
    type: "sjö",
    region: "Småland",
    counties: ["Kronoberg", "Jönköping", "Halland"],
    coordinates: [13.68, 56.92],
    distance: { kilometers: 84, travelTime: "1 h 8 min" },
    verification: { status: "unverified", updatedAt: null, sources: [] },
    fishing: {
      permit: { status: "unknown", label: "Uppgift saknas" },
      rules: { status: "unverified", label: "Ej verifierade" },
      protectedAreas: { status: "checking", label: "Kontrolleras" },
      ruleProfile: {
        prototype: true,
        note: "Prototyp-data endast, inte juridiskt korrekt.",
        conditions: [
          {
            field: "place",
            allowedValues: ["Båt"],
            status: "supported",
            note: "Prototyp: endast båt är explicit stödjer för detta vatten.",
          },
          {
            field: "method",
            allowedValues: ["Spinn"],
            status: "supported",
            note: "Prototyp: endast spinn är explicit stödjer för detta vatten.",
          },
          {
            field: "species",
            allowedValues: ["Gädda"],
            status: "supported",
            note: "Prototyp: endast gädda är explicit stödjer för detta vatten.",
          },
        ],
      },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskekort/",
              type: "fvo-club",
            },
          ],
          note: "Fiskekort krävs.",
          conditions: null,
        },
        youthRules: {
          value: "not-required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Ungdomar till och med 18 år fiskar utan fiskekort men ska följa samma regler som kortinnehavare.",
          conditions: null,
        },
        permitProducts: {
          value: ["day", "week", "month", "year", "family"],
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskekort/",
              type: "fvo-club",
            },
          ],
          note: "Aktuella korttyper inkluderar dag, vecka, månad, år och familjekort.",
          conditions: null,
        },
        purchaseChannels: {
          value: ["digital", "physical-resellers"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskekort/",
              type: "fvo-club",
            },
          ],
          note: "Fiskekort säljs digitalt och via fysiska återförsäljare.",
          conditions: null,
        },
      },
      methods: {
        fly: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Flugfiske ingår i handredskapsfisket.",
          conditions: null,
        },
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Spinnfiske ingår i handredskapsfisket.",
          conditions: null,
        },
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Mete ingår i handredskapsfisket.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Pimpel och övrigt isfiske med handredskap ingår.",
          conditions: null,
        },
        lureFishing: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Dragfiske ingår i handredskapsfisket.",
          conditions: null,
        },
        trolling: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Trolling ingår i fiskekortet.",
          conditions: null,
        },
        maxLinesPerFishingPermit: {
          value: 2,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Max 2 linor/beten per fiskekort.",
          conditions: null,
        },
        familyPermitMaxLinesPerAngler: {
          value: 2,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Vid familjekort gäller max 2 linor/beten per fiskande person.",
          conditions: null,
        },
        angeldonOnlyIceCoveredWater: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Angeldon är endast tillåtna på isbelagt vatten.",
          conditions: null,
        },
        iceMaxAngeldonPerPermit: {
          value: 10,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Max 10 angeldon per fiskekort.",
          conditions: null,
        },
        angeldonContinuousSupervision: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Fiskaren ska ha kontinuerlig uppsikt över angeldon.",
          conditions: null,
        },
        maxFishingDepthMeters: {
          value: 10,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Handredskapsfiske får inte bedrivas i vatten djupare än 10 meter.",
          conditions: null,
        },
      },
      species: {
        knownSpecies: {
          value: ["gädda", "gös", "abborre", "lake", "ål", "sutare", "braxen"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bolmensweden.com/fiskeregler/",
              type: "fvo-club",
            },
          ],
          note: "Kända arter enligt FVO:s aktuella information.",
          conditions: null,
        },
        sizeLimits: [
          {
            species: "öring",
            value: { minSizeCm: 50 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://bolmensweden.com/fiskeregler/",
                type: "fvo-club",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "gös",
            value: { maxSizeCm: 75 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://bolmensweden.com/fiskeregler/",
                type: "fvo-club",
              },
            ],
            note: "Gös över 75 cm ska återutsättas.",
            conditions: null,
          },
        ],
        releaseRequirements: [
          {
            species: "gös",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://bolmensweden.com/fiskeregler/",
                type: "fvo-club",
              },
            ],
            note: "Gös över 75 cm ska återutsättas.",
            conditions: null,
          },
        ],
        releaseRestrictions: [
          {
            species: "gös",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://bolmensweden.com/fiskeregler/",
                type: "fvo-club",
              },
            ],
            note: "Catch-and-release av gös under 75 cm är inte tillåtet enligt gällande FVO-regeltext.",
            conditions: null,
          },
        ],
        bagLimits: [
          {
            species: "gös",
            value: { maxRetainedPerPermitPerDay: 10 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://bolmensweden.com/fiskeregler/",
                type: "fvo-club",
              },
            ],
            note: null,
            conditions: null,
          },
        ],
      },
      watercraft: {},
      boat: {
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {},
      geography: {
        fishingProhibitionAreas: [
          {
            name: "Önne å",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://bolmensweden.com/fiskeregler/",
                type: "fvo-club",
              },
            ],
            note: "Fiske förbjudet året runt.",
            conditions: null,
            geometry: null,
          },
          {
            name: "Storån",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://bolmensweden.com/fiskeregler/",
                type: "fvo-club",
              },
            ],
            note: "Fiske förbjudet under angiven period.",
            conditions: {
              dateFrom: "04-15",
              dateTo: "06-15",
              timeFrom: null,
              timeTo: null,
            },
            geometry: null,
          },
        ],
      },
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  bunn: {
    id: "bunn",
    name: "Bunn",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.48, 57.91],
    distance: { kilometers: 18, travelTime: "21 min" },
    verification: { status: "unverified", updatedAt: null, sources: [] },
    fishing: {
      permit: { status: "unknown", label: "Uppgift saknas" },
      rules: { status: "unverified", label: "Ej verifierade" },
      protectedAreas: { status: "checking", label: "Kontrolleras" },
      ruleProfile: {
        prototype: true,
        note: "Prototyp-data endast, inte juridiskt korrekt.",
        conditions: [
          {
            field: "place",
            allowedValues: ["Land", "Båt"],
            status: "supported",
            note: "Prototyp: detta vatten har ett villkor för landfiske och ett prototype-exempel för båt.",
          },
          {
            field: "method",
            allowedValues: ["Mete", "Flugfiske", "Spinn"],
            status: "supported",
            note: "Prototyp: endast mete, flugfiske eller spinn är explicit stödjer för detta vatten.",
          },
          {
            field: "species",
            allowedValues: ["Gädda"],
            status: "warning",
            note: "Prototyp: endast ett varnings-exempel för gädda; inte juridiskt korrekt.",
          },
        ],
      },
    },    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bunnfiske.se/item/fiskekort.html",
              type: "fvo-club",
            },
          ],
          note: "Separata fiskekort gäller för Norra Bunn och Södra Bunn. Gräns vid Förnäsbron.",
          conditions: null,
        },
        youthRules: {
          value: "not-required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bunnfiske.se/item/fiskekort.html",
              type: "fvo-club",
            },
          ],
          note: "Personer under 18 år behöver inte fiskekort.",
          conditions: null,
        },
        purchase: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://bunnfiske.se/item/fiskekort.html",
              type: "fvo-club",
            },
          ],
          note: "Köp- och produktinformation finns i källan, inklusive priser för Norra Bunn, Södra Bunn och gemensamt veckokort.",
          conditions: null,
        },
      },
      methods: {},
      species: {},
      watercraft: {
        boat: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        kayak: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        floatTube: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      boat: {
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {
        ramps: [
          {
            name: "Roten",
            value: "restricted",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://bunnfiske.se/item/fiskekort.html",
                type: "fvo-club",
              },
            ],
            note: "Sjösättningsplatsen är stängd under perioden.",
            conditions: {
              dateFrom: "06-15",
              dateTo: "08-15",
              timeFrom: null,
              timeTo: null,
            },
            geometry: null,
          },
        ],
      },
      geography: {
        fishingProhibitionAreas: [
          {
            name: "Avstand till tomt eller brygga",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://bunnfiske.se/item/fiskekort.html",
                type: "fvo-club",
              },
            ],
            note: "Fiske får inte bedrivas närmare än 75 meter från tomt eller brygga.",
            conditions: null,
            geometry: null,
          },
        ],
      },
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  sommen: {
    id: "sommen",
    name: "Sommen",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping", "Östergötland"],
    coordinates: [15.27, 58.0],
    distance: { kilometers: 97, travelTime: "1 h 19 min" },
    verification: { status: "unverified", updatedAt: null, sources: [] },
    fishing: {
      permit: { status: "unknown", label: "Uppgift saknas" },
      rules: { status: "unverified", label: "Ej verifierade" },
      protectedAreas: { status: "checking", label: "Kontrolleras" },
      ruleProfile: {
        prototype: true,
        note: "Prototyp-data endast, inte juridiskt korrekt.",
        conditions: [
          {
            field: "place",
            allowedValues: ["Kajak", "Flytring"],
            status: "supported",
            note: "Prototyp: endast kajak eller flytring är explicit stödjer för detta vatten.",
          },
          {
            field: "species",
            allowedValues: ["Öring"],
            status: "supported",
            note: "Prototyp: endast öring är explicit stödjer för detta vatten.",
          },
        ],
      },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Ordinarie fiske kräver fiskekort enligt FVO-regler.",
          conditions: null,
        },
        youthRules: {
          value: "not-required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Upp till och med 15 år krävs inget fiskekort, men sjöns regler gäller.",
          conditions: null,
        },
        familyCoverage: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Ordinarie fiskekort är personligt men omfattar även familjemedlemmar upp till 20 år enligt kortvillkoren.",
          conditions: null,
        },
      },
      methods: {
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Mete ingår i ordinarie fiskekort.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Pimpel ingår i ordinarie fiskekort.",
          conditions: null,
        },
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Kastspö ingår i ordinarie fiskekort.",
          conditions: null,
        },
        fly: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Flugspö ingår i ordinarie fiskekort.",
          conditions: null,
        },
        trolling: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Trolling kräver särskilt trollingfiskekort.",
          conditions: null,
        },
        maxLinesPerFishingCard: {
          value: 2,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Max 2 linor/beten per fiskekort.",
          conditions: null,
        },
        iceMaxBaitsPerAngler: {
          value: 2,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Vid ismete gäller max 2 beten per fiskande.",
          conditions: null,
        },
        dragRowingMaxAnglers: {
          value: 2,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Vid släpfiske från båt gäller max 2 fiskande personer.",
          conditions: null,
        },
      },
      species: {
        closedSeasons: [
          {
            species: "röding",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: "Riktat fiske förbjudet under fredningstid.",
            conditions: {
              dateFrom: "09-16",
              dateTo: "12-31",
              timeFrom: null,
              timeTo: null,
            },
          },
          {
            species: "insjööring",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: "Riktat fiske förbjudet under fredningstid.",
            conditions: {
              dateFrom: "09-16",
              dateTo: "12-31",
              timeFrom: null,
              timeTo: null,
            },
          },
        ],
        releaseRequirements: [
          {
            species: "röding",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: "Fångad fisk ska återutsättas under fredningstiden.",
            conditions: {
              dateFrom: "09-16",
              dateTo: "12-31",
              timeFrom: null,
              timeTo: null,
            },
          },
          {
            species: "insjööring",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: "Fångad fisk ska återutsättas under fredningstiden.",
            conditions: {
              dateFrom: "09-16",
              dateTo: "12-31",
              timeFrom: null,
              timeTo: null,
            },
          },
        ],
        sizeLimits: [
          {
            species: "gädda",
            value: { minSizeCm: 40 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "gös",
            value: { minSizeCm: 40 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "insjööring",
            value: { minSizeCm: 60 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "röding",
            value: { minSizeCm: 60 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "ål",
            value: { minSizeCm: 70 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: null,
            conditions: null,
          },
        ],
        bagLimits: [
          {
            speciesGroup: "laxartad",
            value: { maxPerFishingCardPerDay: 1 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: null,
            conditions: null,
          },
        ],
      },
      watercraft: {
        boat: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Ordinarie fiskekort inkluderar släpfiske från båt med begränsningar.",
          conditions: null,
        },
        kayak: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        floatTube: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      boat: {
        trollingPermitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Trolling kräver särskilt trollingkort.",
          conditions: null,
        },
        trollingMaxBaitsPerBoat: {
          value: 6,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: null,
          conditions: null,
        },
        trollingParticipantsNeedCard: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Alla som fiskar från trollingbåt ska ha giltigt trollingkort.",
          conditions: null,
        },
        trollingTechniquesProhibited: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "Ytutterfiske, lodutterfiske och yttrolling med paravaner är inte tillåtet.",
          conditions: null,
        },
        singleHookRecommendation: {
          value: "restricted",
          status: "verified",
          ruleType: "recommendation",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
              type: "fvo-club",
            },
          ],
          note: "FVO rekommenderar enkelkrok vid trolling för att minska skador på återutsatt fisk.",
          conditions: null,
        },
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {},
      geography: {
        fishingProhibitionAreas: [
          {
            name: "Avstånd till brygga eller bebyggd tomt",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: "Fiske förbjudet inom 50 meter från brygga och bebyggd tomt utan tillstånd.",
            conditions: null,
            geometry: null,
          },
        ],
        seasonalAreas: [
          {
            name: "Vertikalfiske med ekolod i västra Sommen",
            value: "restricted",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: "Tillåtet endast i Sommenfjärden, Boxholmsfjärden, Tranåssjön och Torpafjärden enligt Torpöbron/Färjeläget-beskrivningen.",
            conditions: null,
            geometry: null,
          },
          {
            name: "Fredningsområden för röding och insjööring",
            value: "restricted",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.sommen.org/index.php?Itemid=80&id=49&lang=sv&option=com_content&view=article",
                type: "fvo-club",
              },
            ],
            note: "Fyra fredningsområden finns för fredningstiden.",
            conditions: {
              dateFrom: "09-16",
              dateTo: "12-31",
              timeFrom: null,
              timeTo: null,
            },
            geometry: null,
          },
        ],
      },
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  vattern: {
    id: "vattern",
    name: "Vättern",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping", "Västra Götaland", "Örebro", "Östergötland"],
    coordinates: [14.55, 58.3],
    distance: { kilometers: 0, travelTime: "0 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/",
        "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
        "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/fredningsomraden/",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fritt handredskapsfiske" },
      rules: { status: "verified", label: "Verifierade specialregler" },
      protectedAreas: { status: "verified", label: "Fredningsområden finns" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "not-required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
              type: "authority",
            },
          ],
          note: "Handredskapsfiske är fritt för alla från land och båt i Vättern.",
          conditions: null,
        },
      },
      methods: {
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
              type: "authority",
            },
          ],
          note: "Mete är tillåtet som handredskap.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
              type: "authority",
            },
          ],
          note: "Pimpelfiske är tillåtet som handredskap.",
          conditions: null,
        },
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
              type: "authority",
            },
          ],
          note: "Spinn/haspel är tillåtet som handredskap.",
          conditions: null,
        },
        fly: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
              type: "authority",
            },
          ],
          note: "Flugfiske är tillåtet som handredskap.",
          conditions: null,
        },
        maxHooksPerPerson: {
          value: 10,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
              type: "authority",
            },
          ],
          note: "Maximalt tio krokar per person.",
          conditions: null,
        },
      },
      species: {
        directedFishingRestrictions: [
          {
            species: "harr",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://vattern.org/nya-regler-for-harr-i-vattern/",
                type: "authority",
              },
            ],
            note: "Riktat fiske efter harr är förbjudet i hela Vättern året runt.",
            conditions: {
              dateFrom: "2025-03-15",
              dateTo: null,
              timeFrom: null,
              timeTo: null,
            },
          },
        ],
        releaseRequirements: [
          {
            species: "harr",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://vattern.org/nya-regler-for-harr-i-vattern/",
                type: "authority",
              },
            ],
            note: "Fångad harr ska omedelbart återutsättas.",
            conditions: {
              dateFrom: "2025-03-15",
              dateTo: null,
              timeFrom: null,
              timeTo: null,
            },
          },
        ],
        bagLimits: [
          {
            speciesGroup: ["röding", "öring", "lax"],
            value: {
              maxPerPersonPerDay: 3,
              maxRodingPerPersonPerDay: 2,
            },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
                type: "authority",
              },
            ],
            note: "Kombinerad fångstkvot för röding, öring och lax.",
            conditions: null,
          },
        ],
      },
      watercraft: {
        boat: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
              type: "authority",
            },
          ],
          note: "Handredskapsfiske är fritt från båt.",
          conditions: null,
        },
        kayak: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        floatTube: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      boat: {
        trolling: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
              type: "authority",
            },
          ],
          note: "Trolling och dragrodd är tillåtet på allmänt vatten och på enskilt vatten utanför öppen strand. På enskilt vatten utan öppen strand avgör fiskerättsägaren.",
          conditions: null,
        },
        trollingMaxBaitsPerBoat: {
          value: 10,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
              type: "authority",
            },
          ],
          note: "Max 10 beten per båt.",
          conditions: null,
        },
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {},
      geography: {
        fishingProhibitionAreas: [
          {
            name: "Tängan",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/fredningsomraden/",
                type: "authority",
              },
            ],
            note: "Året runt förbjudet fiske, undantaget kräftfiske med bur.",
            conditions: null,
            geometry: null,
          },
          {
            name: "Norrgrundet",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/fredningsomraden/",
                type: "authority",
              },
            ],
            note: "Året runt förbjudet fiske, undantaget kräftfiske med bur.",
            conditions: null,
            geometry: null,
          },
          {
            name: "Fingals",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/fredningsomraden/",
                type: "authority",
              },
            ],
            note: "Året runt förbjudet fiske, undantaget kräftfiske med bur.",
            conditions: null,
            geometry: null,
          },
          {
            name: "Fast redskap och fiskodlingar",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/sportfiske/",
                type: "authority",
              },
            ],
            note: "Allt fiske inom 100 meter från fasta fiskeredskap och fiskodlingar är förbjudet.",
            conditions: null,
            geometry: null,
          },
        ],
        seasonalAreas: [
          {
            name: "Höstfredningsområden",
            value: "restricted",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/fredningsomraden/",
                type: "authority",
              },
            ],
            note: "Områden 1-7 samt specificerade enskilda vatten med särskilda undantag och metodregler.",
            conditions: {
              dateFrom: "09-15",
              dateTo: "12-31",
              timeFrom: null,
              timeTo: null,
            },
            geometry: null,
          },
          {
            name: "Vårfredning vid tillflöden och mynningar",
            value: "restricted",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://vattern.org/fisk-och-fiske/fiska-i-vattern/regler/fredningsomraden/",
                type: "authority",
              },
            ],
            note: "Fiskebegränsningar i flera tillflöden och mynningar för harrlek.",
            conditions: {
              dateFrom: "03-15",
              dateTo: "05-31",
              timeFrom: null,
              timeTo: null,
            },
            geometry: null,
          },
        ],
      },
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  munksjon: {
    id: "munksjon",
    name: "Munksjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.165, 57.7725],
    distance: { kilometers: 1, travelTime: "5 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Gratis Sportfiskekort krävs" },
      rules: { status: "verified", label: "Verifierade" },
      protectedAreas: { status: "verified", label: "Lokala fiskeförbud finns" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Sportfiskekort kravs for fiske.",
          conditions: null,
        },
        permitCost: {
          value: 0,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Sportfiskekortet ar kostnadsfritt.",
          conditions: null,
        },
        validity: {
          value: "calendar-year",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Gäller 1 januari-31 december och förnyas inte automatiskt.",
          conditions: null,
        },
        youthRules: {
          value: "not-required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Barn under 16 år behöver inte Sportfiskekort.",
          conditions: null,
        },
      },
      methods: {
        crayfishFishing: {
          value: "prohibited",
          status: "unverified",
          ruleType: "rule",
          verifiedAt: null,
          sources: [
            {
              url: "https://www.jonkoping.se/download/18.35a24a8618ced9babe76ffd5/1706602643439/Sportfiskekortet%202024.pdf",
              type: "municipality",
            },
          ],
          note: "Kräftfiske ingår inte i Sportfiskekortet. Kommunalt regelunderlag från 2024; aktuell 2026-version behöver verifieras.",
          conditions: null,
        },
      },
      species: {},
      watercraft: {
        boat: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        kayak: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        floatTube: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      boat: {
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {},
      geography: {},
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  rocksjon: {
    id: "rocksjon",
    name: "Rocksjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.18889, 57.77367],
    distance: { kilometers: 2, travelTime: "6 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Gratis Sportfiskekort krävs" },
      rules: { status: "verified", label: "Verifierade" },
      protectedAreas: { status: "verified", label: "Lokala fiskeförbud finns" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "unverified",
          ruleType: "rule",
          verifiedAt: null,
          sources: [
            {
              url: "https://www.jonkoping.se/download/18.35a24a8618ced9babe76ffd5/1706602643439/Sportfiskekortet%202024.pdf",
              type: "municipality",
            },
          ],
          note: "Kommunalt regelunderlag från 2024; aktuell 2026-version behöver verifieras.",
          conditions: null,
        },
        permitPrice: {
          value: "free",
          status: "unverified",
          ruleType: "rule",
          verifiedAt: null,
          sources: [
            {
              url: "https://www.jonkoping.se/download/18.35a24a8618ced9babe76ffd5/1706602643439/Sportfiskekortet%202024.pdf",
              type: "municipality",
            },
          ],
          note: "Kommunalt regelunderlag från 2024; aktuell 2026-version behöver verifieras.",
          conditions: null,
        },
        validity: {
          value: "restricted",
          status: "unverified",
          ruleType: "rule",
          verifiedAt: null,
          sources: [
            {
              url: "https://www.jonkoping.se/download/18.35a24a8618ced9babe76ffd5/1706602643439/Sportfiskekortet%202024.pdf",
              type: "municipality",
            },
          ],
          note: "Kalenderårs-giltighet 1 januari-31 december enligt 2024-dokumentet. Kommunalt regelunderlag från 2024; aktuell 2026-version behöver verifieras.",
          conditions: {
            dateFrom: "01-01",
            dateTo: "12-31",
            timeFrom: null,
            timeTo: null,
          },
        },
      },
      methods: {
        crayfishFishing: {
          value: "prohibited",
          status: "unverified",
          ruleType: "rule",
          verifiedAt: null,
          sources: [
            {
              url: "https://www.jonkoping.se/download/18.35a24a8618ced9babe76ffd5/1706602643439/Sportfiskekortet%202024.pdf",
              type: "municipality",
            },
          ],
          note: "Kräftfiske ingår inte i Sportfiskekortet. Kommunalt regelunderlag från 2024; aktuell 2026-version behöver verifieras.",
          conditions: null,
        },
      },
      species: {},
      watercraft: {
        boat: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        kayak: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        floatTube: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      boat: {
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "prohibited",
          status: "unverified",
          ruleType: "rule",
          verifiedAt: null,
          sources: [
            {
              url: "https://www.jonkoping.se/download/18.35a24a8618ced9babe76ffd5/1706602643439/Sportfiskekortet%202024.pdf",
              type: "municipality",
            },
          ],
          note: "Motorbåt är inte tillåten enligt kommunalt 2024-underlag; aktuell 2026-version behöver verifieras.",
          conditions: null,
        },
      },
      practical: {},
      geography: {
        protectedAreas: [
          {
            name: "Naturreservatsregler",
            value: "restricted",
            status: "unverified",
            ruleType: "advisory",
            verifiedAt: null,
            sources: [
              {
                url: "https://www.jonkoping.se/download/18.35a24a8618ced9babe76ffd5/1706602643439/Sportfiskekortet%202024.pdf",
                type: "municipality",
              },
            ],
            note: "Rocksjön påverkas av naturreservatsregler. Kommunalt regelunderlag från 2024; aktuell 2026-version behöver verifieras.",
            conditions: null,
            geometry: null,
          },
        ],
      },
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  landsjon: {
    id: "landsjon",
    name: "Landsjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.31667, 57.86667],
    distance: { kilometers: 17, travelTime: "20 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiskekort-och-fiskevatten",
        "https://www.ifiske.se/fiskekort-landsjon.htm",
        "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade säsongsregler" },
      protectedAreas: { status: "unknown", label: "Uppgift saknas" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
              type: "commercial-aggregator",
            },
          ],
          note: "Fiskekort kravs.",
          conditions: null,
        },
      },
      methods: {
        summerFishing: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
              type: "commercial-aggregator",
            },
          ],
          note: "Sportfiske tillatet sommartid.",
          conditions: {
            dateFrom: "06-01",
            dateTo: "09-30",
            timeFrom: null,
            timeTo: null,
          },
        },
        winterFishing: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
              type: "commercial-aggregator",
            },
          ],
          note: "Sportfiske tillatet vintertid.",
          conditions: {
            dateFrom: "12-01",
            dateTo: "03-31",
            timeFrom: null,
            timeTo: null,
          },
        },
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
              type: "commercial-aggregator",
            },
          ],
          note: "Mete tillatet sommartid.",
          conditions: {
            dateFrom: "06-01",
            dateTo: "09-30",
            timeFrom: null,
            timeTo: null,
          },
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
              type: "commercial-aggregator",
            },
          ],
          note: "Pimpel tillatet sommartid och vintertid.",
          conditions: null,
        },
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
              type: "commercial-aggregator",
            },
          ],
          note: "Dragfiske tillatet sommartid.",
          conditions: {
            dateFrom: "06-01",
            dateTo: "09-30",
            timeFrom: null,
            timeTo: null,
          },
        },
        dragFromBoatWinterIceFree: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
              type: "commercial-aggregator",
            },
          ],
          note: "Drag från båt tillåtet vintertid när isen inte bär.",
          conditions: {
            dateFrom: "12-01",
            dateTo: "03-31",
            timeFrom: null,
            timeTo: null,
          },
        },
        iceMaxAngeldonPerAngelkort: {
          value: 5,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
              type: "commercial-aggregator",
            },
          ],
          note: "Max 5 angeldon eller 5 ismeten per angelkort.",
          conditions: {
            dateFrom: "12-01",
            dateTo: "03-31",
            timeFrom: null,
            timeTo: null,
          },
        },
      },
      species: {
        sizeLimits: [
          {
            species: "gadda",
            value: { minSizeCm: 50 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "gos",
            value: { minSizeCm: 50 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "al",
            value: { minSizeCm: 70 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "abborre",
            value: { maxSizeCm: 35 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
                type: "commercial-aggregator",
              },
            ],
            note: "Abborre over 35 cm ska aterutsattas.",
            conditions: null,
          },
        ],
        bagLimits: [
          {
            species: "abborre",
            value: { maxRetainedPerPersonPerDay: 10 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "gadda+gos",
            value: { maxRetainedOver50cmCombinedPerPersonPerDay: 2 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
                type: "commercial-aggregator",
              },
            ],
            note: "Gäller gädda och gös över 50 cm som uppfyller minimimått.",
            conditions: null,
          },
        ],
        releaseRequirements: [
          {
            species: "all",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
                type: "commercial-aggregator",
              },
            ],
            note: "Fisk under minimimatt, utanfor tillatet storleksintervall eller over fangstkvot ska omedelbart och varsamt aterutsattas.",
            conditions: null,
          },
        ],
      },
      watercraft: {},
      boat: {
        speedLimits: {
          value: 7,
          unit: "knots",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-landsjon.htm?rules=264",
              type: "commercial-aggregator",
            },
          ],
          note: "Hogsta tillatna fart for motorbat ar 7 knop.",
          conditions: null,
        },
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {},
      geography: {},
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  ulvstorpasjon: {
    id: "ulvstorpasjon",
    name: "Ulvstorpasjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.0931, 57.757],
    distance: { kilometers: 7, travelTime: "12 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiskekort-och-fiskevatten",
        "https://www.ifiske.se/fiske-ulvstorpasjon.htm",
        "https://www.ifiske.se/fiskekort-ulvstorpasjon.htm",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade" },
      protectedAreas: { status: "verified", label: "Lokalt fiskeförbud finns" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-ulvstorpasjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Fiskekort kravs.",
          conditions: null,
        },
        permitProducts: {
          value: ["adult-day", "youth-day-10-17"],
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-ulvstorpasjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Aktuella korttyper inkluderar dagkort vuxen och ungdomskort 10-17 ar.",
          conditions: null,
        },
      },
      methods: {},
      species: {
        stockedSportFish: {
          value: ["regnbage", "oring"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-ulvstorpasjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Kanda inplanterade sportfiskar.",
          conditions: null,
        },
      },
      watercraft: {
        floatTube: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-ulvstorpasjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Flytring tillaten.",
          conditions: null,
        },
        boat: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-ulvstorpasjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Bat ar inte tillaten.",
          conditions: null,
        },
        kayak: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      boat: {
        electricMotor: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-ulvstorpasjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Batmotorer far ej anvandas, endast flytring.",
          conditions: null,
        },
        combustionMotor: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-ulvstorpasjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Batmotorer far ej anvandas, endast flytring.",
          conditions: null,
        },
      },
      practical: {
        accessibility: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiskekort-och-fiskevatten",
              type: "municipality",
            },
          ],
          note: "Flytbrygga finns och ar tillganglighetsanpassad.",
          conditions: null,
        },
        piers: [
          {
            name: "Tillganglighetsanpassad flytbrygga",
            value: "present",
            status: "verified",
            ruleType: "advisory",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiskekort-och-fiskevatten",
                type: "municipality",
              },
            ],
            note: "Metadata-only punkt utan koordinat i denna batch.",
            conditions: null,
            geometry: null,
          },
        ],
      },
      geography: {},
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  tenhultasjon: {
    id: "tenhultasjon",
    name: "Tenhultasjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.33, 57.69],
    distance: { kilometers: 18, travelTime: "20 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiskekort-och-fiskevatten",
        "https://www.ifiske.se/fiske-tenhultasjon.htm",
        "https://www.ifiske.se/fiskekort-tenhultasjon.htm",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "unverified", label: "Kontrollera aktuella regler" },
      protectedAreas: { status: "unknown", label: "Uppgift saknas" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Fiskekort kravs.",
          conditions: null,
        },
        permitProducts: {
          value: ["day", "year"],
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Aktuella korttyper inkluderar dagkort och arskort.",
          conditions: null,
        },
        youthRules: {
          value: "not-required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Fritt fiske for barn och ungdomar till och med 15 ars alder.",
          conditions: null,
        },
      },
      methods: {},
      species: {},
      watercraft: {},
      boat: {},
      practical: {},
      geography: {},
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  straken: {
    id: "straken",
    name: "Stråken",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [13.85, 57.95],
    distance: { kilometers: 31, travelTime: "32 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.ifiske.se/fiske-straken.htm",
        "https://www.ifiske.se/fiskekort-straken.htm",
        "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
        "https://www.ifiske.se/pdf/328/Strakens_FVOF_folder2026.pdf",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade specialregler" },
      protectedAreas: { status: "verified", label: "Fågelskyddsområden finns" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Fiskekort kravs.",
          conditions: null,
        },
        youthRules: {
          value: "not-required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Barn och ungdomar till och med 15 ar fiskar utan fiskekort, men sjon regler galler.",
          conditions: null,
        },
      },
      methods: {
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Mete ingar i handredskapsfisket.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Pimpel ingar i handredskapsfisket.",
          conditions: null,
        },
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Kastsposfiske ingar i handredskapsfisket.",
          conditions: null,
        },
        fly: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Flugfiske ingar i handredskapsfisket.",
          conditions: null,
        },
        trolling: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Trolling ingar i fiskekortet.",
          conditions: null,
        },
        iceMaxAngeldonPerAngler: {
          value: 10,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Max 10 angeldon, alternativt 10 ismetespon.",
          conditions: null,
        },
      },
      species: {
        sizeLimits: [
          {
            species: "oring",
            value: { minSizeCm: 50 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "gadda",
            value: { minSizeCm: 50, maxSizeCm: 90 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "abborre",
            value: { maxSizeCm: 35 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
                type: "commercial-aggregator",
              },
            ],
            note: "Abborre over 35 cm ska aterutsattas.",
            conditions: null,
          },
        ],
        closedSeasons: [
          {
            species: "oring",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
                type: "commercial-aggregator",
              },
            ],
            note: "Fredningstid for oring.",
            conditions: {
              dateFrom: "10-01",
              dateTo: "01-31",
              timeFrom: null,
              timeTo: null,
            },
          },
        ],
        releaseRequirements: [
          {
            species: "abborre",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
                type: "commercial-aggregator",
              },
            ],
            note: "Abborre over 35 cm ska aterutsattas.",
            conditions: null,
          },
        ],
      },
      watercraft: {},
      boat: {
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {
        rampsAvailable: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/pdf/328/Strakens_FVOF_folder2026.pdf",
              type: "commercial-aggregator",
            },
          ],
          note: "FVO-materialet anger att batramper finns.",
          conditions: null,
        },
      },
      geography: {
        tributaries: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Fiske i tillfloden ar inte tillatet.",
          conditions: null,
        },
        protectedAreas: [
          {
            name: "Fagelskyddsomraden",
            value: "restricted",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
                type: "commercial-aggregator",
              },
            ],
            note: "Fagelskyddsomraden finns i vattenomradet.",
            conditions: null,
            geometry: null,
          },
        ],
      },
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  spexhultasjon: {
    id: "spexhultasjon",
    name: "Spexhultasjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.66, 57.61],
    distance: { kilometers: 45, travelTime: "43 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-spexhultasjon.html",
        "https://www.ifiske.se/fiskekort-spexhultasjon.htm",
        "https://spexhultasjon.se/fiskekort.html",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade grundregler" },
      protectedAreas: { status: "unknown", label: "Uppgift saknas" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://spexhultasjon.se/fiskekort.html",
              type: "fvo-club",
            },
          ],
          note: "Fiskekort kravs.",
          conditions: null,
        },
        permitProducts: {
          value: ["day", "week", "year", "angel-ice"],
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://spexhultasjon.se/fiskekort.html",
              type: "fvo-club",
            },
          ],
          note: "Kortutbud inkluderar dag, vecka, ar samt separat angel/isfiskekort.",
          conditions: null,
        },
      },
      methods: {
        nets: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://spexhultasjon.se/fiskekort.html",
              type: "fvo-club",
            },
          ],
          note: "Nat ingar inte i ordinarie fiskekort.",
          conditions: null,
        },
        fixedGear: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://spexhultasjon.se/fiskekort.html",
              type: "fvo-club",
            },
          ],
          note: "Fasta redskap ingar inte i ordinarie fiskekort.",
          conditions: null,
        },
        crayfishFishing: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://spexhultasjon.se/fiskekort.html",
              type: "fvo-club",
            },
          ],
          note: "Kraftfiske ingar inte i ordinarie fiskekort.",
          conditions: null,
        },
      },
      species: {
        knownSpecies: {
          value: ["gadda", "sik", "abborre"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-spexhultasjon.html",
              type: "municipality",
            },
          ],
          note: "Kommunen listar dessa som forekommande arter.",
          conditions: null,
        },
      },
      watercraft: {},
      boat: {
        boatRentalAvailable: {
          value: "absent",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://spexhultasjon.se/fiskekort.html",
              type: "fvo-club",
            },
          ],
          note: "FVO anger att uthyrningsbatar saknas.",
          conditions: null,
        },
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {
        ramp: {
          value: "absent",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://spexhultasjon.se/fiskekort.html",
              type: "fvo-club",
            },
          ],
          note: "FVO anger att båtramp saknas.",
          conditions: null,
          geometry: null,
        },
      },
      geography: {},
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  ryssbysjon: {
    id: "ryssbysjon",
    name: "Ryssbysjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.63, 57.69],
    distance: { kilometers: 43, travelTime: "42 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-ryssbysjon.html",
        "https://www.ifiske.se/fiske-ryssbysjons-fvof-nassjo.htm",
        "https://www.ifiske.se/fiskekort-ryssbysjons-fvof-nassjo.htm",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade specialregler" },
      protectedAreas: { status: "verified", label: "Fågelskyddsområde finns" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-ryssbysjon.html",
              type: "municipality",
            },
          ],
          note: "Fiskekort kravs.",
          conditions: null,
        },
      },
      methods: {
        weekdayClosures: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-ryssbysjon.html",
              type: "municipality",
            },
          ],
          note: "Fiske ar forbjudet varje mandag och tisdag. Veckodagsvillkor lagras som notering eftersom veckodagsfalten inte finns i nuvarande conditions-konvention.",
          conditions: null,
        },
        augustFishingHours: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-ryssbysjon.html",
              type: "municipality",
            },
          ],
          note: "Under augusti ar fiske tillatet endast 07:00-18:00.",
          conditions: {
            dateFrom: "08-01",
            dateTo: "08-31",
            timeFrom: "07:00",
            timeTo: "18:00",
          },
        },
        crayfishFishing: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-ryssbysjon.html",
              type: "municipality",
            },
          ],
          note: "Kraftfiske ar forbjudet.",
          conditions: null,
        },
      },
      species: {},
      watercraft: {},
      boat: {
        boatRentalAvailable: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-ryssbysjon.html",
              type: "municipality",
            },
          ],
          note: "Batuthyrning finns.",
          conditions: null,
        },
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: "Utanför fagelskyddsomradet saknas verifierad motordata i denna batch.",
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: "Utanför fagelskyddsomradet saknas verifierad motordata i denna batch.",
          conditions: null,
        },
      },
      practical: {},
      geography: {
        protectedAreas: [
          {
            name: "Södra delen - fågelskyddsområde",
            kind: "bird-protection",
            value: "restricted",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-ryssbysjon.html",
                type: "municipality",
              },
            ],
            restriction: "motor prohibited",
            note: "Totalt båtmotorförbud i fågelskyddsområdet i sjöns södra del.",
            conditions: null,
            geometry: null,
          },
        ],
      },
      safety: {
        consumptionAdvisories: [
          {
            substance: "PFOS",
            value: "restricted",
            status: "verified",
            ruleType: "advisory",
            verifiedAt: "2026-08-09",
            authority: "Nassjo kommun / Livsmedelsverkets rekommendation",
            sources: [
              {
                url: "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-ryssbysjon.html",
                type: "municipality",
              },
            ],
            note: "PFOS i samlingsprov av abborre uppges till 12.7-22.9 ng/g, over refererad grans 9.1 ng/g vatvikt. Rekommendation: vuxna hogst 4-6 ganger/ar, barn hogst 2-4 ganger/ar. Avser langvarig ackumulering, inte akut forgiftningsrisk.",
            conditions: null,
          },
        ],
      },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  nommen: {
    id: "nommen",
    name: "Nömmen",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.8, 57.57],
    distance: { kilometers: 55, travelTime: "52 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://nassjo.se/uppleva-och-gora/aktivitet/fiske-nommen.html",
        "https://www.ifiske.se/fiskekort-nommen.htm",
        "https://www.ifiske.se/fiskekort-nommen.htm?rules=238",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade specialregler" },
      protectedAreas: { status: "checking", label: "Kontrolleras" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-nommen.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Fiskekort kravs.",
          conditions: null,
        },
        permitProducts: {
          value: ["day", "week", "year"],
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-nommen.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Aktuella korttyper inkluderar dag, vecka och ar.",
          conditions: null,
        },
        youthRules: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-nommen.htm?rules=238",
              type: "commercial-aggregator",
            },
          ],
          note: "Fritt fiske till och med 15 ar endast i sallskap med vuxen/person med giltigt fiskekort och pa dennes kvot.",
          conditions: null,
        },
      },
      methods: {
        maxRodsPerPermit: {
          value: 3,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-nommen.htm?rules=238",
              type: "commercial-aggregator",
            },
          ],
          note: "Max 3 redskap/spon per fiskekort.",
          conditions: null,
        },
        augustSportFishingHours: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-nommen.htm?rules=238",
              type: "commercial-aggregator",
            },
          ],
          note: "Under 1 aug-15 aug ar sportfiske tillatet endast 06:00-21:00.",
          conditions: {
            dateFrom: "08-01",
            dateTo: "08-15",
            timeFrom: "06:00",
            timeTo: "21:00",
          },
        },
        trolling: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-nommen.htm?rules=238",
              type: "commercial-aggregator",
            },
          ],
          note: "Trolling forbjudet under 1 aug-15 aug.",
          conditions: {
            dateFrom: "08-01",
            dateTo: "08-15",
            timeFrom: null,
            timeTo: null,
          },
        },
        winterIceFishingAnnualPermit: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-nommen.htm?rules=238",
              type: "commercial-aggregator",
            },
          ],
          note: "Arskort omfattar vinterfiske med angel, pimpel och ismete under gällande redskapsbegransningar.",
          conditions: null,
        },
      },
      species: {
        sizeLimits: [
          {
            species: "gadda",
            value: { minSizeCm: 50, maxSizeCm: 90 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-nommen.htm?rules=238",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "gos",
            value: { minSizeCm: 50, maxSizeCm: 70 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-nommen.htm?rules=238",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
        ],
        bagLimits: [
          {
            species: "gos",
            value: { maxRetainedPerPermitPerDay: 3 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-nommen.htm?rules=238",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
        ],
      },
      watercraft: {},
      boat: {
        boatRentalAvailable: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-nommen.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Batuthyrning finns.",
          conditions: null,
        },
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {},
      geography: {},
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  risbrodammen: {
    id: "risbrodammen",
    name: "Risbrodammen",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.013443, 57.850559],
    distance: { kilometers: 19, travelTime: "22 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://risbrodammen-fiske.se/",
        "https://risbrodammen-fiske.se/regler.html",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade specialregler" },
      protectedAreas: { status: "verified", label: "Fågelskyddsområde finns" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/regler.html",
              type: "fvo-club",
            },
          ],
          note: "Fiskekort krävs.",
          conditions: null,
        },
        youthRules: {
          value: "not-required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/regler.html",
              type: "fvo-club",
            },
          ],
          note: "Barn under 10 år fiskar utan fiskekort.",
          conditions: null,
        },
      },
      methods: {
        fishingSeason: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/regler.html",
              type: "fvo-club",
            },
          ],
          note: "Fiske tillåtet under ordinarie säsong.",
          conditions: {
            dateFrom: "05-01",
            dateTo: "09-30",
            timeFrom: null,
            timeTo: null,
          },
        },
        fishingHoursInSeason: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/regler.html",
              type: "fvo-club",
            },
          ],
          note: "Fiske tillåtet mellan 05:00 och 22:00 under ordinarie säsong.",
          conditions: {
            dateFrom: "05-01",
            dateTo: "09-30",
            timeFrom: "05:00",
            timeTo: "22:00",
          },
        },
        outsideSeasonFishing: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/regler.html",
              type: "fvo-club",
            },
          ],
          note: "Fiske är förbjudet utanför säsongen 1 maj-30 september.",
          conditions: null,
        },
        crayfishFishing: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/regler.html",
              type: "fvo-club",
            },
          ],
          note: "Kräftfiske är förbjudet för ordinarie kortinnehavare. Undantag finns för markägare med eget fiskevatten.",
          conditions: null,
        },
      },
      species: {
        knownSpecies: {
          value: ["gädda", "abborre", "mört", "sutare"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/",
              type: "fvo-club",
            },
          ],
          note: "Kända arter enligt FVO:s information.",
          conditions: null,
        },
      },
      watercraft: {},
      boat: {
        boatRentalAvailable: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/",
              type: "fvo-club",
            },
          ],
          note: "Båtuthyrning finns med totalt 10 båtar, max 4 personer per båt.",
          conditions: null,
        },
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {
        parkingAtBoatStations: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/",
              type: "fvo-club",
            },
          ],
          note: "Verifierad parkering finns vid båda båtstationerna.",
          conditions: null,
        },
        rentalAgeRule: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/",
              type: "fvo-club",
            },
          ],
          note: "Barn under 12 år får inte hyra båt utan vuxet sällskap.",
          conditions: null,
        },
        rentalStations: [
          {
            name: "Risbro",
            value: "present",
            status: "verified",
            ruleType: "advisory",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://risbrodammen-fiske.se/",
                type: "fvo-club",
              },
            ],
            note: "5 uthyrningsbåtar, parkering finns, camping ej tillåten.",
            coordinates: [14.016333, 57.852639],
            originalCoordinate: "57°51'09.5\"N, 14°00'58.8\"E",
            geometry: null,
          },
          {
            name: "Midsommarängen",
            value: "present",
            status: "verified",
            ruleType: "advisory",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://risbrodammen-fiske.se/",
                type: "fvo-club",
              },
            ],
            note: "5 uthyrningsbåtar, parkering finns, camping ej tillåten.",
            coordinates: [14.011361, 57.834167],
            originalCoordinate: "57°50'03.0\"N, 14°00'40.9\"E",
            geometry: null,
          },
        ],
      },
      geography: {
        protectedAreas: [
          {
            name: "Söder om bron vid Gigeryd/Tunabo",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://risbrodammen-fiske.se/regler.html",
                type: "fvo-club",
              },
            ],
            note: "Området söder om bron är inte del av FVO. Allmän tillgång på vattnet och fiske är förbjudet under säsongen.",
            conditions: {
              dateFrom: "05-01",
              dateTo: "09-30",
              timeFrom: null,
              timeTo: null,
            },
            geometry: null,
          },
        ],
      },
      safety: {
        navigationNotes: [
          {
            value: "caution",
            status: "verified",
            ruleType: "advisory",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://risbrodammen-fiske.se/",
                type: "fvo-club",
              },
            ],
            note: "Flytande vassöar förekommer. Gå inte iland på dem, de kan flytta sig och är instabila. Båttrafik ska vara uppmärksam då de kan hindra framkomlighet.",
            conditions: null,
          },
        ],
      },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  mullsjon: {
    id: "mullsjon",
    name: "Mullsjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [13.881149, 57.910816],
    distance: { kilometers: 31, travelTime: "32 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
        "https://www.ifiske.se/fiskekort-mullsjon.htm",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade grundregler" },
      protectedAreas: { status: "unknown", label: "Uppgift saknas" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-mullsjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Fiskekort krävs.",
          conditions: null,
        },
        permitProducts: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-mullsjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Aktuella fiskekortsprodukter finns i källan.",
          conditions: null,
        },
      },
      methods: {},
      species: {
        knownSpecies: {
          value: ["gädda", "abborre", "gös"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-mullsjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Kända sportfiskarter enligt angiven källa.",
          conditions: null,
        },
      },
      watercraft: {
        boat: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      boat: {
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {},
      geography: {},
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  gravsjon: {
    id: "gravsjon",
    name: "Gravsjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [13.887164, 57.97047],
    distance: { kilometers: 37, travelTime: "38 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
        "https://www.ifiske.se/fiske-gravsjon.htm",
        "https://www.ifiske.se/fiskekort-gravsjon.htm",
        "https://www.ifiske.se/karta-gravsjon.htm",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade motorregler" },
      protectedAreas: { status: "unknown", label: "Uppgift saknas" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-gravsjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Fiskekort krävs.",
          conditions: null,
        },
        permitProducts: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-gravsjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Aktuella kortprodukter finns i källan.",
          conditions: null,
        },
      },
      methods: {},
      species: {
        knownSpecies: {
          value: ["gädda", "abborre"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-gravsjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Kända sportfiskarter enligt angiven källa.",
          conditions: null,
        },
      },
      watercraft: {
        boat: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        kayak: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        floatTube: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      boat: {
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: null,
          conditions: null,
        },
      },
      practical: {},
      geography: {},
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  sandhemssjon: {
    id: "sandhemssjon",
    name: "Sandhemssjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [13.780182, 57.995918],
    distance: { kilometers: 46, travelTime: "45 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
        "https://www.ifiske.se/fiske-sandhemssjon.htm",
        "https://www.ifiske.se/karta-sandhemssjon.htm",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "unverified", label: "Kontrollera aktuella regler" },
      protectedAreas: { status: "unknown", label: "Uppgift saknas" },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  knipesjon: {
    id: "knipesjon",
    name: "Knipesjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [13.89825, 57.93869],
    distance: { kilometers: 34, travelTime: "35 min" },
    verification: {
      status: "partially-verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "unverified", label: "Kontrollera aktuella regler" },
      protectedAreas: { status: "unknown", label: "Uppgift saknas" },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  hokesjon: {
    id: "hokesjon",
    name: "Hökesjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [13.978597, 57.901005],
    distance: { kilometers: 23, travelTime: "26 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.ifiske.se/fiske-hokesjons-fvof-habo-kommun.htm",
        "https://www.ifiske.se/karta-hokesjons-fvof-habo-kommun.htm",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade grundregler" },
      protectedAreas: { status: "unknown", label: "Uppgift saknas" },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  svansjon: {
    id: "svansjon",
    name: "Svansjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [13.785222, 57.810722],
    distance: { kilometers: 36, travelTime: "38 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-08-08",
      sources: [
        "https://www.ifiske.se/fiske-svansjon-samt-tillhorande-tokebosjon.htm",
        "https://www.ifiske.se/fiskekort-svansjon-samt-tillhorande-tokebosjon.htm",
        "https://www.ifiske.se/karta-svansjon-samt-tillhorande-tokebosjon.htm",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Verifierade grundregler" },
      protectedAreas: { status: "unknown", label: "Uppgift saknas" },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },
};
