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
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Trolling är uttryckligen reglerat. Paravan är tillåten med maximalt 5 meters utsläpp från båten. Utterfiske är förbjudet.",
          conditions: null,
        },crayfishFishing:{value:"prohibited",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Kr\xE4ftfiske ing\xE5r inte i Sportfiskekortet utan kr\xE4ver ett separat kr\xE4ftfiskekort.",conditions:null},handGearOnly:{value:"restricted",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Endast handredskapsfiske \xE4r till\xE5tet.",conditions:null},openWaterMaxLuresPerPerson:{value:2,status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"P\xE5 \xF6ppet vatten g\xE4ller h\xF6gst tv\xE5 beten per person.",conditions:null},iceMaxLuresPerPerson:{value:5,status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Vid isfiske g\xE4ller h\xF6gst fem beten per person.",conditions:null},
      },
      species: {
        knownSpecies: {
          value: ["gädda", "abborre", "öring","lax","g\xF6s","harr","lake","\xE5l"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Verifierad regeldata finns för gädda, abborre och öring.",
          conditions: null,
        },
        sizeLimits: [
          {
            species: "gädda",
            value: { minSizeCm: 50, maxSizeCm: 80 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }],
            note: null,
            conditions: null,
          },
          {
            species: "abborre",
            value: { maxSizeCm: 30 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }],
            note: null,
            conditions: null,
          },
          {
            species: "öring",
            value: { minSizeCm: 50 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }],
            note: null,
            conditions: null,
          },
          {
            species: "lax",
            value: { minSizeCm: 60 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }],
            note: null,
            conditions: null,
          },
        ],
        bagLimits: [{ species: "gädda", value: { maxRetainedPerPersonPerDay: 1 }, status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: null, conditions: null }],
        closedSeasons: [
          { species: "öring", value: "prohibited", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Riktat fiske efter öring är förbjudet under fredningstiden.", conditions: { dateFrom: "09-15", dateTo: "12-31", timeFrom: null, timeTo: null } },
          { species: "lax", value: "prohibited", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Riktat fiske efter lax är förbjudet under fredningstiden.", conditions: { dateFrom: "09-15", dateTo: "12-31", timeFrom: null, timeTo: null } },
        ],directedFishingProhibitions:[{species:"g\xF6s+harr+lake+\xE5l",value:"prohibited",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Riktat fiske efter g\xF6s, harr, lake och \xE5l \xE4r f\xF6rbjudet.",conditions:null}],
      },
      watercraft: {
        boat: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }],
          note: "Mindre roddbåtar och motorbåtar med utombordare får användas för fiske.",
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
        fvoNotificationRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }],
          note: "Båt som används för fiske ska anmälas till FVO.",
          conditions: null,
        },
        boatMarkingRequirement: {
          value: "required",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }],
          note: "Båten ska vara märkt med namn och kontaktuppgifter.",
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
      practical: {maxRodsPerPersonFromBoat:{value:2,status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Vid fiske fr\xE5n b\xE5t g\xE4ller h\xF6gst tv\xE5 sp\xF6n per person.",conditions:null}},
      geography: {
        protectedAreas: [
          { name: "Munksjöbron", value: "prohibited", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Fiske från Munksjöbron är inte tillåtet.", conditions: null, geometry: null },
          { name: "Munksjö AB:s inhägnade fabriksområde", value: "prohibited", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Fiske från land är inte tillåtet inom Munksjö AB:s inhägnade fabriksområde.", conditions: null, geometry: null },
          { name: "Skyddsområdet vid Tabergsåns mynning", value: "prohibited", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Fiske är förbjudet i skyddsområdet vid Tabergsåns mynning på grund av harrskydd.", conditions: { dateFrom: "03-15", dateTo: "05-30", timeFrom: null, timeTo: null }, geometry: null },
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

  rocksjon: {
    id: "rocksjon",
    name: "Rocksjön",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.1891229, 57.77376],
    coordinateSource: "https://www.openstreetmap.org/relation/9893021",
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
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Sportfiskekort krävs för fiske.",
          conditions: null,
        },
        permitPrice: {
          value: "free",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
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
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Gäller 1 januari-31 december.",
          conditions: null,
        },
        youthRules: { value: "not-required", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Barn under 16 år behöver inte Sportfiskekort.", conditions: null },
        purchaseChannels: { value: ["digital", "physical-resellers"], status: "verified", ruleType: "advisory", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Sportfiskekortet finns digitalt och på papper.", conditions: null },
      },
      methods: {
        spin: { value: "allowed", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Spinnfiske är tillåtet som handredskapsfiske enligt fiskelagen.", conditions: null },
        bait: { value: "allowed", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Mete är tillåtet som handredskapsfiske enligt fiskelagen.", conditions: null },
        fly: { value: "allowed", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Flugfiske är tillåtet som handredskapsfiske enligt fiskelagen.", conditions: null },
        ice: { value: "allowed", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Isfiske är tillåtet med högst fem beten per person.", conditions: null },
        iceMaxBaitsPerAngler: { value: 5, status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Vid isfiske gäller högst fem beten per person.", conditions: null },
        trolling: { value: "restricted", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Trolling är uttryckligen reglerat. Paravan är tillåten med maximalt 5 meters utsläpp från båten. Utterfiske är förbjudet.", conditions: null },crayfishFishing:{value:"prohibited",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Kr\xE4ftfiske ing\xE5r inte i Sportfiskekortet utan kr\xE4ver ett separat kr\xE4ftfiskekort.",conditions:null},handGearOnly:{value:"restricted",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Endast handredskapsfiske \xE4r till\xE5tet.",conditions:null},openWaterMaxLuresPerPerson:{value:2,status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"P\xE5 \xF6ppet vatten g\xE4ller h\xF6gst tv\xE5 beten per person.",conditions:null},iceMaxLuresPerPerson:{value:5,status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Vid isfiske g\xE4ller h\xF6gst fem beten per person.",conditions:null},
      },
      species: {
        knownSpecies: { value: ["gädda", "abborre", "öring","lax","g\xF6s","harr","lake","\xE5l"],status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Verifierad regeldata finns för gädda, abborre och öring.",conditions:null},
        sizeLimits: [{ species: "gädda", value: { minSizeCm: 50, maxSizeCm: 80 }, status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: null, conditions: null }, { species: "abborre", value: { maxSizeCm: 30 }, status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: null, conditions: null }, { species: "öring", value: { minSizeCm: 50 }, status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: null, conditions: null }, { species: "lax", value: { minSizeCm: 60 }, status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: null, conditions: null }],
        bagLimits: [{ species: "gädda", value: { maxRetainedPerPersonPerDay: 1 }, status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: null, conditions: null }],
        closedSeasons: [{ species: "öring", value: "prohibited", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Riktat fiske efter öring är förbjudet under fredningstiden.", conditions: { dateFrom: "09-15", dateTo: "12-31", timeFrom: null, timeTo: null } }, { species: "lax", value: "prohibited", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Riktat fiske efter lax är förbjudet under fredningstiden.", conditions: { dateFrom: "09-15", dateTo: "12-31", timeFrom: null, timeTo: null } }],directedFishingProhibitions:[{species:"g\xF6s+harr+lake+\xE5l",value:"prohibited",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Riktat fiske efter g\xF6s, harr, lake och \xE5l \xE4r f\xF6rbjudet.",conditions:null}],
      },
      watercraft: {
        boat: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }],
          note: "Vid vanligt fiske i Rocksjön får endast roddbåt användas. Anmälan till FVO och märkning med namn och kontaktuppgifter krävs.",
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
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }],
          note: "Motordriven båt är inte tillåten för vanligt fiske i Rocksjön.",
          conditions: null,
        },
        combustionMotor: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
              type: "municipality",
            },
          ],
          note: "Motordriven båt är inte tillåten för vanligt fiske i Rocksjön.",
          conditions: null,
        },
      },
      practical: {maxRodsPerPersonFromBoat:{value:2,status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",type:"municipality"}],note:"Vid fiske fr\xE5n b\xE5t g\xE4ller h\xF6gst tv\xE5 sp\xF6n per person.",conditions:null}},
      geography: {
        protectedAreas: [
          {
            name: "Naturreservatsregler",
            value: "restricted",
            status: "verified",
            ruleType: "advisory",
            verifiedAt: "2026-09-07",
            sources: [
              {
                url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler",
                type: "municipality",
              },
            ],
            note: "Rocksjön omfattas av naturreservatsregler.",
            conditions: null,
            geometry: null,
          },
          { name: "Badplatsen", value: "prohibited", status: "verified", ruleType: "rule", verifiedAt: "2026-09-07", sources: [{ url: "https://www.jonkoping.se/fritid-kultur--natur/friluftsliv-natur-och-parker/friluftsliv/fiska/fiske-i-munksjon-och-rocksjon-sportfiskekortet-och-regler", type: "municipality" }], note: "Fiske är inte tillåtet vid badplatsen i Rocksjön.", conditions: null, geometry: null },
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
    coordinates: [14.3149637, 57.8679365],
    coordinateSource: "https://www.openstreetmap.org/relation/15776409",
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
          note: "Fiskekort krävs.",
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
          note: "Sportfiske tillåtet sommartid.",
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
          note: "Sportfiske tillåtet vintertid.",
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
          note: "Mete tillåtet sommartid.",
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
          note: "Pimpel tillåtet sommartid och vintertid.",
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
          note: "Dragfiske tillåtet sommartid.",
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
            note: "Abborre över 35 cm ska återutsättas.",
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
            note: "Fisk under minimimått, utanför tillåtet storleksintervall eller över fångstkvot ska omedelbart och varsamt återutsättas.",
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
          note: "Högsta tillåtna fart för motorbåt är 7 knop.",
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
    coordinates: [14.0929832, 57.7570076],
    coordinateSource: "https://www.openstreetmap.org/way/23543708",
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
          note: "Fiskekort krävs.",
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
          note: "Aktuella korttyper inkluderar dagkort vuxen och ungdomskort 10–17 år.",
          conditions: null,
        },
      },
      methods: {
        spin: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80561/ulfstorpssjon-regnbage",
              type: "fvo-club",
            },
          ],
          note: "Kastspö är tillåtet, men på sjöns västra sida är endast flugfiske med flugspö tillåtet.",
          conditions: null,
        },
        fly: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80561/ulfstorpssjon-regnbage",
              type: "fvo-club",
            },
          ],
          note: "Flugspö är tillåtet.",
          conditions: null,
        },
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80561/ulfstorpssjon-regnbage",
              type: "fvo-club",
            },
          ],
          note: "Metspö är tillåtet.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.jsf-fiske.net/sida/80561/ulfstorpssjon-regnbage",
              type: "fvo-club",
            },
          ],
          note: "Pimpelspö och fiske från is är tillåtet.",
          conditions: null,
        },
      },
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
          note: "Kända inplanterade sportfiskar.",
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
          note: "Flytring tillåten.",
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
          note: "Båt är inte tillåten.",
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
          note: "Båtmotorer får ej användas, endast flytring.",
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
          note: "Båtmotorer får ej användas, endast flytring.",
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
          note: "Flytbrygga finns och är tillgänglighetsanpassad.",
          conditions: null,
        },
        piers: [
          {
            name: "Tillgänglighetsanpassad flytbrygga",
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
            note: "Metadatapunkt utan koordinat i denna batch.",
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
    coordinates: [14.3426768, 57.6924286],
    coordinateSource: "https://www.openstreetmap.org/way/23212660",
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
          note: "Fiskekort krävs.",
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
          note: "Aktuella korttyper inkluderar dagkort och årskort.",
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
          note: "Fritt fiske för barn och ungdomar till och med 15 års ålder.",
          conditions: null,
        },
      },
      methods: {
        fly: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm?rules=261",
              type: "commercial-aggregator",
            },
          ],
          note: "Flugspö ingår i fiskekortet.",
          conditions: null,
        },
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm?rules=261",
              type: "commercial-aggregator",
            },
          ],
          note: "Haspelspö och spinningspö ingår i fiskekortet.",
          conditions: null,
        },
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm?rules=261",
              type: "commercial-aggregator",
            },
          ],
          note: "Metspö ingår i fiskekortet.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm?rules=261",
              type: "commercial-aggregator",
            },
          ],
          note: "Pimpelspö ingår i fiskekortet.",
          conditions: null,
        },
        maxRodsPerPermit: {
          value: 2,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm?rules=261",
              type: "commercial-aggregator",
            },
          ],
          note: "Max 2 handredskap per fiskekort.",
          conditions: null,
        },
        iceMaxAngeldonPerPermit: {
          value: 10,
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm?rules=261",
              type: "commercial-aggregator",
            },
          ],
          note: "Max 10 angeldon eller ismetespön per fiskekort.",
          conditions: null,
        },
        publicFishing: {
          value: "prohibited",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm?rules=261",
              type: "commercial-aggregator",
            },
          ],
          note: "Allmänt fiske förbjudet under hela augusti.",
          conditions: {
            dateFrom: "08-01",
            dateTo: "08-31",
            timeFrom: null,
            timeTo: null,
          },
        },
      },
      species: {
        knownSpecies: {
          value: ["gädda","abborre","m\xF6rt","g\xF6s","braxen","lake","ruda","sarv","sutare","sikl\xF6ja"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://viss.lansstyrelsen.se/Waters.aspx?1=1&generatePDF=true&managementCycleName=Cykel_1&timeStamp=&userProfileID=3&waterMSCD=WA55273393",
              type: "authority",
            },{url:"https://www.ifiske.se/fiske-tenhultasjon.htm",type:"commercial-aggregator"},
          ],
          note: "Verifierad förekomst av gädda; uppgiften är inte avsedd som komplett artlista.",
          conditions: null,
        },
        closedSeasons: [
          {
            species: "gos",
            value: "prohibited",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm?rules=261",
                type: "commercial-aggregator",
              },
            ],
            note: "Riktat fiske efter gös förbjudet under hela maj.",
            conditions: {
              dateFrom: "05-01",
              dateTo: "05-31",
              timeFrom: null,
              timeTo: null,
            },
          },
        ],
        sizeLimits: [
          {
            species: "gos",
            value: { minSizeCm: 45, maxSizeCm: 70 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm?rules=261",
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
            value: { maxRetainedPerPermitPerDay: 2 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [
              {
                url: "https://www.ifiske.se/fiskekort-tenhultasjon.htm?rules=261",
                type: "commercial-aggregator",
              },
            ],
            note: null,
            conditions: null,
          },
        ],
      },
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
    coordinates: [13.8451091, 57.8998112],
    coordinateSource: "https://www.openstreetmap.org/relation/8027895",
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
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Barn och ungdomar till och med 15 år fiskar utan fiskekort, men sjöns regler gäller.",
          conditions: null,
        },familyCoverage:{value:"restricted",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiskekort-straken.htm?rules=294",type:"commercial-aggregator"}],note:"Familjekort g\xE4ller h\xF6gst tv\xE5 vuxna och tre egna hemmaboende barn till och med 17 \xE5r p\xE5 samma adress.",conditions:null},
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
              url: "https://www.ifiske.se/fiskekort-straken.htm?rules=294",
              type: "commercial-aggregator",
            },
          ],
          note: "Pimpel ingår i handredskapsfisket.",
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
          note: "Kastspöfiske ingår i handredskapsfisket.",
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
          note: "Flugfiske ingår i handredskapsfisket.",
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
          note: "Trolling ingår i fiskekortet.",
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
          note: "Max 10 angeldon, alternativt 10 ismetespön.",
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
            note: "Abborre över 35 cm ska återutsättas.",
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
            note: "Fredningstid för öring.",
            conditions: {
              dateFrom: "10-01",
              dateTo:"12-31" ,
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
            note: "Abborre över 35 cm ska återutsättas.",
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
          note: "FVO-materialet anger att båtramper finns.",
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
          note: "Fiske i tillflöden är inte tillåtet.",
          conditions: null,
        },
        protectedAreas: [
          {
            name: "Fågelskyddsområden",
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
            note: "Fågelskyddsområden finns i vattenområdet.",
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
    coordinates: [14.67226, 57.60664],
    coordinateSource:
      "https://viss.lansstyrelsen.se/ProtectedAreas.aspx?managementCycleName=Cykel_2%2C5&protectedAreaEUID=SEA7SE638925-143297",
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
          note: "Fiskekort krävs.",
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
          note: "Kortutbud inkluderar dag, vecka, år samt separat angel/isfiskekort.",
          conditions: null,
        },youthRules:{value:"restricted",status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://nassjo.se/uppleva-och-gora/aktivitet/fiske-spexhultasjon.html",type:"municipality"},{url:"https://www.ifiske.se/fiskekort-spexhultasjon.htm",type:"commercial-aggregator"}],note:"K\xE4llorna skiljer sig: N\xE4ssj\xF6 kommun anger fritt fiske till och med 16 \xE5r medan iFiske anger till och med 18 \xE5r. Kontrollera med FVO f\xF6re fiske utan kort.",conditions:null},
      },
      methods: {
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://spexhultasjon.se/",
              type: "fvo-club",
            },
          ],
          note: "Spinnfiske är tillåtet som handredskapsfiske.",
          conditions: null,
        },
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://spexhultasjon.se/",
              type: "fvo-club",
            },
          ],
          note: "Mete är tillåtet som handredskapsfiske.",
          conditions: null,
        },
        fly: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://spexhultasjon.se/",
              type: "fvo-club",
            },
          ],
          note: "Flugfiske är tillåtet som handredskapsfiske.",
          conditions: null,
        },
        ice: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://spexhultasjon.se/",
              type: "fvo-club",
            },
          ],
          note: "Pimpelfiske är tillåtet som handredskapsfiske.",
          conditions: null,
        },
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
          note: "Nät ingår inte i ordinarie fiskekort.",
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
          note: "Fasta redskap ingår inte i ordinarie fiskekort.",
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
          note: "Kräftfiske ingår inte i ordinarie fiskekort.",
          conditions: null,
        },
      },
      species: {
        knownSpecies: {
          value: ["abborre", "gädda", "mört", "siklöja", "sutare","gadda","sik"],
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://spexhultasjon.se/",
              type: "fvo-club",
            },{url:"https://nassjo.se/uppleva-och-gora/aktivitet/fiske-spexhultasjon.html",type:"municipality"},
          ],
          note: "Verifierad förekomst enligt FVO:s artinformation.",
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
                url: "https://spexhultasjon.se/",
                type: "fvo-club",
              },
            ],
            note: null,
            conditions: null,
          },
        ],
        bagLimits: [
          {
            species: "gädda",
            value: { maxRetainedPerPermitPerDay: 3 },
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [
              {
                url: "https://spexhultasjon.se/",
                type: "fvo-club",
              },
            ],
            note: null,
            conditions: null,
          },
        ],
        releaseRequirements: [
          {
            species: "abborre",
            value: "required",
            status: "verified",
            ruleType: "rule",
            verifiedAt: "2026-09-07",
            sources: [
              {
                url: "https://spexhultasjon.se/",
                type: "fvo-club",
              },
            ],
            note: "Abborre över 35 cm ska återutsättas.",
            conditions: null,
          },
        ],
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
          note: "FVO anger att uthyrningsbåtar saknas.",
          conditions: null,
        },
        electricMotor: {
          value: "allowed",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://spexhultasjon.se/",
              type: "fvo-club",
            },
          ],
          note: "Elmotor är tillåten.",
          conditions: null,
        },
        combustionMotor: {
          value: "restricted",
          status: "verified",
          ruleType: "rule",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://spexhultasjon.se/",
              type: "fvo-club",
            },
          ],
          note: "Endast fyrtaktsmotor som drivs med alkylatbensin är tillåten. Tvåtaktsmotor är förbjuden.",
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
    coordinates: [14.6379637, 57.7030572],
    coordinateSource: "https://www.openstreetmap.org/relation/2381619",
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
          note: "Fiskekort krävs.",
          conditions: null,
        },youthRules:{value:"not-required",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-ryssbysjons-fvof-nassjo.htm",type:"commercial-aggregator"}],note:"Barn och ungdomar till och med 16 \xE5r fiskar fritt.",conditions:null},
      },
      methods: {
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiske-ryssbysjons-fvof-nassjo.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Mete med betesfisk anges som en vanlig metod för gös.",
          conditions: null,
        },
        trolling: {
          value: "allowed",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://www.ifiske.se/fiske-ryssbysjons-fvof-nassjo.htm",
              type: "commercial-aggregator",
            },
          ],
          note: "Trolling anges som en vanlig metod för gös.",
          conditions: null,
        },
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
          note: "Fiske är förbjudet varje måndag och tisdag. Veckodagsvillkor lagras som notering eftersom veckodagsfälten inte finns i nuvarande villkorsmodell.",
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
          note: "Under augusti är fiske tillåtet endast 07:00–18:00.",
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
          note: "Kräftfiske är förbjudet.",
          conditions: null,
        },
      },
      species: {knownSpecies:{value:["g\xF6s","braxen","abborre","g\xE4dda","signalkr\xE4fta","m\xF6rt","sutare","lake","sarv"],status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-ryssbysjons-fvof-nassjo.htm",type:"commercial-aggregator"}],note:"FVO beskriver g\xF6s och braxen som vanliga; \xF6vriga arter f\xF6rekommer i varierande omfattning.",conditions:null}},
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
          note: "Båtuthyrning finns.",
          conditions: null,
        },
        electricMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: "Utanför fågelskyddsområdet saknas verifierad motordata i denna batch.",
          conditions: null,
        },
        combustionMotor: {
          value: "unknown",
          status: "unknown",
          ruleType: "unknown",
          verifiedAt: null,
          sources: [],
          note: "Utanför fågelskyddsområdet saknas verifierad motordata i denna batch.",
          conditions: null,
        },
      },
      practical: {},
      geography: {
        protectedAreas: [
          {
            name: "Södra delen – fågelskyddsområde",
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
            note: "PFOS i samlingsprov av abborre uppges till 12,7–22,9 ng/g, över refererad gräns 9,1 ng/g våtvikt. Rekommendation: vuxna högst 4–6 gånger/år, barn högst 2–4 gånger/år. Avser långvarig ackumulering, inte akut förgiftningsrisk.",
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
    coordinates: [14.8488384, 57.5413176],
    coordinateSource: "https://www.openstreetmap.org/relation/9452",
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
          note: "Fiskekort krävs.",
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
          note: "Aktuella korttyper inkluderar dag, vecka och år.",
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
          note: "Fritt fiske till och med 15 år endast i sällskap med vuxen eller person med giltigt fiskekort och på dennes kvot.",
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
          note: "Max 3 redskap/spön per fiskekort.",
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
          note: "Under 1–15 augusti är sportfiske tillåtet endast 06:00–21:00.",
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
          note: "Trolling förbjudet under 1–15 augusti.",
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
          note: "Årskort omfattar vinterfiske med angel, pimpel och ismete under gällande redskapsbegränsningar.",
          conditions: null,
        },spin:{value:"allowed",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-nommen.htm",type:"commercial-aggregator"}],note:"Spinnfiske \xE4r en dokumenterad fiskemetod i sj\xF6n.",conditions:null},bait:{value:"allowed",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-nommen.htm",type:"commercial-aggregator"}],note:"Mete \xE4r en dokumenterad fiskemetod i sj\xF6n.",conditions:null},ice:{value:"allowed",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-nommen.htm",type:"commercial-aggregator"}],note:"Pimpel, angel och ismete \xE4r dokumenterade metoder.",conditions:null},crayfishFishing:{value:"prohibited",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-nommen.htm",type:"commercial-aggregator"}],note:"Kr\xE4ftfiske \xE4r f\xF6rbeh\xE5llet fisker\xE4tts\xE4garna.",conditions:null},
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
        ],knownSpecies:{value:["abborre","g\xE4dda","g\xF6s","m\xF6rt","braxen","sutare","lake","sikl\xF6ja","\xF6ring","ruda","sarv","signalkr\xE4fta"],status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-nommen.htm",type:"commercial-aggregator"}],note:"Arter och relativa f\xF6rekomster redovisas av N\xF6mmens FVO via iFiske.",conditions:null},
      },
      watercraft: {boat:{value:"allowed",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-nommen.htm",type:"commercial-aggregator"}],note:"Fiske fr\xE5n b\xE5t \xE4r uttryckligen till\xE5tet och hyrb\xE5t finns.",conditions:null}},
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
          note: "Båtuthyrning finns.",
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
      practical: {visitorFacilities:{value:"present",status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-nommen.htm",type:"commercial-aggregator"}],note:"Grillplats, vindskydd, kastbrygga, WC/utedass, informationstavla, parkering och soptunnor finns i anslutning till sj\xF6n. Se FVO-kartan f\xF6r l\xE4gen.",conditions:null}},
      geography: {},
      safety: {invasiveSpeciesHygiene:{value:"caution",status:"verified",ruleType:"advisory",verifiedAt:"2026-09-07",sources:[{url:"https://www.ifiske.se/fiske-nommen.htm",type:"commercial-aggregator"}],note:"T\xF6m, tv\xE4tta och torka b\xE5t och fiskeutrustning innan den flyttas mellan vatten f\xF6r att minska risken att sprida st\xF6rre rovm\xE4rla.",conditions:null}},
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
    coordinates: [14.018581, 57.851],
    coordinateSource: "https://www.openstreetmap.org/relation/10523512",
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
        spin: {
          value: "allowed",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/",
              type: "fvo-club",
            },
          ],
          note: "FVO:s fiskeguide beskriver och rekommenderar spinn- och jiggmetoder; detta är vägledning, inte en separat juridisk tillåtelsebestämmelse.",
          conditions: null,
        },
        bait: {
          value: "allowed",
          status: "verified",
          ruleType: "advisory",
          verifiedAt: "2026-09-07",
          sources: [
            {
              url: "https://risbrodammen-fiske.se/",
              type: "fvo-club",
            },
          ],
          note: "FVO:s fiskeguide beskriver och rekommenderar metfiske; detta är vägledning, inte en separat juridisk tillåtelsebestämmelse.",
          conditions: null,
        },
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
      watercraft: {boat:{value:"restricted",status:"verified",ruleType:"rule",verifiedAt:"2026-09-07",sources:[{url:"https://risbrodammen-fiske.se/regler.html",type:"fvo-club"}],note:"FVO:s hyrb\xE5tar kan anv\xE4ndas. Egna b\xE5tar kan inte sj\xF6s\xE4ttas eftersom b\xE5tramp saknas.",conditions:null}},
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
};
