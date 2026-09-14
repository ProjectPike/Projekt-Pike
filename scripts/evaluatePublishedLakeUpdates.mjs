import { basename } from "node:path";
import { canonicalJson } from "./publishCandidateLake.mjs";
import { prepareReviewedUpdatePublication } from "./publishLakeUpdate.mjs";
import {
  evaluateLakeUpdateProposal,
  parseUpdatePath,
  semanticFingerprint,
} from "./evaluateLakeUpdates.mjs";

const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;

function reason(code, path, message) {
  return { code, path, message };
}

function sortReasons(reasons) {
  return [...reasons].sort((left, right) =>
    compareText(left.code, right.code) ||
    compareText(left.path, right.path) ||
    compareText(left.message, right.message));
}

function exactWrapper(publication) {
  return publication && typeof publication === "object" && !Array.isArray(publication) &&
    Object.keys(publication).sort(compareText).join(",") === "proposal,review,schemaVersion" &&
    publication.schemaVersion === 1;
}

function readPath(root, path) {
  const segments = parseUpdatePath(path);
  let value = root;
  for (const segment of segments ?? []) {
    if (!value || typeof value !== "object" || Array.isArray(value) ||
      !Object.hasOwn(value, segment)) return { present: false, value: undefined };
    value = value[segment];
  }
  return { present: Boolean(segments), value };
}

function matchesProposed(lake, change) {
  const current = readPath(lake, change.path);
  return current.present && canonicalJson(current.value) === canonicalJson(change.proposed);
}

function matchesExpected(lake, change) {
  const current = readPath(lake, change.path);
  if (change.expected.mode === "absent") return !current.present;
  return current.present && canonicalJson(current.value) === canonicalJson(change.expected.value);
}

function pathsOverlap(left, right) {
  return left === right || left.startsWith(`${right}.`) || right.startsWith(`${left}.`);
}

function blocked(document, publication, reasons) {
  return {
    file: document.file,
    id: publication?.proposal?.proposalId ?? null,
    targetLakeId: publication?.proposal?.targetLakeId ?? null,
    reasons: sortReasons(reasons),
  };
}

function parseDocument(document) {
  if (document.readError) {
    return { document, publication: null, reasons: [reason(
      "unreadable-published-update", "$", document.readError,
    )] };
  }
  try {
    return { document, publication: JSON.parse(document.content), reasons: [] };
  } catch {
    return { document, publication: null, reasons: [reason(
      "invalid-json", "$", "published update is not valid JSON",
    )] };
  }
}

