import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakes } from "../src/data/lakes.js";
import { canonicalJson } from "./publishCandidateLake.mjs";
import { updateProposalHash } from "./publishLakeUpdate.mjs";
import { semanticFingerprint } from "./evaluateLakeUpdates.mjs";
import { evaluatePublishedLakeUpdates } from "./evaluatePublishedLakeUpdates.mjs";
import {
  createLakeUpdatePreflight,
  createRepositoryLakeUpdatePreflight,
} from "./preflightLakeUpdates.mjs";
import { productionDatasetFiles } from "./productionDatasetPreflight.mjs";

const targetId = "mogolen-hedenstorp";
const otherId = Object.keys(lakes).find((id) => id !== targetId);

function state() {
  const result = {
    productionLakes: structuredClone(lakes),
    productionDepthMapResearch: structuredClone(lakeDepthMapResearch),
    lakePointsByLakeId: {},
  };
  delete result.productionLakes[targetId].details.methods.spin;
  return result;
}

function fact(note = "Reviewed spin rule.") {
  return {
    value: "allowed",
    status: "verified",
    ruleType: "rule",
    verifiedAt: "2026-09-14",
    sources: [{ url: "https://example.org/rules", type: "authority" }],
    note,
    conditions: null,
  };
}

function proposal(production, {
  id = "mogolen-spin-test",
  path = "details.methods.spin",
  expected = { mode: "absent" },
  proposed = fact(),
} = {}) {
  return {
    schemaVersion: 1,
    proposalId: id,
    targetLakeId: targetId,
    targetLakeFingerprint: semanticFingerprint(production.productionLakes[targetId]),
    reason: "Synthetic reviewed correction.",
    sources: [{
      id: "rules-source",
      type: "authority",
      title: "Synthetic rules",
      url: "https://example.org/rules",
      checkedAt: "2026-09-14",
    }],
    changes: [{
      operation: "set",
      path,
      expected,
      proposed,
      reason: "Explicit reviewed change.",
      sources: ["rules-source"],
      verifiedAt: "2026-09-14",
    }],
  };
}

function publication(update, reviewOverrides = {}) {
  const review = {
    schemaVersion: 1,
    proposalId: update.proposalId,
    targetLakeId: update.targetLakeId,
    decision: "approved",
    reviewer: "Test reviewer",
    reviewedAt: "2026-09-14",
    hashStrategy: "sha256-canonical-json-v1",
    proposalHash: updateProposalHash(update),
    ...reviewOverrides,
  };
  return { schemaVersion: 1, proposal: update, review };
}

function document(wrapper, file = `${wrapper.proposal.proposalId}.json`) {
  return { file, content: canonicalJson(wrapper) + "\n" };
}

function evaluate(production, documents) {
  return evaluatePublishedLakeUpdates({ ...production, publishedDocuments: documents });
}

async function currentFiles() {
  return Object.fromEntries(await Promise.all(Object.values(productionDatasetFiles).map(async (path) => [
    path,
    await readFile(new URL(`../${path}`, import.meta.url), "utf8"),
  ])));
}

test("valid reviewed publication is pending with exact changed-path reporting", () => {
  const production = state();
  const update = proposal(production);
  const result = evaluate(production, [document(publication(update))]);

  assert.equal(result.eligible, true);
  assert.equal(result.summary.pendingUpdateCount, 1);
  assert.equal(result.summary.alreadyAppliedUpdateCount, 0);
  assert.deepEqual(result.pending[0].changes, [{
    path: "details.methods.spin",
    before: { state: "absent" },
    after: fact(),
  }]);
  assert.deepEqual(result.proposedDataset.lakes[otherId], production.productionLakes[otherId]);
  const unchangedTarget = structuredClone(result.proposedDataset.lakes[targetId]);
  delete unchangedTarget.details.methods.spin;
  assert.deepEqual(unchangedTarget, production.productionLakes[targetId]);
});

test("exact reviewed value is already applied even after unrelated later changes", () => {
  const production = state();
  const update = proposal(production);
  const wrapper = publication(update);
  production.productionLakes[targetId].details.methods.spin = fact();
  let result = evaluate(production, [document(wrapper)]);
  assert.equal(result.summary.alreadyAppliedUpdateCount, 1);
  assert.equal(result.summary.pendingUpdateCount, 0);

  production.productionLakes[targetId].name = "Later reviewed name";
  result = evaluate(production, [document(wrapper)]);
  assert.equal(result.eligible, true);
  assert.deepEqual(result.alreadyApplied.map(({ id }) => id), [update.proposalId]);
});

test("reviewed path drift and stale pending production are distinct blockers", () => {
  const drifted = state();
  const driftProposal = proposal(drifted);
  drifted.productionLakes[targetId].details.methods.spin = fact("Different value");
  let result = evaluate(drifted, [document(publication(driftProposal))]);
  assert.deepEqual(result.blocked[0].reasons.map(({ code }) => code), ["reviewed-path-drift"]);

  const stale = state();
  const staleProposal = proposal(stale);
  stale.productionLakes[targetId].name = "Unrelated unreviewed change";
  result = evaluate(stale, [document(publication(staleProposal))]);
  assert.deepEqual(result.blocked[0].reasons.map(({ code }) => code), ["stale-target-fingerprint"]);
});

test("malformed wrapper, rejected review and hash mismatch are blocked", () => {
  const production = state();
  const update = proposal(production);
  const malformed = { ...publication(update), extra: true };
  const rejected = publication(update, { decision: "rejected" });
  const mismatched = publication(update, { proposalHash: "0".repeat(64) });
  for (const wrapper of [malformed, rejected, mismatched]) {
    const result = evaluate(production, [document(wrapper)]);
    assert.equal(result.eligible, false);
    assert.equal(result.summary.blockedUpdateCount, 1);
  }
});

