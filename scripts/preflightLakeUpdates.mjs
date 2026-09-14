import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakes } from "../src/data/lakes.js";
import { loadPublishedDocuments } from "./buildLakeDataset.mjs";
import { evaluatePublishedLakeUpdates } from "./evaluatePublishedLakeUpdates.mjs";
import { canonicalJson } from "./publishCandidateLake.mjs";
import {
  fingerprintPublishedDocuments,
  parseSerializedProductionFiles,
  productionDatasetFiles,
  productionProposalFingerprint,
  sha256,
  validateSerializedProductionFiles,
} from "./productionDatasetPreflight.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;

function blocker(code, path, message) {
  return { code, path, message };
}

function objectEnd(source, start) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
    } else if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
    } else if (["\"", "'", "`"].includes(char)) quote = char;
    else if (char === "{") depth += 1;
    else if (char === "}" && --depth === 0) return index + 1;
  }
  return -1;
}

export function replaceLakeRecordInModule(source, lakeId, proposedLake) {
  const exportMarker = "export const lakes = {";
  const exportIndex = source.indexOf(exportMarker);
  if (exportIndex < 0) throw new Error("lakes: unsupported production module structure");
  const markers = [`\n  ${JSON.stringify(lakeId)}: `];
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(lakeId)) markers.push(`\n  ${lakeId}: `);
  const matches = markers.flatMap((marker) => {
    const indices = [];
    let index = source.indexOf(marker, exportIndex + exportMarker.length);
    while (index >= 0) {
      indices.push({ marker, index });
      index = source.indexOf(marker, index + marker.length);
    }
    return indices;
  });
  if (matches.length !== 1) {
    throw new Error(`lakes.${lakeId}: expected exactly one top-level serialized record`);
  }
  const { marker, index } = matches[0];
  const valueStart = index + marker.length;
  if (source[valueStart] !== "{") throw new Error(`lakes.${lakeId}: expected object record`);
  const valueEnd = objectEnd(source, valueStart);
  if (valueEnd < 0) throw new Error(`lakes.${lakeId}: unterminated object record`);
  const serialized = JSON.stringify(proposedLake, null, 2).replace(/\n/g, "\n  ");
  return `${source.slice(0, valueStart)}${serialized}${source.slice(valueEnd)}`;
}

export async function createLakeUpdatePreflight({
  productionLakes,
  productionDepthMapResearch,
  lakePointsByLakeId,
  publishedDocuments,
  currentFiles,
}) {
  const lifecycle = evaluatePublishedLakeUpdates({
    productionLakes,
    productionDepthMapResearch,
    lakePointsByLakeId,
    publishedDocuments,
  });
  const blockers = lifecycle.blocked.flatMap((entry) => entry.reasons.map((entryReason) => blocker(
    entryReason.code,
    `${entry.file}:${entryReason.path}`,
    entryReason.message,
  )));

  let serializedLakes = currentFiles[productionDatasetFiles.lakes];
  try {
    for (const entry of lifecycle.pending) {
      serializedLakes = replaceLakeRecordInModule(
        serializedLakes,
        entry.targetLakeId,
        lifecycle.proposedDataset.lakes[entry.targetLakeId],
      );
    }
  } catch (error) {
    blockers.push(blocker("unsafe-production-serialization", productionDatasetFiles.lakes, error.message));
  }
  const serializedFiles = {
    [productionDatasetFiles.lakes]: serializedLakes,
    [productionDatasetFiles.lakeDepthMapResearch]:
      currentFiles[productionDatasetFiles.lakeDepthMapResearch],
  };
  const productionFingerprints = Object.fromEntries(Object.entries(currentFiles)
    .map(([path, content]) => [path, sha256(content)]));
  const proposedOutputFingerprints = Object.fromEntries(Object.entries(serializedFiles)
    .map(([path, content]) => [path, sha256(content)]));
  const validation = await validateSerializedProductionFiles({
    serializedFiles,
    lakePointsByLakeId,
    expectedLakeCount: Object.keys(productionLakes).length,
  });
  const validationErrors = [...validation.errors];
  try {
    const parsed = await parseSerializedProductionFiles(serializedFiles);
    if (canonicalJson(parsed.lakes) !== canonicalJson(lifecycle.proposedDataset.lakes)) {
      blockers.push(blocker(
        "serialized-lake-content-mismatch", productionDatasetFiles.lakes,
        "serialized lakes do not exactly match the reviewed in-memory proposal",
      ));
    }
    if (canonicalJson(parsed.lakeDepthMapResearch) !==
      canonicalJson(productionDepthMapResearch)) {
      blockers.push(blocker(
        "unexpected-depth-research-change", productionDatasetFiles.lakeDepthMapResearch,
        "update workflow must preserve depth research exactly",
      ));
    }
  } catch (error) {
    blockers.push(blocker(
      "serialized-production-read-failed", "production", error.message,
    ));
  }
  const filesToChange = Object.keys(serializedFiles)
    .filter((path) => productionFingerprints[path] !== proposedOutputFingerprints[path])
    .sort(compareText);
  const pendingIds = lifecycle.pending.map(({ id }) => id).sort(compareText);
  const publishedInputFingerprint = fingerprintPublishedDocuments(publishedDocuments);
  const proposalFingerprint = productionProposalFingerprint({
    productionFingerprints,
    proposedOutputFingerprints,
    additionIds: [],
    fingerprintIds: pendingIds,
    publishedInputFingerprint,
  });
  const token = proposalFingerprint.slice(0, 16);

  return {
    eligible: blockers.length === 0 && validationErrors.length === 0,
    productionLakeCount: Object.keys(productionLakes).length,
    productionFingerprints,
    proposedOutputFingerprints,
    publishedInputFingerprint,
    proposalFingerprint,
    filesToChange,
    pendingUpdates: lifecycle.pending.map(({ id, targetLakeId, changes }) => ({
      id,
      targetLakeId,
      changes: structuredClone(changes),
    })),
    alreadyApplied: lifecycle.alreadyApplied.map(({ id }) => id),
    blockers,
    validationErrors,
    validationStats: validation.stats,
    serializedFiles,
    proposedDataset: lifecycle.proposedDataset,
    // Compatibility fields consumed by the shared compensated-transaction engine.
    additions: [],
    fingerprintIds: pendingIds,
    baselineLakeCount: Object.keys(productionLakes).length,
    applyContract: {
      strategy: "same-directory-stage-backup-rename-rollback",
      multiFileAtomic: false,
      replacementOrder: [...filesToChange],
      stagingFiles: filesToChange.map((path) => `${path}.pike-${token}.next`),
      backupFiles: filesToChange.map((path) => `${path}.pike-${token}.backup`),
      rollbackFingerprints: { ...productionFingerprints },
    },
  };
}

