import { lstat, readFile, readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakes } from "../src/data/lakes.js";
import { validateLakeDataState } from "./lakeDataValidation.mjs";
import { canonicalJson } from "./publishCandidateLake.mjs";
import { sha256 } from "./productionDatasetPreflight.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const defaultUpdatesDirectory = join(repositoryRoot, "data", "updates");
const SOURCE_TYPES = new Set([
  "authority", "municipality", "fvo-club", "open-data", "commercial-aggregator", "other",
]);
const PATH_SEGMENT = /^(?!__proto__$|prototype$|constructor$)[A-Za-z][A-Za-z0-9]*$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;

function issue(code, path, message) {
  return { code, path, message };
}

function sortedIssues(issues) {
  return [...issues].sort((left, right) =>
    compareText(left.code, right.code) ||
    compareText(left.path, right.path) ||
    compareText(left.message, right.message));
}

function nonempty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function realDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

function exactKeys(value, allowed, path, errors) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(issue("invalid-type", path, "expected object"));
    return false;
  }
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors.push(issue("unsupported-field", `${path}.${key}`, "unsupported field"));
  }
  return true;
}

function requireFields(value, required, path, errors) {
  for (const field of required) {
    if (!Object.hasOwn(value, field)) errors.push(issue("missing-field", `${path}.${field}`, "required"));
  }
}

function isJsonValue(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value !== "object") return false;
  return Object.keys(value).every((key) => isJsonValue(value[key]));
}

export function parseUpdatePath(path) {
  if (typeof path !== "string" || path.length === 0) return null;
  const segments = path.split(".");
  return segments.every((segment) => PATH_SEGMENT.test(segment)) ? segments : null;
}

export function semanticFingerprint(value) {
  return sha256(canonicalJson(value));
}

