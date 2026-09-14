import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakes } from "../src/data/lakes.js";
import { buildLakeDatasetDryRun } from "./buildLakeDataset.mjs";
import { evaluatePublishedLakeUpdates } from "./evaluatePublishedLakeUpdates.mjs";
import { semanticFingerprint } from "./evaluateLakeUpdates.mjs";
import { canonicalJson } from "./publishCandidateLake.mjs";
import { updateProposalHash } from "./publishLakeUpdate.mjs";
import {
  createLakeUpdatePreflight,
  replaceLakeRecordInModule,
} from "./preflightLakeUpdates.mjs";
import {
  createProductionDatasetPreflight,
  fingerprintPublishedDocuments,
  productionDatasetFiles,
} from "./productionDatasetPreflight.mjs";

const targetId = "mogolen-hedenstorp";
const otherId = Object.keys(lakes).find((id) => id !== targetId);

async function repositoryInputs() {
  const [lakePublication, updatePublication, lakeSource, depthSource] = await Promise.all([
    readFile(new URL("../data/published/mogolen-hedenstorp.json", import.meta.url), "utf8"),
    readFile(new URL("../data/published-updates/mogolen-hedenstorp-spin.json", import.meta.url), "utf8"),
    readFile(new URL("../src/data/lakes.js", import.meta.url), "utf8"),
    readFile(new URL("../src/data/lakeDepthMapResearch.js", import.meta.url), "utf8"),
  ]);
  return {
    lakeDocuments: [{ file: `${targetId}.json`, content: lakePublication }],
    updateDocuments: [{ file: `${targetId}-spin.json`, content: updatePublication }],
    currentFiles: {
      [productionDatasetFiles.lakes]: lakeSource,
      [productionDatasetFiles.lakeDepthMapResearch]: depthSource,
    },
  };
}

function updateLifecycle(productionLakes, documents) {
  return evaluatePublishedLakeUpdates({
    productionLakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    lakePointsByLakeId,
    publishedDocuments: documents,
  });
}

function build(productionLakes, lakeDocuments, lifecycle) {
  return buildLakeDatasetDryRun({
    productionLakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    publishedDocuments: lakeDocuments,
    appliedUpdateHistory: lifecycle.alreadyApplied,
  });
}

test("cross-pipeline lifecycle preserves original provenance after reviewed update", async () => {
  const inputs = await repositoryInputs();
  const beforeLakes = structuredClone(lakes);
  delete beforeLakes[targetId].details.methods.spin;
  const beforeFiles = {
    ...inputs.currentFiles,
    [productionDatasetFiles.lakes]: replaceLakeRecordInModule(
      inputs.currentFiles[productionDatasetFiles.lakes],
      targetId,
      beforeLakes[targetId],
    ),
  };
  const beforeLifecycle = updateLifecycle(beforeLakes, inputs.updateDocuments);
  const beforeBuild = build(beforeLakes, inputs.lakeDocuments, beforeLifecycle);

  assert.deepEqual(beforeBuild.alreadyApplied.map(({ id }) => id), [targetId]);
  assert.equal(beforeBuild.blocked.length, 0);
  assert.deepEqual(beforeLifecycle.pending.map(({ id }) => id), [`${targetId}-spin`]);
  assert.equal(beforeLifecycle.blocked.length, 0);

  const pendingPreflight = await createLakeUpdatePreflight({
    productionLakes: beforeLakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    lakePointsByLakeId,
    publishedDocuments: inputs.updateDocuments,
    currentFiles: beforeFiles,
  });
  const appliedLakes = pendingPreflight.proposedDataset.lakes;
  const appliedFiles = pendingPreflight.serializedFiles;
  const afterLifecycle = updateLifecycle(appliedLakes, inputs.updateDocuments);
  const afterBuild = build(appliedLakes, inputs.lakeDocuments, afterLifecycle);

  assert.deepEqual(afterLifecycle.alreadyApplied.map(({ id }) => id), [`${targetId}-spin`]);
  assert.equal(afterLifecycle.pending.length, 0);
  assert.equal(afterLifecycle.blocked.length, 0);
  assert.deepEqual(afterBuild.alreadyApplied.map(({ id }) => id), [targetId]);
  assert.equal(afterBuild.additions.length, 0);
  assert.equal(afterBuild.blocked.length, 0);
  assert.equal(afterBuild.summary.idConflictCount, 0);
  assert.equal(afterBuild.summary.proposedLakeCount, 23);

  const newLakePreflight = await createProductionDatasetPreflight({
    buildResult: afterBuild,
    productionLakes: appliedLakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    lakePointsByLakeId,
    currentFiles: appliedFiles,
    publishedInputFingerprint: fingerprintPublishedDocuments([
      ...inputs.lakeDocuments.map((document) => ({ ...document, file: `new-lakes/${document.file}` })),
      ...inputs.updateDocuments.map((document) => ({ ...document, file: `lake-updates/${document.file}` })),
    ]),
  });
  const afterUpdatePreflight = await createLakeUpdatePreflight({
    productionLakes: appliedLakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    lakePointsByLakeId,
    publishedDocuments: inputs.updateDocuments,
    currentFiles: appliedFiles,
  });
  assert.equal(newLakePreflight.eligible, true);
  assert.deepEqual(newLakePreflight.filesToChange, []);
  assert.equal(afterUpdatePreflight.eligible, true);
  assert.deepEqual(afterUpdatePreflight.filesToChange, []);
  assert.deepEqual(afterUpdatePreflight.alreadyApplied, [`${targetId}-spin`]);
});

