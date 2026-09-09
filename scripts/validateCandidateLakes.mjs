import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import {
  lakeDetailSourceTypes,
  lakeDetailValueStates,
  lakeDetailRuleTypes,
  lakeDetailVerificationStatuses,
} from "../src/data/lakes.js";

const sections = ["access", "methods", "species", "watercraft", "boat", "practical", "geography", "safety", "depthMap"];
const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const text = (v) => typeof v === "string" && v.trim().length > 0;
const id = (v) => typeof v === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const date = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)
  && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const url = (v) => {
  try { return typeof v === "string" && ["https:", "http:"].includes(new URL(v).protocol); }
  catch { return false; }
};
const canonical = (v) => JSON.stringify(object(v)
  ? Object.fromEntries(Object.keys(v).sort().map((key) => [key, canonical(v[key])]))
  : Array.isArray(v) ? [...v].sort() : v);

// Pure validation: no mutation, inference, fetching, review or publication.
export function validateCandidate(candidate) {
  const errors = [];
  const fail = (path, reason) => errors.push(`${path}: ${reason}`);
  const shape = (v, path, required, optional = []) => {
    if (!object(v)) { fail(path, "expected object"); return false; }
    for (const key of required) if (!Object.hasOwn(v, key)) fail(`${path}.${key}`, "required field missing");
    for (const key of Object.keys(v)) if (![...required, ...optional].includes(key)) fail(`${path}.${key}`, "unsupported field");
    return true;
  };
  if (!shape(candidate, "$", ["schemaVersion", "id", "name", "sources", "details"], ["region", "counties", "location"])) return errors;
  if (candidate.schemaVersion !== 1) fail("schemaVersion", "expected 1");
  if (!id(candidate.id)) fail("id", "expected lowercase slug");
  if (!text(candidate.name)) fail("name", "expected non-empty name");
  if ("region" in candidate && !text(candidate.region)) fail("region", "expected non-empty text");
  const strings = (v) => Array.isArray(v) && v.length > 0 && v.every(text) && new Set(v).size === v.length;
  if ("counties" in candidate && !strings(candidate.counties)) fail("counties", "expected unique non-empty county names");

  const sourceIds = new Set();
  const sourceUrls = new Set();
  if (!Array.isArray(candidate.sources)) fail("sources", "expected array");
  else candidate.sources.forEach((source, i) => {
    const path = `sources[${i}]`;
    if (!shape(source, path, ["id", "type", "title", "url", "checkedAt"])) return;
    if (!id(source.id)) fail(`${path}.id`, "expected lowercase slug");
    if (sourceIds.has(source.id)) fail(`${path}.id`, "duplicate source ID");
    sourceIds.add(source.id);
    if (!lakeDetailSourceTypes.includes(source.type)) fail(`${path}.type`, "unsupported source type");
    if (!text(source.title)) fail(`${path}.title`, "expected source title/organization");
    if (!url(source.url)) fail(`${path}.url`, "expected HTTP(S) source URL");
    else {
      const normalized = new URL(source.url).href;
      if (sourceUrls.has(normalized)) fail(`${path}.url`, "duplicate source entry; reuse source ID");
      sourceUrls.add(normalized);
    }
    if (!date(source.checkedAt)) fail(`${path}.checkedAt`, "expected real YYYY-MM-DD date");
  });
  const refs = (v, path, required) => {
    if (!Array.isArray(v)) { fail(path, "expected source ID array"); return; }
    if (required && v.length === 0) fail(path, "claim requires source references");
    if (new Set(v).size !== v.length) fail(path, "duplicate source reference");
    v.forEach((ref, i) => { if (!id(ref) || !sourceIds.has(ref)) fail(`${path}[${i}]`, "unknown source ID"); });
  };
  if ("location" in candidate && shape(candidate.location, "location", ["coordinates", "sources", "verifiedAt"])) {
    const { coordinates, sources, verifiedAt } = candidate.location;
    if (!Array.isArray(coordinates) || coordinates.length !== 2 || !coordinates.every(Number.isFinite)
      || Math.abs(coordinates[0]) > 180 || Math.abs(coordinates[1]) > 90) fail("location.coordinates", "expected [longitude, latitude] within geographic bounds");
    refs(sources, "location.sources", true);
    if (!date(verifiedAt)) fail("location.verifiedAt", "expected real YYYY-MM-DD date");
  }
  const seen = new Set();
  if (!Array.isArray(candidate.details)) fail("details", "expected fact array");
  else candidate.details.forEach((fact, i) => {
    const path = `details[${i}]`;
    if (!shape(fact, path, ["section", "key", "valueType", "value", "status", "ruleType", "sources", "verifiedAt"], ["note", "conditions"])) return;
    if (!sections.includes(fact.section)) fail(`${path}.section`, "unsupported details section");
    if (!text(fact.key) || !/^[a-z][a-zA-Z0-9]*$/.test(fact.key)) fail(`${path}.key`, "expected camelCase fact key");
    if (!lakeDetailVerificationStatuses.includes(fact.status)) fail(`${path}.status`, "unsupported fact status");
    if (fact.ruleType !== null && !lakeDetailRuleTypes.includes(fact.ruleType)) fail(`${path}.ruleType`, "unsupported rule type");
    if ("note" in fact && !text(fact.note)) fail(`${path}.note`, "omit missing notes; expected non-empty text");
    const types = {
      state: (v) => lakeDetailValueStates.includes(v),
      text,
      number: Number.isFinite,
      boolean: (v) => typeof v === "boolean",
      "string-list": strings,
    };
    if (typeof fact.valueType !== "string" || !Object.hasOwn(types, fact.valueType)) fail(`${path}.valueType`, "unsupported value type");
    else if (fact.status !== "unknown" && !types[fact.valueType](fact.value)) fail(`${path}.value`, "invalid value for valueType");
    if (fact.status === "unknown") {
      if (fact.value !== "unknown" || fact.verifiedAt !== null || ![null, "unknown"].includes(fact.ruleType)) fail(path, "unknown requires value unknown, verifiedAt null and no asserted rule type");
    } else {
      if (fact.value === "unknown") fail(`${path}.status`, "unknown value requires unknown status");
      if (fact.status === "verified" ? !date(fact.verifiedAt) : fact.verifiedAt !== null) fail(`${path}.verifiedAt`, "verified requires real YYYY-MM-DD; otherwise null");
      if (fact.ruleType === "unknown") fail(`${path}.ruleType`, "unclassified claim must remain unknown");
    }
    if (["methods", "watercraft"].includes(fact.section) && fact.valueType !== "state") fail(`${path}.valueType`, "permission sections require state values");
    if (fact.valueType === "state" && fact.status !== "unknown" && fact.ruleType === null) fail(`${path}.ruleType`, "state claims require explicit rule/recommendation/advisory distinction");
    refs(fact.sources, `${path}.sources`, fact.status !== "unknown");
    if (fact.conditions !== undefined && fact.conditions !== null
      && shape(fact.conditions, `${path}.conditions`, [], ["dateFrom", "dateTo", "timeFrom", "timeTo", "species", "method", "place"])) {
      for (const [key, value] of Object.entries(fact.conditions)) {
        const valid = key.startsWith("date") ? date(value) || (typeof value === "string" && /^\d{2}-\d{2}$/.test(value) && date(`2000-${value}`))
          : key.startsWith("time") ? typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) : strings(value);
        if (!valid) fail(`${path}.conditions.${key}`, "invalid date/time or unique selection list");
      }
    }
    // Same subject and explicit scope cannot be entered twice, even with differing values.
    // Different scopes are retained for human review, never legally reconciled here.
    const scope = JSON.stringify([fact.section, fact.key]) + canonical(fact.conditions ?? {});
    if (seen.has(scope)) fail(path, "duplicate/conflicting fact for same section, key and conditions");
    seen.add(scope);
  });
  return errors;
}

export function validateCandidateDocuments(documents) {
  const errors = [];
  const ids = new Set();
  for (const { file, content } of documents) {
    let candidate;
    try { candidate = JSON.parse(content); }
    catch { errors.push(`${file}: invalid JSON`); continue; }
    errors.push(...validateCandidate(candidate).map((error) => `${file}: ${error}`));
    if (id(candidate?.id)) {
      if (ids.has(candidate.id)) errors.push(`${file}: id: duplicate candidate identity ${candidate.id}`);
      ids.add(candidate.id);
    }
  }
  return errors;
}

export async function run(directory = fileURLToPath(new URL("../data/candidates/", import.meta.url))) {
  try {
    const names = (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => entry.name).sort();
    const documents = await Promise.all(names.map(async (file) => ({ file, content: await readFile(resolve(directory, file), "utf8") })));
    const errors = validateCandidateDocuments(documents);
    if (errors.length) { console.error(errors.join("\n")); return 1; }
    console.log(`${names.length} candidate(s) structurally valid; not reviewed or published.`);
    return 0;
  } catch (error) { console.error(`Candidate input: ${error.message}`); return 1; }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await run(process.argv[2]);
}
