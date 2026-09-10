import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import {
  productionDatasetFiles,
  productionProposalFingerprint,
  sha256,
  validateSerializedProductionFiles,
  verifyPreflightProductionState,
} from "./productionDatasetPreflight.mjs";

const productionPaths = Object.values(productionDatasetFiles);
const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;

class ApplyFailure extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function sameArray(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function safePath(repositoryRoot, relativePath) {
  const root = resolve(repositoryRoot);
  const target = resolve(root, relativePath);
  if (!target.startsWith(`${root}${sep}`)) {
    throw new ApplyFailure("unsafe-apply-path", `path escapes repository root: ${relativePath}`);
  }
  return target;
}

async function checkpoint(hooks, name, context = {}) {
  await hooks?.checkpoint?.(name, context);
}

async function readFiles(repositoryRoot, paths, filesystem) {
  return Object.fromEntries(await Promise.all(paths.map(async (path) => [
    path,
    await filesystem.readFile(safePath(repositoryRoot, path), "utf8"),
  ])));
}

function verifyProposalIntegrity(preflight) {
  if (!preflight.eligible) {
    throw new ApplyFailure("ineligible-preflight", "production preflight is not eligible");
  }
  const knownPaths = new Set(productionPaths);
  const serializedPaths = Object.keys(preflight.serializedFiles).sort(compareText);
  if (!sameArray(serializedPaths, [...productionPaths].sort(compareText))) {
    throw new ApplyFailure("proposal-integrity-mismatch", "proposal does not contain both production files");
  }
  for (const path of serializedPaths) {
    if (!knownPaths.has(path) ||
        sha256(preflight.serializedFiles[path]) !== preflight.proposedOutputFingerprints[path]) {
      throw new ApplyFailure("proposal-integrity-mismatch", `serialized output fingerprint mismatch: ${path}`);
    }
  }
  const expectedChanged = serializedPaths.filter((path) =>
    preflight.productionFingerprints[path] !== preflight.proposedOutputFingerprints[path]);
  if (!sameArray(preflight.filesToChange, expectedChanged) ||
      !sameArray(preflight.applyContract.replacementOrder, expectedChanged)) {
    throw new ApplyFailure("proposal-integrity-mismatch", "replacement file list does not match fingerprints");
  }
  const expectedProposal = productionProposalFingerprint({
    productionFingerprints: preflight.productionFingerprints,
    proposedOutputFingerprints: preflight.proposedOutputFingerprints,
    additionIds: preflight.additions,
    publishedInputFingerprint: preflight.publishedInputFingerprint,
  });
  if (expectedProposal !== preflight.proposalFingerprint) {
    throw new ApplyFailure("proposal-integrity-mismatch", "combined proposal fingerprint mismatch");
  }
}

function compareRecomputedPreflight(initial, recomputed) {
  verifyProposalIntegrity(recomputed);
  if (initial.proposalFingerprint !== recomputed.proposalFingerprint) {
    throw new ApplyFailure(
      "proposal-integrity-mismatch",
      "published input, production base or proposed output changed during apply preparation",
    );
  }
}

async function verifyExactFingerprints(files, expected, code) {
  for (const path of Object.keys(expected).sort(compareText)) {
    if (typeof files[path] !== "string" || sha256(files[path]) !== expected[path]) {
      throw new ApplyFailure(code, `fingerprint mismatch: ${path}`);
    }
  }
}

async function cleanupArtifacts(artifactPaths, filesystem) {
  const errors = [];
  for (const path of artifactPaths.sort(compareText)) {
    try {
      await filesystem.unlink(path);
    } catch (error) {
      if (error.code !== "ENOENT") errors.push(`${path}: ${error.message}`);
    }
  }
  return errors;
}

async function rollbackProduction({
  preflight,
  repositoryRoot,
  lakePointsByLakeId,
  filesystem,
  hooks,
  entries,
}) {
  const errors = [];
  try {
    await checkpoint(hooks, "before-rollback", { entries });
  } catch (error) {
    errors.push(`rollback start: ${error.message}`);
  }

  for (const entry of entries) {
    const restore = `${entry.backup}.restore`;
    try {
      await checkpoint(hooks, "before-rollback-restore", entry);
      const backupContent = await filesystem.readFile(entry.backup, "utf8");
      if (sha256(backupContent) !== preflight.productionFingerprints[entry.path]) {
        throw new Error("backup fingerprint mismatch");
      }
      await filesystem.writeFile(restore, backupContent, { encoding: "utf8", flag: "wx" });
      await filesystem.rename(restore, entry.destination);
      await checkpoint(hooks, "after-rollback-restore", entry);
    } catch (error) {
      errors.push(`${entry.path}: ${error.message}`);
    }
  }

  try {
    await checkpoint(hooks, "before-rollback-verification", { entries });
    const restored = await readFiles(repositoryRoot, productionPaths, filesystem);
    for (const path of productionPaths) {
      if (sha256(restored[path]) !== preflight.productionFingerprints[path]) {
        errors.push(`${path}: restored fingerprint mismatch`);
      }
    }
    const validation = await validateSerializedProductionFiles({
      serializedFiles: restored,
      lakePointsByLakeId,
      expectedLakeCount: preflight.validationStats.lakeCount - preflight.additions.length,
    });
    errors.push(...validation.errors.map((error) => `rollback validation: ${error}`));
  } catch (error) {
    errors.push(`rollback verification: ${error.message}`);
  }

  return { attempted: true, verified: errors.length === 0, errors };
}

function result(status, preflight, details = {}) {
  return {
    status,
    additions: [...preflight.additions],
    filesChanged: status === "success" ? [...preflight.filesToChange] : [],
    productionModified: status === "success" ? true : false,
    rollback: { attempted: false, verified: null, errors: [] },
    ...details,
  };
}

export async function applyProductionDataset({
  preflight,
  repositoryRoot,
  lakePointsByLakeId,
  recomputePreflight,
  filesystem = { readFile, rename, unlink, writeFile },
  hooks = {},
}) {
  try {
    verifyProposalIntegrity(preflight);
    const recomputed = await recomputePreflight();
    compareRecomputedPreflight(preflight, recomputed);
  } catch (error) {
    return result("blocked", preflight, {
      error: { code: error.code ?? "preflight-recompute-failed", message: error.message },
    });
  }

  let currentFiles;
  try {
    await checkpoint(hooks, "before-production-reread");
    currentFiles = await readFiles(repositoryRoot, productionPaths, filesystem);
    const state = verifyPreflightProductionState(preflight, currentFiles);
    if (!state.eligible) {
      throw new ApplyFailure(
        state.blockers[0]?.code ?? "ineligible-preflight",
        state.blockers[0]?.message ?? "production preflight is no longer eligible",
      );
    }
    await verifyExactFingerprints(
      preflight.serializedFiles,
      preflight.proposedOutputFingerprints,
      "proposal-integrity-mismatch",
    );
    const validation = await validateSerializedProductionFiles({
      serializedFiles: preflight.serializedFiles,
      lakePointsByLakeId,
      expectedLakeCount: preflight.validationStats.lakeCount,
    });
    if (validation.errors.length > 0) {
      throw new ApplyFailure("proposed-output-validation-failed", validation.errors.join("; "));
    }
  } catch (error) {
    return result("blocked", preflight, {
      error: { code: error.code ?? "apply-preparation-failed", message: error.message },
    });
  }

  if (preflight.filesToChange.length === 0) {
    return result("noop", preflight, { productionModified: false });
  }

  const token = preflight.proposalFingerprint.slice(0, 16);
  const entries = preflight.applyContract.replacementOrder.map((path) => ({
    path,
    destination: safePath(repositoryRoot, path),
    staging: safePath(repositoryRoot, `${path}.pike-${token}.next`),
    backup: safePath(repositoryRoot, `${path}.pike-${token}.backup`),
  }));
  const artifacts = entries.flatMap(({ staging, backup }) => [staging, backup]);
  let replacementStarted = false;

  try {
    for (const entry of entries) {
      await checkpoint(hooks, "before-stage-write", entry);
      await filesystem.writeFile(entry.staging, preflight.serializedFiles[entry.path], {
        encoding: "utf8",
        flag: "wx",
      });
      await checkpoint(hooks, "after-stage-write", entry);
      const staged = await filesystem.readFile(entry.staging, "utf8");
      if (sha256(staged) !== preflight.proposedOutputFingerprints[entry.path]) {
        throw new ApplyFailure("staged-output-fingerprint-mismatch", `staged bytes differ: ${entry.path}`);
      }
    }

    const stagedFiles = { ...currentFiles };
    for (const entry of entries) {
      stagedFiles[entry.path] = await filesystem.readFile(entry.staging, "utf8");
    }
    const stagedValidation = await validateSerializedProductionFiles({
      serializedFiles: stagedFiles,
      lakePointsByLakeId,
      expectedLakeCount: preflight.validationStats.lakeCount,
    });
    if (stagedValidation.errors.length > 0) {
      throw new ApplyFailure("staged-output-validation-failed", stagedValidation.errors.join("; "));
    }

    for (const entry of entries) {
      await checkpoint(hooks, "before-backup-write", entry);
      await filesystem.writeFile(entry.backup, currentFiles[entry.path], {
        encoding: "utf8",
        flag: "wx",
      });
      await checkpoint(hooks, "after-backup-write", entry);
      const backup = await filesystem.readFile(entry.backup, "utf8");
      if (sha256(backup) !== preflight.productionFingerprints[entry.path]) {
        throw new ApplyFailure("backup-fingerprint-mismatch", `backup bytes differ: ${entry.path}`);
      }
    }

    await checkpoint(hooks, "before-first-replacement", { entries });
    const immediatelyCurrent = await readFiles(repositoryRoot, productionPaths, filesystem);
    const immediateState = verifyPreflightProductionState(preflight, immediatelyCurrent);
    if (!immediateState.eligible) {
      throw new ApplyFailure(
        immediateState.blockers[0]?.code ?? "stale-production-fingerprint",
        immediateState.blockers[0]?.message ?? "production changed before replacement",
      );
    }

    for (const entry of entries) {
      await checkpoint(hooks, "before-replacement", entry);
      replacementStarted = true;
      await filesystem.rename(entry.staging, entry.destination);
      await checkpoint(hooks, "after-replacement", entry);
    }

    await checkpoint(hooks, "before-final-validation", { entries });
    const finalFiles = await readFiles(repositoryRoot, productionPaths, filesystem);
    await verifyExactFingerprints(
      finalFiles,
      preflight.proposedOutputFingerprints,
      "final-output-fingerprint-mismatch",
    );
    const finalValidation = await validateSerializedProductionFiles({
      serializedFiles: finalFiles,
      lakePointsByLakeId,
      expectedLakeCount: preflight.validationStats.lakeCount,
    });
    if (finalValidation.errors.length > 0) {
      throw new ApplyFailure("final-production-validation-failed", finalValidation.errors.join("; "));
    }

    const cleanupErrors = await cleanupArtifacts(artifacts, filesystem);
    return result("success", preflight, {
      cleanupErrors,
      retainedArtifacts: cleanupErrors.length > 0
        ? entries.flatMap(({ path }) => [
            `${path}.pike-${token}.next`,
            `${path}.pike-${token}.backup`,
          ])
        : [],
    });
  } catch (error) {
    if (!replacementStarted) {
      const cleanupErrors = await cleanupArtifacts(artifacts, filesystem);
      return result("failed", preflight, {
        productionModified: false,
        error: { code: error.code ?? "apply-failed", message: error.message },
        cleanupErrors,
      });
    }

    const rollback = await rollbackProduction({
      preflight,
      repositoryRoot,
      lakePointsByLakeId,
      filesystem,
      hooks,
      entries,
    });
    const cleanupErrors = rollback.verified
      ? await cleanupArtifacts(artifacts, filesystem)
      : [];
    return result(rollback.verified ? "failed-rolled-back" : "critical", preflight, {
      productionModified: rollback.verified ? false : null,
      error: { code: error.code ?? "apply-failed", message: error.message },
      rollback,
      cleanupErrors,
      retainedArtifacts: rollback.verified ? [] : entries.flatMap(({ path }) => [
        `${path}.pike-${token}.next`,
        `${path}.pike-${token}.backup`,
        `${path}.pike-${token}.backup.restore`,
      ]),
    });
  }
}

export function formatProductionApply(result) {
  const heading = {
    success: "APPLY SUCCESS",
    noop: "APPLY NO-OP",
    blocked: "APPLY BLOCKED",
    failed: "APPLY FAILED — PRODUCTION UNCHANGED",
    "failed-rolled-back": "APPLY FAILED — ROLLBACK VERIFIED",
    critical: "CRITICAL — ROLLBACK VERIFICATION FAILED",
  }[result.status];
  const lines = [
    heading,
    `Approved additions: ${result.additions.length}`,
    `Files changed: ${result.filesChanged.length}`,
    `Production modified: ${result.productionModified === null ? "UNKNOWN" : result.productionModified ? "YES" : "NO"}`,
  ];
  if (result.status === "noop") lines.push("Production already matches the proposal; no changes required.");
  if (result.error) lines.push(`Error: [${result.error.code}] ${result.error.message}`);
  if (result.rollback.attempted) {
    lines.push(`Rollback attempted: YES`, `Rollback verified: ${result.rollback.verified ? "YES" : "NO"}`);
  }
  if (result.filesChanged.length > 0) {
    lines.push("", "Changed files:", ...result.filesChanged.map((path) => `- ${path}`));
  }
  if (result.additions.length > 0) {
    lines.push("", "Added lake IDs:", ...result.additions.map((id) => `- ${id}`));
  }
  if (result.retainedArtifacts?.length > 0) {
    lines.push("", "Retained recovery artifacts:", ...result.retainedArtifacts.map((path) => `- ${path}`));
  }
  if (result.cleanupErrors?.length > 0) {
    lines.push("", "Artifact cleanup errors:", ...result.cleanupErrors.map((error) => `- ${error}`));
  }
  return `${lines.join("\n")}\n`;
}