export function evaluatePublishedLakeUpdates({
  productionLakes,
  productionDepthMapResearch,
  lakePointsByLakeId,
  publishedDocuments,
}) {
  const parsed = [...publishedDocuments]
    .sort((left, right) => compareText(left.file, right.file))
    .map(parseDocument);
  const proposalCounts = new Map();
  for (const { publication } of parsed) {
    const id = publication?.proposal?.proposalId;
    if (typeof id === "string") proposalCounts.set(id, (proposalCounts.get(id) ?? 0) + 1);
  }

  const pending = [];
  const alreadyApplied = [];
  const blockedEntries = [];

  for (const entry of parsed) {
    const { document, publication } = entry;
    const reasons = [...entry.reasons];
    if (publication && !exactWrapper(publication)) {
      reasons.push(reason(
        "malformed-published-update-wrapper", "$",
        "expected exactly schemaVersion 1, proposal and review",
      ));
    }
    if (publication && reasons.length === 0) {
      try {
        prepareReviewedUpdatePublication(publication.proposal, publication.review);
      } catch (error) {
        reasons.push(reason("invalid-published-update-integrity", "$", error.message));
      }
    }

    const proposal = publication?.proposal;
    const id = proposal?.proposalId;
    const targetLakeId = proposal?.targetLakeId;
    if (id && basename(document.file, ".json") !== id) {
      reasons.push(reason(
        "published-update-filename-mismatch", "$.proposal.proposalId",
        `proposal ID ${id} does not match filename ${document.file}`,
      ));
    }
    if (id && proposalCounts.get(id) > 1) {
      reasons.push(reason(
        "duplicate-published-update-id", "$.proposal.proposalId",
        `proposal ID ${id} occurs more than once`,
      ));
    }
    if (targetLakeId && !Object.hasOwn(productionLakes, targetLakeId)) {
      reasons.push(reason(
        "unknown-target-lake", "$.proposal.targetLakeId",
        `production lake ${targetLakeId} does not exist`,
      ));
    }
    if (reasons.length > 0) {
      blockedEntries.push(blocked(document, publication, reasons));
      continue;
    }

    const currentLake = productionLakes[targetLakeId];
    const allProposed = proposal.changes.every((change) => matchesProposed(currentLake, change));
    if (allProposed) {
      alreadyApplied.push({
        file: document.file,
        id,
        targetLakeId,
        changedPaths: proposal.changes.map(({ path }) => path).sort(compareText),
      });
      continue;
    }

    const evaluation = evaluateLakeUpdateProposal({
      proposal,
      productionLakes,
      productionDepthMapResearch,
      lakePointsByLakeId,
    });
    if (evaluation.eligible) {
      pending.push({
        file: document.file,
        id,
        targetLakeId,
        changes: evaluation.changes,
        proposedLake: evaluation.proposedDataset.lakes[targetLakeId],
      });
      continue;
    }

    const fingerprintChanged = semanticFingerprint(currentLake) !== proposal.targetLakeFingerprint;
    const allExpected = proposal.changes.every((change) => matchesExpected(currentLake, change));
    const evaluationReasons = fingerprintChanged && !allExpected
      ? [reason(
          "reviewed-path-drift", `lakes.${targetLakeId}`,
          "a reviewed path matches neither its expected before-state nor its proposed value",
        )]
      : [
          ...evaluation.blockers,
          ...evaluation.validationErrors.map((message) => reason(
            "production-validation-error", "production", message,
          )),
        ];
    blockedEntries.push(blocked(document, publication, evaluationReasons));
  }

  const pendingByTarget = new Map();
  for (const entry of pending) {
    const entries = pendingByTarget.get(entry.targetLakeId) ?? [];
    entries.push(entry);
    pendingByTarget.set(entry.targetLakeId, entries);
  }
  for (const [targetLakeId, entries] of pendingByTarget) {
    if (entries.length < 2) continue;
    for (const entry of entries) {
      blockedEntries.push(blocked(
        { file: entry.file },
        { proposal: { proposalId: entry.id, targetLakeId } },
        [reason(
          "ambiguous-pending-updates", `lakes.${targetLakeId}`,
          "multiple pending updates for one target require explicit sequencing",
        )],
      ));
    }
  }
  const ambiguousTargets = new Set([...pendingByTarget]
    .filter(([, entries]) => entries.length > 1)
    .map(([targetLakeId]) => targetLakeId));
  let acceptedPending = pending.filter(({ targetLakeId }) => !ambiguousTargets.has(targetLakeId));

  const historicalPaths = new Map();
  for (const entry of alreadyApplied) {
    const paths = historicalPaths.get(entry.targetLakeId) ?? [];
    paths.push(...entry.changedPaths);
    historicalPaths.set(entry.targetLakeId, paths);
  }
  const historicalConflicts = new Set();
  for (const entry of acceptedPending) {
    const conflict = entry.changes.find(({ path }) =>
      (historicalPaths.get(entry.targetLakeId) ?? []).some((historical) => pathsOverlap(path, historical)));
    if (!conflict) continue;
    historicalConflicts.add(entry.id);
    blockedEntries.push(blocked(
      { file: entry.file },
      { proposal: { proposalId: entry.id, targetLakeId: entry.targetLakeId } },
      [reason(
        "historical-path-conflict", conflict.path,
        "changing a path owned by an already-applied update requires explicit superseding",
      )],
    ));
  }
  acceptedPending = acceptedPending.filter(({ id }) => !historicalConflicts.has(id));

  const proposedLakes = structuredClone(productionLakes);
  for (const entry of acceptedPending.sort((left, right) => compareText(left.id, right.id))) {
    proposedLakes[entry.targetLakeId] = structuredClone(entry.proposedLake);
  }

  return {
    eligible: blockedEntries.length === 0,
    pending: acceptedPending,
    alreadyApplied: alreadyApplied.sort((left, right) => compareText(left.id, right.id)),
    blocked: blockedEntries.sort((left, right) =>
      compareText(left.file, right.file) || compareText(left.id ?? "", right.id ?? "")),
    proposedDataset: {
      lakes: proposedLakes,
      lakeDepthMapResearch: structuredClone(productionDepthMapResearch),
    },
    summary: {
      publishedUpdateCount: publishedDocuments.length,
      pendingUpdateCount: acceptedPending.length,
      alreadyAppliedUpdateCount: alreadyApplied.length,
      blockedUpdateCount: blockedEntries.length,
      productionModified: false,
    },
  };
}
