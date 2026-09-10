const DETAIL_SECTIONS = [
  "access", "methods", "species", "watercraft", "boat", "practical", "geography", "safety",
];
const SOURCE_TYPES = new Set([
  "authority", "municipality", "fvo-club", "open-data", "commercial-aggregator", "other",
]);
const FACT_STATUSES = new Set(["verified", "unverified", "unknown"]);
const RULE_TYPES = new Set(["rule", "recommendation", "advisory", "unknown"]);
const DATE_PATTERN = /^(\d{2}-\d{2}|\d{4}-\d{2}-\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidCoordinates(coordinates) {
  return (
    Array.isArray(coordinates) && coordinates.length === 2 &&
    Number.isFinite(coordinates[0]) && Number.isFinite(coordinates[1]) &&
    coordinates[0] >= -180 && coordinates[0] <= 180 &&
    coordinates[1] >= -90 && coordinates[1] <= 90
  );
}

export function validateLakeDataState({
  lakes,
  lakeDepthMapResearch,
  lakePointsByLakeId,
  expectedLakeCount,
}) {
  const errors = [];
  const pointIds = new Set();
  let factCount = 0;
  let verifiedFactCount = 0;
  const addError = (path, message) => errors.push(`${path}: ${message}`);

  function validateDetails(value, path) {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => validateDetails(entry, `${path}[${index}]`));
      return;
    }
    if (!value || typeof value !== "object") return;

    if ("value" in value && "status" in value) {
      factCount += 1;
      if (!FACT_STATUSES.has(value.status)) addError(path, `okänd faktastatus ${value.status}`);
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
      validateDetails(entry, `${path}.${key}`));
  }

  if (Object.keys(lakes).length !== expectedLakeCount) {
    addError("lakes", `förväntade ${expectedLakeCount}, hittade ${Object.keys(lakes).length}`);
  }

  for (const [lakeId, lake] of Object.entries(lakes)) {
    if (lake.id !== lakeId) addError(lakeId, `objektnyckeln matchar inte id ${lake.id}`);
    if (!lake.name?.trim()) addError(lakeId, "namn saknas");
    if (!isValidCoordinates(lake.coordinates)) {
      addError(`${lakeId}.coordinates`, "ogiltiga koordinater");
    }
    if (!lake.coordinateSource || !URL.canParse(lake.coordinateSource)) {
      addError(`${lakeId}.coordinateSource`, "giltig koordinatkälla saknas");
    }
    for (const section of DETAIL_SECTIONS) {
      if (!lake.details || typeof lake.details[section] !== "object") {
        addError(`${lakeId}.details.${section}`, "sektion saknas");
      }
    }
    validateDetails(lake.details, `${lakeId}.details`);

    const depthMapResearch = lakeDepthMapResearch[lakeId];
    if (!depthMapResearch) {
      addError(`${lakeId}.depthMapResearch`, "djupkartestatus har inte kontrollerats");
    } else {
      if (!["available", "not-found"].includes(depthMapResearch.status)) {
        addError(`${lakeId}.depthMapResearch.status`, `okänd status ${depthMapResearch.status}`);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(depthMapResearch.checkedAt ?? "")) {
        addError(`${lakeId}.depthMapResearch.checkedAt`, "giltigt kontrolldatum saknas");
      }
      if (depthMapResearch.status === "available") {
        if (!depthMapResearch.smhiLakeId || !URL.canParse(depthMapResearch.sourceUrl ?? "")) {
          addError(`${lakeId}.depthMapResearch`, "SMHI-id eller käll-URL saknas");
        }
        if (!Array.isArray(depthMapResearch.maps) || depthMapResearch.maps.length === 0) {
          addError(`${lakeId}.depthMapResearch.maps`, "hittad djupkarta saknar kartpost");
        }
      }
    }
  }

  for (const lakeId of Object.keys(lakeDepthMapResearch)) {
    if (!lakes[lakeId]) addError(`lakeDepthMapResearch.${lakeId}`, "refererar till okänd sjö");
  }

  for (const [lakeId, points] of Object.entries(lakePointsByLakeId)) {
    if (!lakes[lakeId]) addError(`lakePoints.${lakeId}`, "refererar till okänd sjö");
    for (const [index, point] of points.entries()) {
      const path = `lakePoints.${lakeId}[${index}]`;
      if (!point.id || pointIds.has(point.id)) {
        addError(path, `saknat eller duplicerat punkt-id ${point.id ?? ""}`);
      }
      pointIds.add(point.id);
      if (!isValidCoordinates(point.coordinates)) {
        addError(`${path}.coordinates`, "ogiltiga koordinater");
      }
      if (!point.name?.trim() || !point.type?.trim()) addError(path, "namn eller typ saknas");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(point.verifiedAt ?? "")) {
        addError(path, "giltigt verifiedAt saknas");
      }
      if (!point.source || !URL.canParse(point.source)) addError(path, "giltig källa saknas");
    }
  }

  return {
    errors,
    stats: {
      lakeCount: Object.keys(lakes).length,
      factCount,
      verifiedFactCount,
      pointCount: pointIds.size,
      depthMapResearchCount: Object.keys(lakeDepthMapResearch).length,
    },
  };
}

export function formatLakeDataValidation(result) {
  if (result.errors.length > 0) {
    return [
      `Lake-data validation failed with ${result.errors.length} error(s):`,
      ...result.errors.map((error) => `- ${error}`),
    ].join("\n");
  }
  const stats = result.stats;
  return `Lake-data validation passed: ${stats.lakeCount} lakes, ${stats.verifiedFactCount}/${stats.factCount} verified facts, ${stats.pointCount} map points, ${stats.depthMapResearchCount} depth-map checks.`;
}