test("multiple pending updates for one lake are blocked without filename ordering", () => {
  const production = state();
  const first = proposal(production, { id: "mogolen-first" });
  const second = proposal(production, {
    id: "mogolen-second",
    path: "details.methods.trolling",
  });
  const result = evaluate(production, [
    document(publication(second)),
    document(publication(first)),
  ]);
  assert.equal(result.summary.pendingUpdateCount, 0);
  assert.equal(result.summary.blockedUpdateCount, 2);
  assert.ok(result.blocked.every(({ reasons }) =>
    reasons[0].code === "ambiguous-pending-updates"));
});

test("already-applied history plus one different-path pending update is allowed", () => {
  const production = state();
  const historical = proposal(production, { id: "mogolen-spin-history" });
  production.productionLakes[targetId].details.methods.spin = fact();
  const next = proposal(production, {
    id: "mogolen-trolling-next",
    path: "details.methods.trolling",
  });
  const result = evaluate(production, [
    document(publication(historical)),
    document(publication(next)),
  ]);
  assert.equal(result.eligible, true);
  assert.deepEqual(result.alreadyApplied.map(({ id }) => id), [historical.proposalId]);
  assert.deepEqual(result.pending.map(({ id }) => id), [next.proposalId]);
});

test("changing a path owned by already-applied history requires superseding", () => {
  const production = state();
  const historical = proposal(production, { id: "mogolen-spin-history" });
  production.productionLakes[targetId].details.methods.spin = fact();
  const next = proposal(production, {
    id: "mogolen-spin-next",
    expected: { mode: "exact", value: fact() },
    proposed: fact("New reviewed value"),
  });
  const result = evaluate(production, [
    document(publication(historical)),
    document(publication(next)),
  ]);
  assert.equal(result.eligible, false);
  assert.deepEqual(result.blocked[0].reasons.map(({ code }) => code), ["historical-path-conflict"]);
});

test("overlapping already-applied history is ambiguous without superseding", () => {
  const production = state();
  const first = proposal(production, { id: "mogolen-spin-history-one" });
  const second = proposal(production, { id: "mogolen-spin-history-two" });
  production.productionLakes[targetId].details.methods.spin = fact();
  const result = evaluate(production, [
    document(publication(first)),
    document(publication(second)),
  ]);
  assert.equal(result.eligible, false);
  assert.equal(result.summary.alreadyAppliedUpdateCount, 0);
  assert.equal(result.summary.blockedUpdateCount, 2);
  assert.ok(result.blocked.every(({ reasons }) =>
    reasons[0].code === "ambiguous-applied-update-history"));
});

test("update preflight changes only lakes.js and preserves all unrelated bytes and semantics", async () => {
  const production = state();
  const update = proposal(production);
  const files = await currentFiles();
  const result = await createLakeUpdatePreflight({
    ...production,
    publishedDocuments: [document(publication(update))],
    currentFiles: files,
  });

  assert.equal(result.eligible, true);
  assert.deepEqual(result.filesToChange, [productionDatasetFiles.lakes]);
  assert.equal(
    result.serializedFiles[productionDatasetFiles.lakeDepthMapResearch],
    files[productionDatasetFiles.lakeDepthMapResearch],
  );
  assert.deepEqual(result.proposedDataset.lakes[otherId], production.productionLakes[otherId]);
  assert.deepEqual(result.proposedDataset.lakes[targetId].details.methods.spin, fact());
  assert.equal(result.validationErrors.length, 0);
});

test("preflight serialization and fingerprints are deterministic", async () => {
  const production = state();
  const documents = [document(publication(proposal(production)))];
  const files = await currentFiles();
  const first = await createLakeUpdatePreflight({ ...production, publishedDocuments: documents, currentFiles: files });
  const second = await createLakeUpdatePreflight({ ...production, publishedDocuments: documents, currentFiles: files });
  assert.equal(first.proposalFingerprint, second.proposalFingerprint);
  assert.deepEqual(first.proposedOutputFingerprints, second.proposedOutputFingerprints);
  assert.deepEqual(first.serializedFiles, second.serializedFiles);
});

test("real repository preflight classifies Batch C as applied history", async () => {
  const paths = Object.values(productionDatasetFiles).map((path) => new URL(`../${path}`, import.meta.url));
  const before = await Promise.all(paths.map((path) => readFile(path)));
  const result = await createRepositoryLakeUpdatePreflight();
  const after = await Promise.all(paths.map((path) => readFile(path)));

  assert.equal(result.eligible, true);
  assert.deepEqual(result.pendingUpdates, []);
  assert.deepEqual(result.alreadyApplied, [
    "hokesjon-baseline-audit-c1",
    "landsjon-baseline-audit-1",
    "mogolen-hedenstorp-spin",
    "mullsjon-baseline-audit-c1",
    "munksjon-baseline-audit-1",
    "nommen-baseline-audit-1",
    "nommen-method-qa-1",
    "ryssbysjon-baseline-audit-1",
    "ryssbysjon-method-qa-1",
    "sandhemssjon-species-qa-1",
    "sommen-baseline-audit-1",
    "spexhultasjon-baseline-audit-1",
    "straken-baseline-audit-1",
    "ulvstorpasjon-baseline-audit-c1",
    "vattern-baseline-audit-1",
  ]);
  assert.deepEqual(result.filesToChange, []);
  assert.equal(result.productionLakeCount, 23);
  assert.deepEqual(result.blockers, []);
  assert.deepEqual(result.validationErrors, []);
  assert.deepEqual(after, before);
});