export async function createRepositoryLakeUpdatePreflight(root = repositoryRoot) {
  const publishedDocuments = await loadPublishedDocuments(join(root, "data", "published-updates"));
  const currentFiles = Object.fromEntries(await Promise.all(
    Object.values(productionDatasetFiles).map(async (path) => [
      path,
      await readFile(join(root, path), "utf8"),
    ]),
  ));
  return createLakeUpdatePreflight({
    productionLakes: lakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    lakePointsByLakeId,
    publishedDocuments,
    currentFiles,
  });
}

export function formatLakeUpdatePreflight(preflight) {
  const lines = [
    "Pike existing lake update production preflight",
    `Eligible for future apply: ${preflight.eligible ? "YES" : "NO"}`,
    `Production lakes: ${preflight.productionLakeCount}`,
    `Pending updates: ${preflight.pendingUpdates.length}`,
    `Already applied updates: ${preflight.alreadyApplied.length}`,
    `Files that would change: ${preflight.filesToChange.length}`,
    `Validation errors: ${preflight.validationErrors.length}`,
    `Blockers: ${preflight.blockers.length}`,
    `Proposal fingerprint: ${preflight.proposalFingerprint}`,
    `Published-input fingerprint: ${preflight.publishedInputFingerprint}`,
    "PRODUCTION MODIFIED: NO",
  ];
  for (const update of preflight.pendingUpdates) {
    lines.push("", `Pending: ${update.id}`, `Target: ${update.targetLakeId}`);
    for (const change of update.changes) {
      const before = change.before.state === "absent" ? "ABSENT" : canonicalJson(change.before.value);
      lines.push(`- ${change.path}: ${before} -> ${canonicalJson(change.after)}`);
    }
  }
  if (preflight.alreadyApplied.length > 0) {
    lines.push("", "Already applied:", ...preflight.alreadyApplied.map((id) => `- ${id}`));
  }
  if (preflight.filesToChange.length > 0) {
    lines.push("", "Files that would change:", ...preflight.filesToChange.map((path) => `- ${path}`));
  }
  for (const entry of preflight.blockers) {
    lines.push(`- BLOCKED [${entry.code}] ${entry.path}: ${entry.message}`);
  }
  for (const error of preflight.validationErrors) lines.push(`- INVALID ${error}`);
  return `${lines.join("\n")}\n`;
}

export async function run(args = process.argv.slice(2), output = console.log) {
  if (args.length !== 0) {
    throw new Error("Usage: node scripts/preflightLakeUpdates.mjs (preflight only; no options)");
  }
  const preflight = await createRepositoryLakeUpdatePreflight();
  output(formatLakeUpdatePreflight(preflight).trimEnd());
  return preflight;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const preflight = await run();
    if (!preflight.eligible) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
