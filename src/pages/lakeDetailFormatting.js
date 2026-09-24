const STATE_LABELS = {
  required: "Krävs",
  "not-required": "Krävs inte",
  allowed: "Tillåtet",
  prohibited: "Förbjudet",
  restricted: "Särskilda regler",
  present: "Finns",
  absent: "Saknas",
  free: "Gratis",
  caution: "Var försiktig",
  "calendar-year": "Kalenderår",
  unknown: "Ingen verifierad uppgift",
};

const TOKEN_LABELS = {
  day: "Dagskort",
  week: "Veckokort",
  month: "Månadskort",
  year: "Årskort",
  family: "Familjekort",
  "angel-ice": "Angel/isfiskekort",
  "adult-day": "Dagskort vuxen",
  "youth-day-10-17": "Ungdomskort 10-17 år",
  digital: "Digitalt",
  "physical-resellers": "Återförsäljare",
  gadda: "Gädda",
  gos: "Gös",
  abborre: "Abborre",
  al: "Ål",
  oring: "Öring",
  "insjööoring": "Insjööring",
  sik: "Sik",
  lake: "Lake",
  sutare: "Sutare",
  braxen: "Braxen",
  mort: "Mört",
  regnbage: "Regnbåge",
  all: "Alla arter",
  "bäckröding": "Bäckröding",
  gers: "Gärs",
  gädda: "Gädda",
  gärs: "Gärs",
  gös: "Gös",
  harr: "Harr",
  lax: "Lax",
  laxartad: "Laxartad fisk",
  mört: "Mört",
  nors: "Nors",
  ruda: "Ruda",
  röding: "Röding",
  sarv: "Sarv",
  signalkräfta: "Signalkräfta",
  siklöja: "Siklöja",
  ål: "Ål",
  öring: "Öring",
};

const PERMIT_TYPE_LABELS = {
  "ordinary-open-water": "Ordinarie",
  "ice-fishing": "isfiskekort",
};

const KNOWN_DETAIL_KEY_LABELS = Object.freeze({
  access: Object.freeze({
    membershipRequirement: "Medlemskap",
  }),
  methods: Object.freeze({
    chumming: "Mäskning",
    maxRodsPerPerson: "Spön per person",
  }),
  safety: Object.freeze({
    winterFishingRisk: "Risk vid vinterfiske",
  }),
  watercraft: Object.freeze({
    floatingCraft: "Flytande farkost",
  }),
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getKnownLakeDetailLabel(section, key) {
  return KNOWN_DETAIL_KEY_LABELS[section]?.[key] ?? null;
}

export function formatLakeDetailToken(value) {
  const token = String(value);
  if (/[+,/]/.test(token)) {
    return token
      .split(/[+,/]/)
      .map((part) => formatLakeDetailToken(part))
      .join(" + ");
  }

  return TOKEN_LABELS[token] ?? token;
}

export function formatPermitMethodSupportValue(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const labels = [];
  for (const entry of value) {
    if (
      !isPlainObject(entry) ||
      !Array.isArray(entry.methods) ||
      !entry.methods.every((method) => typeof method === "string")
    ) {
      return null;
    }

    const label = PERMIT_TYPE_LABELS[entry.permitType];
    if (!label) {
      return null;
    }

    if (!labels.includes(label)) {
      labels.push(label);
    }
  }

  return labels.join(" + ");
}

export function formatAccessDetailValue(key, value) {
  return key === "permitMethodSupport"
    ? formatPermitMethodSupportValue(value)
    : formatLakeDetailValue(value);
}

export function formatLakeDetailValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return STATE_LABELS[value] ?? value;
  }

  if (typeof value === "number") {
    return `${value}`;
  }

  if (Array.isArray(value)) {
    if (value.some((item) => item !== null && typeof item === "object")) {
      return null;
    }

    return value.map((item) => formatLakeDetailToken(String(item))).join(", ");
  }

  if (isPlainObject(value)) {
    const min = value.minSizeCm;
    const max = value.maxSizeCm;

    if (typeof min === "number" && typeof max === "number") {
      return `${min}–${max} cm`;
    }

    if (typeof min === "number") {
      return `min ${min} cm`;
    }

    if (typeof max === "number") {
      return `max ${max} cm`;
    }

    if (typeof value.maxRetainedPerPersonPerDay === "number") {
      return `max ${value.maxRetainedPerPersonPerDay}/dygn`;
    }

    if (typeof value.maxRetainedPerPermitPerDay === "number") {
      return `max ${value.maxRetainedPerPermitPerDay}/dygn`;
    }

    if (typeof value.maxRetainedOver50cmCombinedPerPersonPerDay === "number") {
      return `max ${value.maxRetainedOver50cmCombinedPerPersonPerDay}/dygn`;
    }

    if (typeof value.maxPerFishingCardPerDay === "number") {
      return `max ${value.maxPerFishingCardPerDay}/dygn`;
    }

    if (typeof value.maxPerPersonPerDay === "number") {
      const charLimit = value.maxRodingPerPersonPerDay;
      return typeof charLimit === "number"
        ? `max ${value.maxPerPersonPerDay}/dygn · högst ${charLimit} rödingar`
        : `max ${value.maxPerPersonPerDay}/dygn`;
    }
  }

  return null;
}