export function validateLakeUpdateProposal(proposal) {
  const errors = [];
  const rootFields = [
    "schemaVersion", "proposalId", "targetLakeId", "targetLakeFingerprint",
    "reason", "sources", "changes",
  ];
  if (!exactKeys(proposal, rootFields, "$", errors)) return sortedIssues(errors);
  requireFields(proposal, rootFields, "$", errors);

  if (proposal.schemaVersion !== 1) {
    errors.push(issue("invalid-schema-version", "$.schemaVersion", "expected 1"));
  }
  if (typeof proposal.proposalId !== "string" || !SLUG.test(proposal.proposalId)) {
    errors.push(issue("invalid-proposal-id", "$.proposalId", "expected lowercase slug"));
  }
  if (typeof proposal.targetLakeId !== "string" || !SLUG.test(proposal.targetLakeId)) {
    errors.push(issue("invalid-target-id", "$.targetLakeId", "expected lowercase lake slug"));
  }
  if (typeof proposal.targetLakeFingerprint !== "string" ||
    !/^[a-f0-9]{64}$/.test(proposal.targetLakeFingerprint)) {
    errors.push(issue(
      "invalid-target-fingerprint",
      "$.targetLakeFingerprint",
      "expected SHA-256 hex",
    ));
  }
  if (!nonempty(proposal.reason)) errors.push(issue("invalid-reason", "$.reason", "required text"));

  const sourceIds = new Set();
  if (!Array.isArray(proposal.sources) || proposal.sources.length === 0) {
    errors.push(issue("invalid-sources", "$.sources", "expected non-empty array"));
  } else {
    proposal.sources.forEach((source, index) => {
      const path = `$.sources[${index}]`;
      const fields = ["id", "type", "title", "url", "checkedAt"];
      if (!exactKeys(source, fields, path, errors)) return;
      requireFields(source, fields, path, errors);
      if (typeof source.id !== "string" || !SLUG.test(source.id)) {
        errors.push(issue("invalid-source-id", `${path}.id`, "expected lowercase slug"));
      } else if (sourceIds.has(source.id)) {
        errors.push(issue("duplicate-source-id", `${path}.id`, `duplicate source ${source.id}`));
      } else {
        sourceIds.add(source.id);
      }
      if (!SOURCE_TYPES.has(source.type)) {
        errors.push(issue("invalid-source-type", `${path}.type`, "unsupported source type"));
      }
      if (!nonempty(source.title)) errors.push(issue("invalid-source-title", `${path}.title`, "required text"));
      if (typeof source.url !== "string" || !URL.canParse(source.url)) {
        errors.push(issue("invalid-source-url", `${path}.url`, "expected valid URL"));
      }
      if (!realDate(source.checkedAt)) {
        errors.push(issue("invalid-source-date", `${path}.checkedAt`, "expected real YYYY-MM-DD date"));
      }
    });
  }

  const pathEntries = [];
  if (!Array.isArray(proposal.changes) || proposal.changes.length === 0) {
    errors.push(issue("invalid-changes", "$.changes", "expected non-empty array"));
  } else {
    proposal.changes.forEach((change, index) => {
      const path = `$.changes[${index}]`;
      const fields = ["operation", "path", "expected", "proposed", "reason", "sources", "verifiedAt"];
      if (!exactKeys(change, fields, path, errors)) return;
      requireFields(change, fields, path, errors);
      if (change.operation !== "set") {
        errors.push(issue("unsupported-operation", `${path}.operation`, "only set is supported"));
      }
      const segments = parseUpdatePath(change.path);
      if (!segments) {
        errors.push(issue("malformed-update-path", `${path}.path`, "expected safe dotted object path"));
      } else {
        pathEntries.push({ index, path: change.path, segments });
      }
      if (exactKeys(change.expected, ["mode", "value"], `${path}.expected`, errors)) {
        if (!Object.hasOwn(change.expected, "mode")) {
          errors.push(issue("missing-field", `${path}.expected.mode`, "required"));
        } else if (change.expected.mode === "absent") {
          if (Object.hasOwn(change.expected, "value")) {
            errors.push(issue("unexpected-expected-value", `${path}.expected.value`, "absent expectation has no value"));
          }
        } else if (change.expected.mode === "exact") {
          if (!Object.hasOwn(change.expected, "value")) {
            errors.push(issue("missing-field", `${path}.expected.value`, "required for exact expectation"));
          } else if (!isJsonValue(change.expected.value)) {
            errors.push(issue("invalid-json-value", `${path}.expected.value`, "expected JSON value"));
          }
        } else {
          errors.push(issue("invalid-expected-mode", `${path}.expected.mode`, "expected absent or exact"));
        }
      }
      if (!Object.hasOwn(change, "proposed") || !isJsonValue(change.proposed)) {
        errors.push(issue("invalid-json-value", `${path}.proposed`, "expected explicit JSON value"));
      }
      if (!nonempty(change.reason)) errors.push(issue("invalid-reason", `${path}.reason`, "required text"));
      if (!Array.isArray(change.sources) || change.sources.length === 0 ||
        change.sources.some((id) => typeof id !== "string")) {
        errors.push(issue("invalid-source-references", `${path}.sources`, "expected non-empty source ID array"));
      } else {
        for (const [sourceIndex, id] of change.sources.entries()) {
          if (!sourceIds.has(id)) {
            errors.push(issue(
              "unknown-source-reference",
              `${path}.sources[${sourceIndex}]`,
              `unknown source ${id}`,
            ));
          }
        }
      }
      if (!realDate(change.verifiedAt)) {
        errors.push(issue("invalid-verification-date", `${path}.verifiedAt`, "expected real YYYY-MM-DD date"));
      }
    });
  }

  for (let left = 0; left < pathEntries.length; left += 1) {
    for (let right = left + 1; right < pathEntries.length; right += 1) {
      const first = pathEntries[left];
      const second = pathEntries[right];
      const shared = Math.min(first.segments.length, second.segments.length);
      const overlap = first.segments.slice(0, shared).every((segment, index) =>
        segment === second.segments[index]);
      if (overlap) {
        errors.push(issue(
          "conflicting-update-path",
          `$.changes[${second.index}].path`,
          `${second.path} overlaps ${first.path}`,
        ));
      }
    }
  }
  return sortedIssues(errors);
}

function locateParent(root, segments) {
  let parent = root;
  for (const segment of segments.slice(0, -1)) {
    if (!parent || typeof parent !== "object" || Array.isArray(parent) ||
      !Object.hasOwn(parent, segment)) return null;
    parent = parent[segment];
  }
  return parent && typeof parent === "object" && !Array.isArray(parent) ? parent : null;
}

function semanticDiffPaths(before, after, path = "") {
  if (canonicalJson(before) === canonicalJson(after)) return [];
  const beforeObject = before !== null && typeof before === "object" && !Array.isArray(before);
  const afterObject = after !== null && typeof after === "object" && !Array.isArray(after);
  if (!beforeObject || !afterObject) return [path];
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort(compareText);
  const differences = [];
  for (const key of keys) {
    const childPath = path ? `${path}.${key}` : key;
    if (!Object.hasOwn(before, key) || !Object.hasOwn(after, key)) differences.push(childPath);
    else differences.push(...semanticDiffPaths(before[key], after[key], childPath));
  }
  return differences;
}

