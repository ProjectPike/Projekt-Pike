Warning: truncated output (original token count: 52724)
Total output lines: 6146

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
    coordinates: [13.698374, 56.9209012],
    coordinateSource: "https://www.openstreetmap.org/relation/7130",
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
    coordinates: [14.512562, 57.9761304],
    coordinateSource: "https://www.openstreetmap.org/relation/9560",
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
      methods: {
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://bunnfiske.se/images/pdf/Bunninfo.pdf",
              type: "fvo-club",
            },
            {
              url: "https://www.ifiske.se/fiskekort-bunn-sodra-bunn.htm?rules=241",
              type: "commercial-aggregator",
            },
          ],
          note: "Spinnfiske är bekräftat i både Norra/Mellersta och Södra Bunns regelområden.",
          conditions: null,
        },
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://bunnfiske.se/images/pdf/Bunninfo.pdf",
              type: "fvo-club",
            },
            {
              url: "https://www.ifiske.se/fiskekort-bunn-sodra-bunn.htm?rules=241",
              type: "commercial-aggregator",
            },
          ],
          note: "Mete är bekräftat i både Norra/Mellersta och Södra Bunns regelområden.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://bunnfiske.se/images/pdf/Bunninfo.pdf",
              type: "fvo-club",
            },
            {
              url: "https://www.ifiske.se/fiskekort-bunn-sodra-bunn.htm?rules=241",
              type: "commercial-aggregator",
            },
          ],
          note: "Pimpelfiske är bekräftat i både Norra/Mellersta och Södra Bunns regelområden.",
          conditions: null,
        },
      },
      species: {
        knownSpecies: {
          value: [
            "abborre",
            "gädda",
            "gös",
            "lake",
            "braxen",
            "mört",
            "gers",
            "nors",
            "sarv",
            "signalkräfta",
          ],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://bunnfiske.se/item/fisk-i-bunn.html",
              type: "fvo-club",
            },
          ],
          note: "Arterna gäller för både Norra och Södra Bunn.",
          conditions: null,
        },
        sizeLimits: [
          {
            species: "gädda",
            value: { minSizeCm: 50, maxSizeCm: 80 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [
              {
                url: "https://bunnfiske.se/item/fiskekort.html",
                type: "fvo-club",
              },
              {
                url: "https://www.ifiske.se/fiskekort-bunn-sodra-bunn.htm?rules=241",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "abborre",
            value: { maxSizeCm: 38 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [
              {
                url: "https://bunnfiske.se/item/fiskekort.html",
                type: "fvo-club",
              },
              {
                url: "https://www.ifiske.se/fiskekort-bunn-sodra-bunn.htm?rules=241",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
          {
            species: "gös",
            value: { maxSizeCm: 70,minSizeCm:50},
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [
              {
                url: "https://bunnfiske.se/item/fiskekort.html",
                type: "fvo-club",
              },
              {
                url: "https://www.ifiske.se/fiskekort-bunn-sodra-bunn.htm?rules=241",
                type: "commercial-aggregator",
              },
            ],
            note: "Minimimått skiljer mellan regelområdena och är därför inte angivet här.",
            conditions: null,
          },
        ],bagLimits:[{speciesGroup:"g\xE4dda+g\xF6s",value:{maxRetainedPerPermitPerDay:2},status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://bunnfiske.se/item/fiskekort.html",type:"fvo-club"}],note:"Gemensam dygnsgr\xE4ns f\xF6r g\xE4dda och g\xF6s.",conditions:null}],
      },
      watercraft: {
        boat: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [{url:"https://bunnfiske.se/item/hitta-hit.html",type:"fvo-club"}],
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
            note: "Sjösättningsplatsen vid Roten/Rotabron för Norra/Mellersta Bunn är stängd under perioden.",
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
      geography: {fishingProhibitionAreas:[{name:"Avst\xE5nd till tomt eller brygga",value:"prohibited",status:"verified",ruleType:"rule",verifiedAt:"2026-08-09",sources:[{url:"https://bunnfiske.se/item/fiskekort.html",type:"fvo-club"}],note:"Fiske f\xE5r inte bedrivas n\xE4rmare \xE4n 75 meter fr\xE5n tomt eller brygga.",conditions:null,geometry:null}]},
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
    coordinates: [15.1800048, 58.011567],
    coordinateSource: "https://www.openstreetmap.org/relation/254688",
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
    coordinates: [14.5309404, 58.3794802],
    coordinateSource: "https://www.openstreetmap.org/relation/253599",
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
            name: "Fasta redskap och fiskodlingar",
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
    coordinates: [14.1651865, 57.7724818],
    coordinateSource: "https://www.openstreetmap.org/way/15749182",
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
          note: "Sportfiskekort krävs för fiske.",
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
          note: "Sportfiskekortet är kostnadsfritt.",
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
        purchaseChannels: {
          value: ["digital", "physical-resellers"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Sportfiskekortet finns digitalt och på papper.",
          conditions: null,
        },
      },
      methods: {
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Spinnfiske är tillåtet som handredskapsfiske enligt fiskelagen.",
          conditions: null,
        },
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Mete är tillåtet som handredskapsfiske enligt fiskelagen.",
          conditions: null,
        },
        fly: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Flugfiske är tillåtet som handredskapsfiske enligt fiskelagen.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Isfiske är tillåtet med högst fem beten per person.",
          conditions: null,
        },
        iceMaxBaitsPerAngler: {
          value: 5,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Vid isfiske gäller högst fem beten per person.",
          conditions: null,
        },
        trolling: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munks…22724 tokens truncated…l,
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
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/",
              type: "fvo-club",
            },
          ],
          note: "Båtramper saknas och FVO anger att egna båtar inte kan sjösättas.",
          conditions: null,
          geometry: null,
        },
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
        ],boatRamp:{value:"absent",status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://risbrodammen-fiske.se/regler.html",type:"fvo-club"}],note:"Det finns ingen b\xE5tramp och egen b\xE5t kan d\xE4rf\xF6r inte sj\xF6s\xE4ttas.",conditions:null},
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
    coordinates: [13.8814229, 57.9097852],
    coordinateSource: "https://www.openstreetmap.org/relation/8027934",
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
        },youthRules:{value:"not-required",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiskekort-mullsjon.htm",type:"commercial-aggregator"}],note:"Barn och ungdomar till och med 15 \xE5r fiskar fritt i de vatten och p\xE5 de platser som omfattas av ungdomsregeln.",conditions:null},
      },
      methods: {
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.mullsjosfk.se/medlem/",
              type: "fvo-club",
            },{url:"https://www.ifiske.se/fiskekort-mullsjon.htm",type:"commercial-aggregator"},
          ],
          note: "Kastspö är tillåtet med fiskekort.",
          conditions: null,
        },
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.mullsjosfk.se/medlem/",
              type: "fvo-club",
            },{url:"https://www.ifiske.se/fiskekort-mullsjon.htm",type:"commercial-aggregator"},
          ],
          note: "Metspö är tillåtet med fiskekort.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.mullsjosfk.se/medlem/",
              type: "fvo-club",
            },{url:"https://www.ifiske.se/fiskekort-mullsjon.htm",type:"commercial-aggregator"},
          ],
          note: "Pimpel är tillåtet med fiskekort.",
          conditions: null,
        },trolling:{value:"restricted",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiskekort-mullsjon.htm",type:"commercial-aggregator"}],note:"Trolling ing\xE5r; max tv\xE5 sp\xF6n per person och fyra sp\xF6n per b\xE5t.",conditions:null},
      },
      species: {
        knownSpecies: {
          value: ["gädda", "abborre", "mört", "sutare"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
              type: "municipality",
            },
          ],
          note: "Verifierad förekomst av gädda, abborre, mört och sutare.",
          conditions: null,
        },sizeLimits:[{species:"g\xE4dda",value:{minSizeCm:51,maxSizeCm:89},status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiskekort-mullsjon.htm",type:"commercial-aggregator"}],note:"G\xE4dda p\xE5 50 cm och kortare samt 90 cm och l\xE4ngre ska \xE5teruts\xE4ttas.",conditions:null},{species:"abborre",value:{maxSizeCm:34},status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiskekort-mullsjon.htm",type:"commercial-aggregator"}],note:"Abborre p\xE5 35 cm och l\xE4ngre ska \xE5teruts\xE4ttas.",conditions:null}],
      },
      watercraft: {
        boat: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [{url:"https://www.ifiske.se/fiskekort-mullsjon.htm",type:"commercial-aggregator"}],
          note: null,
          conditions: null,
        },
      },
      boat: {
        boatRentalAvailable: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.mullsjosfk.se/klubbvatten/",
              type: "fvo-club",
            },{url:"https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",type:"municipality"},
          ],
          note: "Två uthyrningsbåtar finns via Landhs Konditori.",
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

  gravsjon: {
    id: "gravsjon",
    name: "Gravsjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [13.8875261, 57.9706602],
    coordinateSource: "https://www.openstreetmap.org/way/43674265",
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
          value: ["day", "month", "year", "angel-ice"],
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-gravsjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Dagskort, vinterdagskort, månadskort för öppet vatten och årskort finns. Ismete och angel ingår i särskilda vinterprodukter och årskortet.",
          conditions: null,
        },youthRules:{value:"not-required",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-gravsjon.htm",type:"commercial-aggregator"}],note:"Barn och ungdomar till och med 14 \xE5r fiskar fritt.",conditions:null},
      },
      methods: {
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-gravsjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Pimpel ingår i fiskekortet.",
          conditions: null,
        },
      },
      species: {
        knownSpecies: {
          value: ["gädda", "abborre", "mört"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
              type: "municipality",
            },{url:"https://www.ifiske.se/fiske-gravsjon.htm",type:"commercial-aggregator"},
          ],
          note: "Verifierad förekomst av gädda, abborre och mört.",
          conditions: null,
        },
      },
      watercraft: {
        boat: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [{url:"https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",type:"municipality"},{url:"https://www.ifiske.se/fiske-gravsjon.htm",type:"commercial-aggregator"}],
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
        boatRentalAvailable: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
              type: "municipality",
            },
          ],
          note: "Båtuthyrning finns.",
          conditions: null,
        },
        electricMotor: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-gravsjon.htm",
              type: "commercial-aggregator",
            },{url:"https://www.ifiske.se/fiske-gravsjon.htm",type:"commercial-aggregator"},
          ],
          note: "Endast eldrivna båtmotorer får användas.",
          conditions: null,
        },
        combustionMotor: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-gravsjon.htm",
              type: "commercial-aggregator",
            },{url:"https://www.ifiske.se/fiske-gravsjon.htm",type:"commercial-aggregator"},
          ],
          note: "Endast eldrivna båtmotorer får användas.",
          conditions: null,
        },
      },
      practical: {fishingPierAtBathingArea:{value:"present",status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-gravsjon.htm",type:"commercial-aggregator"}],note:"Vid badplatsen i sj\xF6ns norra del finns en brygga som kan anv\xE4ndas f\xF6r fiske.",conditions:null}},
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
    coordinates: [13.7861561, 58.0001589],
    coordinateSource: "https://www.openstreetmap.org/relation/123702",
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
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-sandhemssjon.htm",
              type: "commercial-aggregator",
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
              url: "https://www.ifiske.se/fiskekort-sandhemssjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Barn och ungdomar till och med 14 år fiskar utan fiskekort.",
          conditions: null,
        },permitProducts:{value:["day","week","year","family","angel-ice"],status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiskekort-sandhemssjon.htm",type:"commercial-aggregator"}],note:"Dagskort 70 kr, familjevecka 150 kr, \xE5rskort 250 kr och familje\xE5r 350 kr. S\xE4rskilda angel- och m\xF6rtstugekort finns.",conditions:null},
      },
      methods: {
        iceMaxAngeldonPerAngler: {
          value: 12,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-sandhemssjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Vid vinterfiske gäller max 12 angeldon/iskrokar per fiskare.",
          conditions: null,
        },
      },
      species: {
        sizeLimits: [
          {
            species: "gädda",
            value: { minSizeCm: 50, maxSizeCm: 90 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-sandhemssjon.htm",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
        ],
        releaseRequirements: [
          {
            species: "gädda",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-sandhemssjon.htm",
                type: "commercial-aggregator",
              },
            ],
            note: "Gädda över 90 cm ska återutsättas.",
            conditions: null,
          },
        ],knownSpecies:{value:["abborre","g\xE4dda","m\xF6rt","braxen"],status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",type:"municipality"}],note:"Arter enligt Mullsj\xF6 kommuns aktuella sj\xF6information.",conditions:null},
      },
      watercraft: {boat:{value:"allowed",status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/karta-sandhemssjon.htm",type:"commercial-aggregator"}],note:"B\xE5tramp och b\xE5tuthyrning finns dokumenterade.",conditions:null}},
      boat: {
        boatRentalAvailable: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/karta-sandhemssjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Båtuthyrning finns dokumenterad.",
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
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/karta-sandhemssjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Båtlaunch/båtramp finns dokumenterad vid eller nära Prästaviken.",
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

  knipesjon: {
    id: "knipesjon",
    name: "Knipesjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [13.8988537, 57.9374914],
    coordinateSource: "https://www.openstreetmap.org/relation/8150669",
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
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-03-01",
          sources: [
            {
              url: "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
              type: "municipality",
            },
          ],
          note: "Fiskekort krävs. Kommunen hänvisar till kontaktperson för att få fiskekort.",
          conditions: null,
        },
      },
      methods: {},
      species: {knownSpecies:{value:["abborre","g\xE4dda","m\xF6rt","ruda"],status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.hittafiske.se/planera-ditt-fiske/knipesjons-fvof/",type:"commercial-aggregator"}],note:"Arter som redovisas f\xF6r Knipesj\xF6ns FVOF.",conditions:null}},
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
        boatRentalAvailable: {
          value:"unknown",
          status:"unknown"  ,
          ruleType:"unknown"  ,
          verifiedAt:null         ,
          sources: [




          ],
          note:null                                                                                    ,
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
          value:"unknown",
          status:"unknown"  ,
          ruleType:"unknown"  ,
          verifiedAt:null         ,
          sources: [




          ],
          note:null                                               ,
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

  hokesjon: {
    id: "hokesjon",
    name: "Hökesjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [13.9765853, 57.8992456],
    coordinateSource: "https://www.openstreetmap.org/relation/8150509",
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
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
              type: "commercial-aggregator",
            },
            {
              url: "https://hokesjon.se/",
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
              url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Ungdom till och med 15 år fiskar utan fiskekort.",
          conditions: null,
        },
      },
      methods: {
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm?rules=1917",
              type: "commercial-aggregator",
            },
          ],
          note: "FVO:s regel anger spöfiske generellt; spinningsfiske är inte namngivet separat.",
          conditions: null,
        },
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm?rules=1917",
              type: "commercial-aggregator",
            },
          ],
          note: "FVO:s regel anger spöfiske generellt; mete är inte namngivet separat.",
          conditions: null,
        },
        fly: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm?rules=1917",
              type: "commercial-aggregator",
            },
          ],
          note: "FVO:s regel anger spöfiske generellt; flugfiske är inte namngivet separat.",
          conditions: null,
        },
        trolling: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm?rules=1917",
              type: "commercial-aggregator",
            },
          ],
          note: "Trolling omnämns uttryckligen i ordningsreglerna. Vid badplatser får fiskelinans väg inte korsa badande.",
          conditions: null,
        },
        maxRodsPerPermit: {
          value: 2,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Max 2 redskap per person.",
          conditions: null,
        },
        iceMaxAngeldonPerAngler: {
          value: 5,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Vid vinterfiske gäller max 5 angeldon per person.",
          conditions: null,
        },
      },
      species: {
        knownSpecies: {
          value: ["gädda", "abborre", "mört", "öring", "braxen"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://hokesjon.se/",
              type: "fvo-club",
            },
            {
              url: "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
              type: "municipality",
            },
          ],
          note: "Verifierad förekomst av gädda, abborre, mört, öring och braxen.",
          conditions: null,
        },
        releaseRequirements: [
          {
            species: "bäckröding",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
                type: "commercial-aggregator",
              },
            ],
            note: "Bäckröding ska återutsättas.",
            conditions: null,
          },
          {
            species: "öring",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
                type: "commercial-aggregator",
              },
            ],
            note: "Öring ska återutsättas.",
            conditions: null,
          },
          {
            species: "röding",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
                type: "commercial-aggregator",
              },
            ],
            note: "Röding ska återutsättas.",
            conditions: null,
          },
          {
            species: "gädda",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
                type: "commercial-aggregator",
              },
            ],
            note: "Gädda över 90 cm ska återutsättas.",
            conditions: null,
          },
          {
            species: "abborre",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-08-09",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
                type: "commercial-aggregator",
              },
            ],
            note: "Abborre över 32 cm ska återutsättas.",
            conditions: null,
          },
        ],
      },
      watercraft: {boat:{value:"allowed",status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://hokesjon.se/",type:"fvo-club"},{url:"https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",type:"commercial-aggregator"}],note:"Fyra uthyrningsb\xE5tar finns.",conditions:null}},
      boat: {
        boatRentalAvailable: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
              type: "commercial-aggregator",
            },
            {
              url: "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
              type: "municipality",
            },
          ],
          note: "Fyra uthyrningsbåtar finns dokumenterade.",
          conditions: null,
        },
        electricMotor: {
          value: "unknown",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-hokesjons-fvof-habo-kommun.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "FVO anger att man föredrar endast elmotor av miljöskäl; det är en rekommendation och inte ett hårt motorförbud.",
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
      practical: {visitorFacilities:{value:"present",status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/karta-hokesjons-fvof-habo-kommun.htm",type:"commercial-aggregator"}],note:"Kartan visar kanotil\xE4ggning, badplatser, parkering, rast- och grillplatser, vindskydd, t\xE4ltplatser och fiske fr\xE5n land. Exakta l\xE4gen finns i k\xE4llkartan.",conditions:null}},
      geography: {protectedAreas:[{name:"Till- och fr\xE5nrinnande vatten",value:"prohibited",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/karta-hokesjons-fvof-habo-kommun.htm",type:"commercial-aggregator"}],note:"Fiske \xE4r f\xF6rbjudet i direkt anslutning till sj\xF6ns till- och fr\xE5nrinnande vatten.",conditions:null,geometry:null}]},
      safety: {},
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  attarpsdammen: {
    id: "attarpsdammen",
    name: "Attarpsdammen",
    type: "damm",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.116029, 57.859201],
    coordinateSource:
      "https://www.naturkartan.se/sv/jonkopings-lan/attarpsdammen-grillplats",
    distance: { kilometers: 10, travelTime: "14 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-09-08",
      sources: [
        "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
        "https://jkpg.com/upplevelser/fiske-i-jonkoping",
        "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiskekort-och-fiskevatten",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Dagskort krävs" },
      rules: { status: "verified", label: "Verifierade specialregler" },
      protectedAreas: { status: "verified", label: "Lokalt fiskeförbud finns" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
              type: "fvo-club",
            },
          ],
          note: "Dagskort krävs för den som inte är medlem i Jönköpings Sportfiskeklubb. Medlemmar fiskar utan separat dagskort.",
          conditions: null,
        },
        permitCost: {
          value: 50,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
              type: "fvo-club",
            },
            {
              url: "https://jkpg.com/upplevelser/fiske-i-jonkoping",
              type: "other",
            },
          ],
          note: "Dagskortet kostar 50 kr.",
          conditions: null,
        },
        permitProducts: {
          value: ["day"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
              type: "fvo-club",
            },
          ],
          note: "Kortet gäller ett dygn.",
          conditions: null,
        },
        youthRules: {
          value: "not-required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
              type: "fvo-club",
            },
          ],
          note: "Barn till och med 12 år får fiska utan medlemskap eller dagskort.",
          conditions: null,
        },
        purchaseChannels: {
          value: ["digital", "physical-resellers"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://jkpg.com/upplevelser/fiske-i-jonkoping",
              type: "other",
            },
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiskekort-och-fiskevatten",
              type: "municipality",
            },
          ],
          note: "Betala med Swish till 123-604 67 75. Kommunen anger även Fortuna Spelbutik i Bankeryds centrum och Oljeshejkerna Jonsson i Bankeryd som återförsäljare.",
          conditions: null,
        },
      },
      methods: {
        handGearOnly: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
              type: "fvo-club",
            },
          ],
          note: "Fiske är tillåtet från land med fiskespö.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
              type: "fvo-club",
            },
          ],
          note: "Vinterfiske med pimpelspö får bedrivas i hela dammen på egen risk.",
          conditions: null,
        },
      },
      species: {
        knownSpecies: {
          value: ["sutare", "braxen", "mört", "abborre", "gädda", "öring"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://jkpg.com/upplevelser/fiske-i-jonkoping",
              type: "other",
            },
          ],
          note: "Destination Jönköping anger sutare, braxen, mört, abborre och gädda samt ett mindre bestånd av öring.",
          conditions: null,
        },
      },
      watercraft: {
        boat: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
              type: "fvo-club",
            },
          ],
          note: "Båtar och andra flytetyg är förbjudna.",
          conditions: null,
        },
        kayak: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
              type: "fvo-club",
            },
          ],
          note: "Kajak omfattas av förbudet mot båtar och andra flytetyg.",
          conditions: null,
        },
        floatTube: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
              type: "fvo-club",
            },
          ],
          note: "Flytring omfattas av förbudet mot båtar och andra flytetyg.",
          conditions: null,
        },
      },
      boat: {},
      practical: {
        visitorFacilities: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.naturkartan.se/sv/jonkopings-lan/attarpsdammen-grillplats",
              type: "municipality",
            },
          ],
          note: "Kommunens Naturkartan visar en grillplats vid dammen.",
          conditions: null,
        },
      },
      geography: {
        fishingProhibitionAreas: [
          {
            name: "Västra stranden mot dammfästet",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-08",
            sources: [
              {
                url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
                type: "fvo-club",
              },
            ],
            note: "På västra sidan är fiske förbjudet från den skyltade gränspunkten fram till dammfästet. Följ skyltningen på plats; området skyddar fågellivet och den orörda stranden.",
            conditions: null,
            geometry: null,
          },
        ],
      },
      safety: {
        winterFishingRisk: {
          value: "caution",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80555/attarpsdammen",
              type: "fvo-club",
            },
          ],
          note: "Pimpelfiske sker på egen risk. Kontrollera alltid isens bärighet lokalt.",
          conditions: null,
        },
      },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  klappasjon: {
    id: "klappasjon",
    name: "Klappasjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.51712, 57.55435],
    coordinateSource:
      "https://vattenwebb.smhi.se/svarwebb/",
    distance: { kilometers: 38, travelTime: "34 min" },
    verification: {
      status: "verified",
      updatedAt: "2026-09-08",
      sources: [
        "https://www.hittafiske.se/planera-ditt-fiske/klappasjons-fvof/",
        "https://nassjo.se/uppleva-och-gora/aktivitet/klappabadet-badplats.html",
      ],
    },
    fishing: {
      permit: { status: "verified", label: "Fiskekort krävs" },
      rules: { status: "verified", label: "Handredskap ingår" },
      protectedAreas: { status: "unknown", label: "Uppgift saknas" },
    },
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.hittafiske.se/planera-ditt-fiske/klappasjons-fvof/",
              type: "other",
            },
          ],
          note: "Fiskekort krävs och gäller fiske med handredskap.",
          conditions: null,
        },
        permitCost: {
          value: 20,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.hittafiske.se/planera-ditt-fiske/klappasjons-fvof/",
              type: "other",
            },
          ],
          note: "Dagskort 20 kr, veckokort 100 kr, årskort 200 kr och familjeårskort 250 kr.",
          conditions: null,
        },
        permitProducts: {
          value: ["day", "week", "year", "family"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.hittafiske.se/planera-ditt-fiske/klappasjons-fvof/",
              type: "other",
            },
          ],
          note: "Dagskort, veckokort, årskort och familjeårskort finns.",
          conditions: null,
        },
        purchaseChannels: {
          value: ["digital"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.hittafiske.se/planera-ditt-fiske/klappasjons-fvof/",
              type: "other",
            },
          ],
          note: "Swisha till 070-688 31 68 och skriv fiskekort som meddelande.",
          conditions: null,
        },
      },
      methods: {
        handGearOnly: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.hittafiske.se/planera-ditt-fiske/klappasjons-fvof/",
              type: "other",
            },
          ],
          note: "Det publicerade fiskekortet gäller fiske med handredskap. Övriga redskap omfattas inte av den verifierade kortinformationen.",
          conditions: null,
        },
      },
      species: {
        knownSpecies: {
          value: ["abborre", "gädda", "lake", "mört", "sutare"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://www.hittafiske.se/planera-ditt-fiske/klappasjons-fvof/",
              type: "other",
            },
          ],
          note: "Klappasjöns FVOF anger abborre, gädda, lake, mört och sutare.",
          conditions: null,
        },
      },
      watercraft: {},
      boat: {},
      practical: {
        visitorFacilities: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://nassjo.se/uppleva-och-gora/aktivitet/klappabadet-badplats.html",
              type: "municipality",
            },
          ],
          note: "Klappabadet har grillplats, brygga, toalett, omklädningsrum, gungställning och cirka 20 parkeringsplatser.",
          conditions: null,
        },
        accessibility: {
          value: "absent",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-08",
          sources: [
            {
              url: "https://nassjo.se/uppleva-och-gora/aktivitet/klappabadet-badplats.html",
              type: "municipality",
            },
          ],
          note: "Klappabadet anges inte vara tillgänglighetsanpassat.",
          conditions: null,
        },
      },
      geography: {},
      safety: {},
    },
    practical: {
      parking: { status: "verified", label: "Cirka 20 platser", locations: [] },
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
    coordinates: [13.7839315, 57.8077537],
    coordinateSource: "https://www.openstreetmap.org/relation/2719114",
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
    details: {
      access: {
        permitRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-svansjon-samt-tillhorande-tokebosjon.htm",
              type: "commercial-aggregator",
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
              url: "https://www.ifiske.se/fiskekort-svansjon-samt-tillhorande-tokebosjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Ungdom till och med 18 år fiskar utan fiskekort.",
          conditions: null,
        },
      },
      methods: {},
      species: {knownSpecies:{value:["abborre","m\xF6rt","braxen","g\xE4dda","lake","sutare","g\xE4rs"],status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-svansjon-samt-tillhorande-tokebosjon.htm",type:"commercial-aggregator"}],note:"Arter och relativa f\xF6rekomster redovisas av FVO via iFiske.",conditions:null}},
      watercraft: {
        boat: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [{url:"https://www.ifiske.se/karta-svansjon-samt-tillhorande-tokebosjon.htm",type:"commercial-aggregator"}],
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
        boatRentalAvailable: {
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-svansjon-samt-tillhorande-tokebosjon.htm",
              type: "commercial-aggregator",
            },{url:"https://www.ifiske.se/karta-svansjon-samt-tillhorande-tokebosjon.htm",type:"commercial-aggregator"},
          ],
          note: "Fiskeföreningsbåt finns till uthyrning vid platsen.",
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
          value: "present",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-08-09",
          sources: [
            {
              url: "https://www.ifiske.se/karta-svansjon-samt-tillhorande-tokebosjon.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Dokumenterad launchplats finns vid vattenområdet.",
          conditions: null,
          geometry: null,
        },parkingAtLaunch:{value:"present",status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/karta-svansjon-samt-tillhorande-tokebosjon.htm",type:"commercial-aggregator"}],note:"Parkering kan ske p\xE5 l\xE4mplig plats p\xE5 ladug\xE5rdsplanen intill il\xE4ggningsplatsen.",conditions:null},
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
  "mogolen-hedenstorp": {
    "id": "mogolen-hedenstorp",
    "name": "Mogölen",
    "region": "Småland",
    "counties": [
      "Jönköping"
    ],
    "coordinates": [
      14.0921,
      57.7638
    ],
    "type": "sjö",
    "coordinateSource": "https://www.openstreetmap.org/way/23543551",
    "distance": {
      "kilometers": 7,
      "travelTime": "7–12 min"
    },
    "verification": {
      "sources": [
        "https://www.jsf-fiske.net/sida/80557/mogolen",
        "https://karta.jonkoping.se/dp/dp041125.pdf",
        "https://www.openstreetmap.org/way/23543551",
        "https://www.rome2rio.com/sv/s/J%C3%B6nk%C3%B6ping/Hedenstorp-industri"
      ],
      "status": "partially-verified",
      "updatedAt": "2026-09-13"
    },
    "fishing": {
      "permit": {
        "label": "Endast klubbmedlemmar",
        "status": "restricted"
      },
      "protectedAreas": {
        "label": "Uppgift saknas",
        "status": "unknown"
      },
      "rules": {
        "label": "Verifierade grundregler",
        "status": "verified"
      }
    },
    "practical": {
      "parking": {
        "label": "Uppgift saknas",
        "locations": [],
        "status": "unknown"
      },
      "piers": [],
      "ramps": [],
      "trails": []
    },
    "details": {
      "access": {
        "membershipRequirement": {
          "value": "required",
          "status": "verified",
          "ruleType": "rule",
          "verifiedAt": "2026-09-13",
          "sources": [
            {
              "url": "https://www.jsf-fiske.net/sida/80557/mogolen",
              "type": "fvo-club"
            }
          ],
          "note": "Fiske är endast tillåtet för Jönköpings SFK:s medlemmar.",
          "conditions": null
        }
      },
      "methods": {
        "bait": {
          "value": "allowed",
          "status": "verified",
          "ruleType": "rule",
          "verifiedAt": "2026-09-13",
          "sources": [
            {
              "url": "https://www.jsf-fiske.net/sida/80557/mogolen",
              "type": "fvo-club"
            }
          ],
          "note": "Jönköpings SFK anger uttryckligen metspö som tillåtet.",
          "conditions": null
        },
        "maxRodsPerPerson": {
          "value": 2,
          "status": "verified",
          "ruleType": "rule",
          "verifiedAt": "2026-09-13",
          "sources": [
            {
              "url": "https://www.jsf-fiske.net/sida/80557/mogolen",
              "type": "fvo-club"
            }
          ],
          "note": "Regeln anges uttryckligen som 2 spön per person.",
          "conditions": null
        },
        "chumming": {
          "value": "allowed",
          "status": "verified",
          "ruleType": "rule",
          "verifiedAt": "2026-09-13",
          "sources": [
            {
              "url": "https://www.jsf-fiske.net/sida/80557/mogolen",
              "type": "fvo-club"
            }
          ],
          "note": "Mäskning är uttryckligen tillåten.",
          "conditions": null
        },
        "spin": {
          "conditions": null,
          "note": "Kastspö är uttryckligen tillåtet enligt Jönköpings SFK.",
          "ruleType": "rule",
          "sources": [
            {
              "type": "fvo-club",
              "url": "https://www.jsf-fiske.net/sida/80557/mogolen"
            }
          ],
          "status": "verified",
          "value": "allowed",
          "verifiedAt": "2026-09-14"
        }
      },
      "species": {
        "knownSpecies": {
          "value": [
            "abborre",
            "sutare",
            "ruda",
            "karp",
            "mört"
          ],
          "status": "verified",
          "ruleType": "advisory",
          "verifiedAt": "2026-09-13",
          "sources": [
            {
              "url": "https://www.jsf-fiske.net/sida/80557/mogolen",
              "type": "fvo-club"
            }
          ],
          "note": "Jönköpings SFK uppger gott bestånd av abborre, sutare och ruda samt att karp och mört finns i vattnet.",
          "conditions": null
        }
      },
      "watercraft": {
        "boat": {
          "value": "prohibited",
          "status": "verified",
          "ruleType": "rule",
          "verifiedAt": "2026-09-13",
          "sources": [
            {
              "url": "https://www.jsf-fiske.net/sida/80557/mogolen",
              "type": "fvo-club"
            }
          ],
          "note": "Källan anger uttryckligen att fiske från båt inte är tillåtet.",
          "conditions": null
        },
        "floatingCraft": {
          "value": "prohibited",
          "status": "verified",
          "ruleType": "rule",
          "verifiedAt": "2026-09-13",
          "sources": [
            {
              "url": "https://www.jsf-fiske.net/sida/80557/mogolen",
              "type": "fvo-club"
            }
          ],
          "note": "Källan förbjuder fiske från båt eller liknande flytetyg.",
          "conditions": null
        }
      },
      "boat": {},
      "practical": {},
      "geography": {},
      "safety": {}
    }
  },
};
