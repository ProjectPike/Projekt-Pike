import { createHash } from "node:crypto";
import { canonicalJson } from "./publishCandidateLake.mjs";
import { validateLakeDataState } from "./lakeDataValidation.mjs";

export const productionDatasetFiles = Object.freeze({
  lakes: "src/data/lakes.js",
  lakeDepthMapResearch: "src/data/lakeDepthMapResearch.js",
});

const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;

export function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function blocker(code, path, message) {
  return { code, path, message };
}

function sameValue(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function appendEntriesToModule(currentSource, exportName, additions) {
  if (Object.keys(additions).length === 0) return currentSource;

  const marker = `export const ${exportName} = {`;
  const markerIndex = currentSource.indexOf(marker);
  const closingIndex = currentSource.lastIndexOf("\n};");
  if (markerIndex < 0 || closingIndex < markerIndex || currentSource.slice(closingIndex + 3).trim()) {
    throw new Error(`${exportName}: unsupported production module structure`);
  }

  const serializedEntries = Object.keys(additions).sort(compareText).map((id) => {
    const value = JSON.stringify(additions[id], null, 2).replace(/\n/g, "\n  ");
    return `  ${JSON.stringify(id)}: ${value},`;
  });
  const prefix = currentSource.slice(0, closingIndex);
  const finalCharacter = prefix.trimEnd().at(-1);
  const separator = finalCharacter === "," || finalCharacter === "{" ? "" : ",";
  return `${prefix}${separator}\n${serializedEntries.join("\n")}${currentSource.slice(closingIndex)}`;
}

async function importSerializedModule(content) {
  const encoded = Buffer.from(content, "utf8").toString("base64");
  return import(`data:text/javascript;base64,${encoded}#${sha256(content)}`);
}

export function fingerprintPublishedDocuments(documents) {
  return sha256(canonicalJson([...documents]
    .sort((left, right) => compareText(left.file, right.file))
    .map(({ file, content, readError }) => ({
      file,
      ...(content === undefined ? {} : { content }),
      ...(readError === undefined ? {} : { readError }),
    }))));
}

export async function validateSerializedProductionFiles({
  serializedFiles,
  lakePointsByLakeId,
  expectedLakeCount,
}) {
  try {
    const [lakeModule, depthModule] = await Promise.all([
      importSerializedModule(serializedFiles[productionDatasetFiles.lakes]),
      importSerializedModule(serializedFiles[productionDatasetFiles.lakeDepthMapResearch]),
    ]);
    return validateLakeDataState({
      lakes: lakeModule.lakes,
      lakeDepthMapResearch: depthModule.lakeDepthMapResearch,
      lakePointsByLakeId,
      expectedLakeCount,
    });
  } catch (error) {
    return {
      errors: [`serialized production modules: ${error.message}`],
      stats: null,
    };
  }
}

export function productionProposalFingerprint({
  productionFingerprints,
  proposedOutputFingerprints,
  additionIds,
  publishedInputFingerprint = null,
}) {
  return sha256(canonicalJson({
    productionFingerprints,
    proposedOutputFingerprints,
    additionIds: [...additionIds].sort(compareText),
    publishedInputFingerprint,
  }));
}

function validateNewLakesOnly({
  productionLakes,
  productionDepthMapResearch,
  proposedDataset,
  additions,
}) {
  const blockers = [];
  const additionIds = additions.map(({ id }) => id).sort(compareText);
  const approvedIds = new Set(additionIds);

  if (approvedIds.size !== additionIds.length) {
    blockers.push(blocker("duplicate-addition-id", "additions", "addition IDs must be unique"));
  }

  for (const id of Object.keys(productionLakes)) {
    if (!Object.hasOwn(proposedDataset.lakes, id)) {
      blockers.push(blocker("existing-lake-removed", `lakes.${id}`, "existing production lake is missing"));
    } else if (!sameValue(productionLakes[id], proposedDataset.lakes[id])) {
      blockers.push(blocker("existing-lake-modified", `lakes.${id}`, "existing production lake changed"));
    }
  }
  for (const id of Object.keys(productionDepthMapResearch)) {
    if (!Object.hasOwn(proposedDataset.lakeDepthMapResearch, id)) {
      blockers.push(blocker(
        "existing-depth-research-removed",
        `lakeDepthMapResearch.${id}`,
        "existing production depth-research record is missing",
      ));
    } else if (!sameValue(
      productionDepthMapResearch[id],
      proposedDataset.lakeDepthMapResearch[id],
    )) {
      blockers.push(blocker(
        "existing-depth-research-modified",
        `lakeDepthMapResearch.${id}`,
        "existing production depth-research record changed",
      ));
    }
  }

  for (const { id, lake } of additions) {
    if (Object.hasOwn(productionLakes, id)) {
      blockers.push(blocker("existing-id-collision", `additions.${id}`, "addition ID exists in production"));
    }
    if (!Object.hasOwn(proposedDataset.lakes, id)) {
      blockers.push(blocker("addition-missing", `lakes.${id}`, "approved addition is missing"));
    } else if (!sameValue(lake, proposedDataset.lakes[id])) {
      blockers.push(blocker(
        "addition-content-mismatch",
        `lakes.${id}`,
        "proposed lake differs from the approved builder addition",
      ));
    }
    if (!Object.hasOwn(proposedDataset.lakeDepthMapResearch, id)) {
      blockers.push(blocker(
        "addition-depth-research-missing",
        `lakeDepthMapResearch.${id}`,
        "approved addition has no depth-research record",
      ));
    }
  }

  for (const id of Object.keys(proposedDataset.lakes)) {
    if (!Object.hasOwn(productionLakes, id) && !approvedIds.has(id)) {
      blockers.push(blocker("unapproved-lake-addition", `lakes.${id}`, "lake is not an approved addition"));
    }
  }
  for (const id of Object.keys(proposedDataset.lakeDepthMapResearch)) {
    if (!Object.hasOwn(productionDepthMapResearch, id) && !approvedIds.has(id)) {
      blockers.push(blocker(
        "unapproved-depth-research-addition",
        `lakeDepthMapResearch.${id}`,
        "depth-research record is not tied to an approved addition",
      ));
    }
  }

  return blockers.sort((left, right) =>
    compareText(left.code, right.code) || compareText(left.path, right.path));
}

function additionsRecord(additions, proposedRecord) {
  return Object.fromEntries(
    additions.map(({ id }) => id).sort(compareText).map((id) => [id, proposedRecord[id]]),
  );
}

export async function createProductionDatasetPreflight({
  buildResult,
  productionLakes,
  productionDepthMapResearch,
  lakePointsByLakeId,
  currentFiles,
  publishedInputFingerprint = null,
}) {
  const blockers = validateNewLakesOnly({
    productionLakes,
    productionDepthMapResearch,
    proposedDataset: buildResult.proposedDataset,
    additions: buildResult.additions,
  });
  for (const entry of buildResult.blocked) {
    for (const reason of entry.reasons) {
      blockers.push(blocker(
        reason.code,
        `${entry.file}:${reason.path}`,
        reason.message,
      ));
    }
  }
  for (const error of buildResult.productionErrors) blockers.push(error);

  const lakeAdditions = additionsRecord(
    buildResult.additions,
    buildResult.proposedDataset.lakes,
  );
  const depthAdditions = additionsRecord(
    buildResult.additions,
    buildResult.proposedDataset.lakeDepthMapResearch,
  );
  const serializedFiles = {
    [productionDatasetFiles.lakes]: appendEntriesToModule(
      currentFiles[productionDatasetFiles.lakes],
      "lakes",
      lakeAdditions,
    ),
    [productionDatasetFiles.lakeDepthMapResearch]: appendEntriesToModule(
      currentFiles[productionDatasetFiles.lakeDepthMapResearch],
      "lakeDepthMapResearch",
      depthAdditions,
    ),
  };
  const productionFingerprints = Object.fromEntries(
    Object.entries(currentFiles).map(([path, content]) => [path, sha256(content)]),
  );
  const proposedOutputFingerprints = Object.fromEntries(
    Object.entries(serializedFiles).map(([path, content]) => [path, sha256(content)]),
  );
  const validation = await validateSerializedProductionFiles({
    serializedFiles,
    lakePointsByLakeId,
    expectedLakeCount: Object.keys(productionLakes).length + buildResult.additions.length,
  });
  const validationErrors = [...validation.errors];

  const filesToChange = Object.keys(serializedFiles)
    .filter((path) => productionFingerprints[path] !== proposedOutputFingerprints[path])
    .sort(compareText);
  const additionIds = buildResult.additions.map(({ id }) => id).sort(compareText);
  const proposalFingerprint = productionProposalFingerprint({
    productionFingerprints,
    proposedOutputFingerprints,
    additionIds,
    publishedInputFingerprint,
  });

  return {
    eligible: blockers.length === 0 && validationErrors.length === 0,
    productionFingerprints,
    proposedOutputFingerprints,
    publishedInputFingerprint,
    proposalFingerprint,
    filesToChange,
    additions: additionIds,
    blockers,
    validationErrors,
    validationStats: validation?.stats ?? null,
    serializedFiles,
    applyContract: {
      strategy: "same-directory-stage-backup-rename-rollback",
      multiFileAtomic: false,
      replacementOrder: [...filesToChange],
      stagingFiles: filesToChange.map((path) => `${path}.pike-${proposalFingerprint.slice(0, 16)}.next`),
      backupFiles: filesToChange.map((path) => `${path}.pike-${proposalFingerprint.slice(0, 16)}.backup`),
      requiredChecks: [
        "recheck every production fingerprint immediately before staging",
        "write staged files exclusively beside each destination and verify their fingerprints",
        "create and verify backups for every destination before the first replacement",
        "rename staged files in the declared order and validate the final complete state",
        "restore every original from verified backups if any replacement or final validation fails",
      ],
      rollbackFingerprints: { ...productionFingerprints },
    },
  };
}

export function verifyPreflightProductionState(preflight, currentFiles) {
  const blockers = [];
  for (const path of Object.keys(preflight.productionFingerprints).sort(compareText)) {
    const actual = typeof currentFiles[path] === "string" ? sha256(currentFiles[path]) : null;
    if (actual !== preflight.productionFingerprints[path]) {
      blockers.push(blocker(
        "stale-production-fingerprint",
        path,
        "current production bytes no longer match the preflight base",
      ));
    }
  }
  return { eligible: preflight.eligible && blockers.length === 0, blockers };
}

export function formatProductionDatasetPreflight(preflight) {
  const lines = [
    "Pike production dataset preflight",
    `Eligible for future apply: ${preflight.eligible ? "YES" : "NO"}`,
    `Approved additions: ${preflight.additions.length}`,
    `Production files that would change: ${preflight.filesToChange.length}`,
    `Validation errors: ${preflight.validationErrors.length}`,
    `Blockers: ${preflight.blockers.length}`,
    `Proposal fingerprint: ${preflight.proposalFingerprint}`,
    "PRODUCTION MODIFIED: NO",
  ];
  if (preflight.filesToChange.length > 0) {
    lines.push("", "Files that would change:");
    for (const path of preflight.filesToChange) lines.push(`- ${path}`);
  }
  if (preflight.additions.length > 0) {
    lines.push("", "Approved additions:");
    for (const id of preflight.additions) lines.push(`- ${id}`);
  }
  if (preflight.blockers.length > 0) {
    lines.push("", "Blockers:");
    for (const entry of preflight.blockers) {
      lines.push(`- [${entry.code}] ${entry.path}: ${entry.message}`);
    }
  }
  if (preflight.validationErrors.length > 0) {
    lines.push("", "Validation errors:");
    for (const error of preflight.validationErrors) lines.push(`- ${error}`);
  }
  return `${lines.join("\n")}\n`;
}