function blockedResult(proposal, productionLakes, productionDepthMapResearch, blockers) {
  return {
    eligible: false,
    proposalId: proposal?.proposalId ?? null,
    targetLakeId: proposal?.targetLakeId ?? null,
    targetLakeFingerprint: {
      expected: proposal?.targetLakeFingerprint ?? null,
      actual: Object.hasOwn(productionLakes, proposal?.targetLakeId)
        ? semanticFingerprint(productionLakes[proposal.targetLakeId])
        : null,
    },
    changes: [],
    blockers: sortedIssues(blockers),
    validationErrors: [],
    proposedDataset: {
      lakes: structuredClone(productionLakes),
      lakeDepthMapResearch: structuredClone(productionDepthMapResearch),
    },
    summary: {
      changedTargetPathCount: 0,
      otherTargetFieldsChanged: 0,
      otherLakesChanged: 0,
      productionModified: false,
    },
  };
}

export function evaluateLakeUpdateProposal({
  proposal,
  productionLakes,
  productionDepthMapResearch,
  lakePointsByLakeId,
}) {
  const shapeErrors = validateLakeUpdateProposal(proposal);
  if (shapeErrors.length > 0) {
    return blockedResult(proposal, productionLakes, productionDepthMapResearch, shapeErrors);
  }
  if (!Object.hasOwn(productionLakes, proposal.targetLakeId)) {
    return blockedResult(proposal, productionLakes, productionDepthMapResearch, [issue(
      "unknown-target-lake",
      "$.targetLakeId",
      `production lake ${proposal.targetLakeId} does not exist`,
    )]);
  }

  const originalTarget = productionLakes[proposal.targetLakeId];
  const actualFingerprint = semanticFingerprint(originalTarget);
  if (actualFingerprint !== proposal.targetLakeFingerprint) {
    return blockedResult(proposal, productionLakes, productionDepthMapResearch, [issue(
      "stale-target-fingerprint",
      "$.targetLakeFingerprint",
      "current production lake no longer matches the proposal base",
    )]);
  }

  const proposedTarget = structuredClone(originalTarget);
  const observations = [];
  const expectationBlockers = [];
  for (const change of proposal.changes) {
    const segments = parseUpdatePath(change.path);
    const parent = locateParent(proposedTarget, segments);
    if (!parent) {
      expectationBlockers.push(issue(
        "missing-update-parent",
        change.path,
        "every parent object must already exist",
      ));
      continue;
    }
    const key = segments.at(-1);
    const present = Object.hasOwn(parent, key);
    const current = present ? parent[key] : undefined;
    if (change.expected.mode === "absent" && present) {
      expectationBlockers.push(issue(
        "expected-absent-mismatch",
        change.path,
        "expected path to be absent but it exists",
      ));
    } else if (change.expected.mode === "exact" &&
      (!present || canonicalJson(current) !== canonicalJson(change.expected.value))) {
      expectationBlockers.push(issue(
        "expected-value-mismatch",
        change.path,
        "current value does not exactly match expected value",
      ));
    }
    observations.push({ change, parent, key, present, current });
  }
  if (expectationBlockers.length > 0) {
    return blockedResult(proposal, productionLakes, productionDepthMapResearch, expectationBlockers);
  }

  for (const observation of observations) {
    observation.parent[observation.key] = structuredClone(observation.change.proposed);
  }
  const proposedLakes = structuredClone(productionLakes);
  proposedLakes[proposal.targetLakeId] = proposedTarget;
  const proposedDepth = structuredClone(productionDepthMapResearch);
  const validation = validateLakeDataState({
    lakes: proposedLakes,
    lakeDepthMapResearch: proposedDepth,
    lakePointsByLakeId,
    expectedLakeCount: Object.keys(productionLakes).length,
  });
  const changedPaths = semanticDiffPaths(originalTarget, proposedTarget);
  const reviewedPaths = proposal.changes.map(({ path }) => path);
  const unrelatedTargetPaths = changedPaths.filter((path) => !reviewedPaths.some((reviewed) =>
    path === reviewed || path.startsWith(`${reviewed}.`)));
  const otherLakesChanged = Object.keys(productionLakes).filter((id) =>
    id !== proposal.targetLakeId &&
    canonicalJson(productionLakes[id]) !== canonicalJson(proposedLakes[id]));
  const integrityBlockers = [];
  if (unrelatedTargetPaths.length > 0) {
    integrityBlockers.push(issue(
      "unrelated-target-change",
      unrelatedTargetPaths[0],
      "target field changed outside reviewed paths",
    ));
  }
  if (otherLakesChanged.length > 0) {
    integrityBlockers.push(issue(
      "unrelated-lake-change",
      otherLakesChanged[0],
      "another production lake changed",
    ));
  }

  return {
    eligible: integrityBlockers.length === 0 && validation.errors.length === 0,
    proposalId: proposal.proposalId,
    targetLakeId: proposal.targetLakeId,
    targetLakeFingerprint: {
      expected: proposal.targetLakeFingerprint,
      actual: actualFingerprint,
    },
    changes: observations.map(({ change, present, current }) => ({
      path: change.path,
      before: present ? { state: "exact", value: structuredClone(current) } : { state: "absent" },
      after: structuredClone(change.proposed),
    })),
    blockers: sortedIssues(integrityBlockers),
    validationErrors: [...validation.errors],
    proposedDataset: {
      lakes: proposedLakes,
      lakeDepthMapResearch: proposedDepth,
    },
    summary: {
      changedTargetPathCount: changedPaths.length,
      otherTargetFieldsChanged: unrelatedTargetPaths.length,
      otherLakesChanged: otherLakesChanged.length,
      productionModified: false,
    },
  };
}

