import { lakes } from "../src/data/lakes.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";

const EXPECTED_LAKE_COUNT = 20;
const DETAIL_SECTIONS = [
  "access",
  "methods",
  "species",
  "watercraft",
  "boat",
  "practical",
  "geography",
  "safety",
];
const SOURCE_TYPES = new Set([
  "authority",
  "municipality",
  "fvo-club",
  "open-data",
  "commercial-aggregator",
  "other",
]);
const FACT_STATUSES = new Set(["verified", "unverified", "unknown"]);
const RULE_TYPES = new Set(["rule", "recommendation", "advisory", "unknown"]);
const DATE_PATTERN = /^(\d{2}-\d{2}|\d{4}-\d{2}-\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const errors = [];
const pointIds = new Set();
let factCount = 0;
let verifiedFactCount = 0;

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

function isValidCoordinates(coordinates) {
  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    Number.isFinite(coordinates[0]) &&
    Number.isFinite(coordinates[1]) &&
    coordinates[0] >= -180 &&
    coordinates[0] <= 180 &&
    coordinates[1] >= -90 &&
    coordinates[1] <= 90
  );
}

function validateDetails(value, path) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validateDetails(entry, `${path}[${index}]`));
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  if ("value" in value && "status" in value) {
    factCount += 1;

    if (!FACT_STATUSES.has(value.status)) {
      addError(path, `okänd faktastatus ${value.status}`);
    }

    if (value.ruleType !== null && !RULE_TYPES.has(value.ruleType)) {
      addError(path, `okänd regeltyp ${value.ruleType}`);
    }

    if (value.status === "verified") {
      verifiedFactCount += 1;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(value.verifiedAt ?? "")) {
        addError(path, "verifierad uppgift saknar giltigt verifiedAt");
      }

      if (!Array.isArray(value.sources) || value.sources.length === 0) {
        addError(path, "verifierad uppgift saknar källa");
      }
    }

    for (const [index, source] of (value.sources ?? []).entries()) {
      if (!source?.url || !URL.canParse(source.url)) {
        addError(`${path}.sources[${index}]`, "ogiltig URL");
      }

      if (!SOURCE_TYPES.has(source?.type)) {
        addError(`${path}.sources[${index}]`, `okänd källtyp ${source?.type}`);
      }
    }

    const conditions = value.conditions;
    if (conditions && typeof conditions === "object") {
      for (const key of ["dateFrom", "dateTo"]) {
        if (conditions[key] && !DATE_PATTERN.test(conditions[key])) {
          addError(`${path}.conditions.${key}`, `ogiltigt datum ${conditions[key]}`);
        }
      }

      for (const key of ["timeFrom", "timeTo"]) {
        if (conditions[key] && !TIME_PATTERN.test(conditions[key])) {
          addError(`${path}.conditions.${key}`, `ogiltig tid ${conditions[key]}`);
        }
      }
    }
  }

  Object.entries(value).forEach(([key, entry]) =>
    validateDetails(entry, `${path}.${key}`),
  );
}

if (Object.keys(lakes).length !== EXPECTED_LAKE_COUNT) {
  addError("lakes", `förväntade ${EXPECTED_LAKE_COUNT}, hittade ${Object.keys(lakes).length}`);
}

for (const [lakeId, lake] of Object.entries(lakes)) {
  if (lake.id !== lakeId) {
    addError(lakeId, `objektnyckeln matchar inte id ${lake.id}`);
  }

  if (!lake.name?.trim()) {
    addError(lakeId, "namn saknas");
  }

  if (!isValidCoordinates(lake.coordinates)) {
    addError(`${lakeId}.coordinates`, "ogiltiga koordinater");
  }

  for (const section of DETAIL_SECTIONS) {
    if (!lake.details || typeof lake.details[section] !== "object") {
      addError(`${lakeId}.details.${section}`, "sektion saknas");
    }
  }

  validateDetails(lake.details, `${lakeId}.details`);
}

for (const [lakeId, points] of Object.entries(lakePointsByLakeId)) {
  if (!lakes[lakeId]) {
    addError(`lakePoints.${lakeId}`, "refererar till okänd sjö");
  }

  for (const [index, point] of points.entries()) {
    const path = `lakePoints.${lakeId}[${index}]`;

    if (!point.id || pointIds.has(point.id)) {
      addError(path, `saknat eller duplicerat punkt-id ${point.id ?? ""}`);
    }
    pointIds.add(point.id);

    if (!isValidCoordinates(point.coordinates)) {
      addError(`${path}.coordinates`, "ogiltiga koordinater");
    }

    if (!point.name?.trim() || !point.type?.trim()) {
      addError(path, "namn eller typ saknas");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(point.verifiedAt ?? "")) {
      addError(path, "giltigt verifiedAt saknas");
    }

    if (!point.source || !URL.canParse(point.source)) {
      addError(path, "giltig källa saknas");
    }
  }
}

if (errors.length > 0) {
  console.error(`Lake-data validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(
    `Lake-data validation passed: ${Object.keys(lakes).length} lakes, ${verifiedFactCount}/${factCount} verified facts, ${pointIds.size} map points.`,
  );
}