test("unreviewed name, method and depth drift remain production conflicts", async () => {
  const inputs = await repositoryInputs();
  const pending = updateLifecycle(lakes, inputs.updateDocuments);
  for (const mutate of [
    (production) => { production[targetId].name = "Unauthorized name"; },
    (production) => { production[targetId].details.methods.trolling = { value: "allowed" }; },
  ]) {
    const production = structuredClone(lakes);
    mutate(production);
    const result = build(production, inputs.lakeDocuments, pending);
    assert.equal(result.summary.idConflictCount, 1);
  }

  const changedDepth = structuredClone(lakeDepthMapResearch);
  changedDepth[targetId].note = "Unauthorized depth change";
  const result = buildLakeDatasetDryRun({
    productionLakes: lakes,
    productionDepthMapResearch: changedDepth,
    publishedDocuments: inputs.lakeDocuments,
    appliedUpdateHistory: [],
  });
  assert.equal(result.summary.idConflictCount, 1);
});

test("wrong reviewed-path value and invalid update artifacts cannot explain drift", async () => {
  const inputs = await repositoryInputs();
  const wrapper = JSON.parse(inputs.updateDocuments[0].content);
  const production = structuredClone(lakes);
  production[targetId].details.methods.spin = {
    ...structuredClone(wrapper.proposal.changes[0].proposed),
    value: "prohibited",
  };
  let lifecycle = updateLifecycle(production, inputs.updateDocuments);
  let result = build(production, inputs.lakeDocuments, lifecycle);
  assert.equal(lifecycle.blocked[0].reasons[0].code, "reviewed-path-drift");
  assert.equal(result.summary.idConflictCount, 1);

  production[targetId].details.methods.spin = structuredClone(wrapper.proposal.changes[0].proposed);
  for (const mutate of [
    (value) => { value.review.decision = "rejected"; },
    (value) => { value.review.proposalHash = "0".repeat(64); },
    (value) => { value.extra = true; },
  ]) {
    const invalid = structuredClone(wrapper);
    mutate(invalid);
    const documents = [{ file: `${targetId}-spin.json`, content: canonicalJson(invalid) }];
    lifecycle = updateLifecycle(production, documents);
    result = build(production, inputs.lakeDocuments, lifecycle);
    assert.equal(lifecycle.alreadyApplied.length, 0);
    assert.equal(lifecycle.blocked.length, 1);
    assert.equal(result.summary.idConflictCount, 1);
  }
});

test("an applied update for another lake cannot explain Mogölen drift", async () => {
  const inputs = await repositoryInputs();
  const baseline = structuredClone(lakes);
  const proposed = {
    value: "allowed",
    status: "verified",
    ruleType: "rule",
    verifiedAt: "2026-09-14",
    sources: [{ url: "https://example.org/rules", type: "authority" }],
    note: "Synthetic unrelated update.",
    conditions: null,
  };
  const proposal = {
    schemaVersion: 1,
    proposalId: `${otherId}-unrelated-update`,
    targetLakeId: otherId,
    targetLakeFingerprint: semanticFingerprint(baseline[otherId]),
    reason: "Synthetic unrelated update.",
    sources: [{
      id: "source",
      type: "authority",
      title: "Synthetic source",
      url: "https://example.org/rules",
      checkedAt: "2026-09-14",
    }],
    changes: [{
      operation: "set",
      path: "details.methods.lineageTest",
      expected: { mode: "absent" },
      proposed,
      reason: "Synthetic unrelated update.",
      sources: ["source"],
      verifiedAt: "2026-09-14",
    }],
  };
  const review = {
    schemaVersion: 1,
    proposalId: proposal.proposalId,
    targetLakeId: otherId,
    decision: "approved",
    reviewer: "Test reviewer",
    reviewedAt: "2026-09-14",
    hashStrategy: "sha256-canonical-json-v1",
    proposalHash: updateProposalHash(proposal),
  };
  const production = structuredClone(baseline);
  production[otherId].details.methods.lineageTest = proposed;
  const mogolenUpdate = JSON.parse(inputs.updateDocuments[0].content);
  production[targetId].details.methods.spin = mogolenUpdate.proposal.changes[0].proposed;
  const documents = [{
    file: `${proposal.proposalId}.json`,
    content: canonicalJson({ schemaVersion: 1, proposal, review }),
  }];
  const lifecycle = updateLifecycle(production, documents);
  const result = build(production, inputs.lakeDocuments, lifecycle);
  assert.deepEqual(lifecycle.alreadyApplied.map(({ targetLakeId }) => targetLakeId), [otherId]);
  assert.equal(result.summary.idConflictCount, 1);
});