export async function loadUpdateProposalDocuments(directory = defaultUpdatesDirectory) {
  const stat = await lstat(directory);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`Unsafe update path (expected regular directory): ${directory}`);
  }
  const entries = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.name.endsWith(".json"))
    .sort((left, right) => compareText(left.name, right.name));
  return Promise.all(entries.map(async (entry) => {
    if (!entry.isFile()) return { file: entry.name, readError: "update JSON entry is not a regular file" };
    return { file: entry.name, content: await readFile(join(directory, entry.name), "utf8") };
  }));
}

export async function evaluateRepositoryLakeUpdates(root = repositoryRoot) {
  const documents = await loadUpdateProposalDocuments(join(root, "data", "updates"));
  const results = documents.map((document) => {
    if (document.readError) {
      return blockedResult(null, lakes, lakeDepthMapResearch, [issue(
        "unreadable-proposal", "$", document.readError,
      )]);
    }
    let proposal;
    try {
      proposal = JSON.parse(document.content);
    } catch {
      return blockedResult(null, lakes, lakeDepthMapResearch, [issue(
        "invalid-json", "$", "update proposal is not valid JSON",
      )]);
    }
    const result = evaluateLakeUpdateProposal({
      proposal,
      productionLakes: lakes,
      productionDepthMapResearch: lakeDepthMapResearch,
      lakePointsByLakeId,
    });
    if (proposal.proposalId && basename(document.file, ".json") !== proposal.proposalId) {
      result.eligible = false;
      result.blockers = sortedIssues([...result.blockers, issue(
        "proposal-filename-mismatch",
        "$.proposalId",
        `proposal ID ${proposal.proposalId} does not match filename ${document.file}`,
      )]);
    }
    return { file: document.file, ...result };
  });
  return {
    results,
    summary: {
      proposalCount: results.length,
      eligibleProposalCount: results.filter(({ eligible }) => eligible).length,
      blockedProposalCount: results.filter(({ eligible }) => !eligible).length,
      productionModified: false,
    },
  };
}

export function formatLakeUpdateDryRun(suite) {
  const lines = [
    "Pike existing lake update dry run",
    `Proposals: ${suite.summary.proposalCount}`,
    `Eligible proposals: ${suite.summary.eligibleProposalCount}`,
    `Blocked proposals: ${suite.summary.blockedProposalCount}`,
    "Production modified: NO",
  ];
  for (const result of suite.results) {
    lines.push("", `${result.proposalId ?? "unknown proposal"} (${result.file})`);
    lines.push(`Target: ${result.targetLakeId ?? "unknown"}`);
    for (const change of result.changes) {
      const before = change.before.state === "absent"
        ? "ABSENT"
        : canonicalJson(change.before.value);
      lines.push(`- ${change.path}: ${before} -> ${canonicalJson(change.after)}`);
    }
    for (const blocker of result.blockers) {
      lines.push(`- BLOCKED [${blocker.code}] ${blocker.path}: ${blocker.message}`);
    }
    for (const error of result.validationErrors) lines.push(`- INVALID ${error}`);
  }
  return `${lines.join("\n")}\n`;
}

export async function run(args = process.argv.slice(2), output = console.log) {
  if (args.length !== 0) {
    throw new Error("Usage: node scripts/evaluateLakeUpdates.mjs (dry run only; no options)");
  }
  const result = await evaluateRepositoryLakeUpdates();
  output(formatLakeUpdateDryRun(result).trimEnd());
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await run();
    if (result.summary.blockedProposalCount > 0) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
