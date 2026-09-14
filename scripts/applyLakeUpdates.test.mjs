import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakes } from "../src/data/lakes.js";
import { applyProductionDataset } from "./applyProductionDataset.mjs";
import { run as runUpdateApply } from "./applyLakeUpdates.mjs";
import { semanticFingerprint } from "./evaluateLakeUpdates.mjs";
import { canonicalJson } from "./publishCandidateLake.mjs";
import { updateProposalHash } from "./publishLakeUpdate.mjs";
import { createLakeUpdatePreflight } from "./preflightLakeUpdates.mjs";
import { productionDatasetFiles } from "./productionDatasetPreflight.mjs";

const targetId = "mogolen-hedenstorp";
const proposalId = "mogolen-spin-apply-test";

function spinFact() {
  return {
    value: "allowed",
    status: "verified",
    ruleType: "rule",
    verifiedAt: "2026-09-14",
    sources: [{ url: "https://example.org/rules", type: "authority" }],
    note: "Reviewed spin rule.",
    conditions: null,
  };
}

function publication(productionLakes = lakes) {
  const proposal = {
    schemaVersion: 1,
    proposalId,
    targetLakeId: targetId,
    targetLakeFingerprint: semanticFingerprint(productionLakes[targetId]),
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
      path: "details.methods.spin",
      expected: { mode: "absent" },
      proposed: spinFact(),
      reason: "Explicit reviewed change.",
      sources: ["rules-source"],
      verifiedAt: "2026-09-14",
    }],
  };
  const review = {
    schemaVersion: 1,
    proposalId,
    targetLakeId: targetId,
    decision: "approved",
    reviewer: "Test reviewer",
    reviewedAt: "2026-09-14",
    hashStrategy: "sha256-canonical-json-v1",
    proposalHash: updateProposalHash(proposal),
  };
  return { schemaVersion: 1, proposal, review };
}

async function files(root) {
  return Object.fromEntries(await Promise.all(Object.values(productionDatasetFiles).map(async (path) => [
    path,
    await readFile(join(root, path), "utf8"),
  ])));
}

async function setup(t) {
  const root = await mkdtemp(join(tmpdir(), "pike-update-apply-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "src", "data"), { recursive: true });
  for (const path of Object.values(productionDatasetFiles)) {
    await writeFile(join(root, path), await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
  }
  const productionLakes = structuredClone(lakes);
  const productionDepthMapResearch = structuredClone(lakeDepthMapResearch);
  const publishedDocuments = [{
    file: `${proposalId}.json`,
    content: canonicalJson(publication(productionLakes)) + "\n",
  }];
  const makePreflight = async ({
    currentLakes = productionLakes,
    documents = publishedDocuments,
  } = {}) => createLakeUpdatePreflight({
    productionLakes: currentLakes,
    productionDepthMapResearch,
    lakePointsByLakeId,
    publishedDocuments: documents,
    currentFiles: await files(root),
  });
  const originalFiles = await files(root);
  const preflight = await makePreflight();
  return {
    root,
    productionLakes,
    productionDepthMapResearch,
    publishedDocuments,
    makePreflight,
    originalFiles,
    preflight,
  };
}

async function applyFixture(s, options = {}) {
  return applyProductionDataset({
    preflight: s.preflight,
    repositoryRoot: s.root,
    lakePointsByLakeId,
    recomputePreflight: options.recomputePreflight ?? (() => s.makePreflight()),
    hooks: options.hooks,
    filesystem: options.filesystem,
  });
}

async function assertOriginals(s) {
  assert.deepEqual(await files(s.root), s.originalFiles);
}

async function artifacts(root) {
  return (await readdir(join(root, "src", "data"))).filter((name) => name.includes(".pike-"));
}

test("successful fixture apply writes exact proposed bytes and cleans artifacts", async (t) => {
  const s = await setup(t);
  const result = await applyFixture(s);
  assert.equal(result.status, "success");
  assert.deepEqual(await files(s.root), s.preflight.serializedFiles);
  assert.deepEqual(await artifacts(s.root), []);
  assert.equal(s.preflight.proposedDataset.lakes[targetId].details.methods.spin.value, "allowed");
  for (const [id, lake] of Object.entries(lakes)) {
    if (id !== targetId) assert.deepEqual(s.preflight.proposedDataset.lakes[id], lake);
  }
});

test("post-apply preflight is alreadyApplied and second fixture apply is a no-op", async (t) => {
  const s = await setup(t);
  assert.equal((await applyFixture(s)).status, "success");
  const appliedLakes = s.preflight.proposedDataset.lakes;
  const after = await s.makePreflight({ currentLakes: appliedLakes });
  assert.equal(after.eligible, true);
  assert.equal(after.pendingUpdates.length, 0);
  assert.deepEqual(after.alreadyApplied, [proposalId]);
  assert.deepEqual(after.filesToChange, []);

  const bytesBefore = await files(s.root);
  const second = await applyProductionDataset({
    preflight: after,
    repositoryRoot: s.root,
    lakePointsByLakeId,
    recomputePreflight: () => s.makePreflight({ currentLakes: appliedLakes }),
  });
  assert.equal(second.status, "noop");
  assert.deepEqual(await files(s.root), bytesBefore);
  assert.deepEqual(await artifacts(s.root), []);
});

test("stale production blocks before staging or backup", async (t) => {
  const s = await setup(t);
  await writeFile(
    join(s.root, productionDatasetFiles.lakes),
    `${s.originalFiles[productionDatasetFiles.lakes]}\n`,
  );
  const changed = await files(s.root);
  const result = await applyFixture(s, { recomputePreflight: async () => s.preflight });
  assert.equal(result.status, "blocked");
  assert.equal(result.error.code, "stale-production-fingerprint");
  assert.deepEqual(await files(s.root), changed);
  assert.deepEqual(await artifacts(s.root), []);
});

test("changed published input blocks apply before writes", async (t) => {
  const s = await setup(t);
  const changed = structuredClone(s.publishedDocuments);
  const wrapper = JSON.parse(changed[0].content);
  wrapper.proposal.reason = "Changed after publication.";
  changed[0].content = canonicalJson(wrapper) + "\n";
  const result = await applyFixture(s, {
    recomputePreflight: () => s.makePreflight({ documents: changed }),
  });
  assert.equal(result.status, "blocked");
  await assertOriginals(s);
  assert.deepEqual(await artifacts(s.root), []);
});

for (const [name, checkpoint] of [
  ["staging failure", "before-stage-write"],
  ["backup failure", "before-backup-write"],
]) {
  test(`${name} leaves production untouched and cleans artifacts`, async (t) => {
    const s = await setup(t);
    const result = await applyFixture(s, {
      hooks: { checkpoint: (current) => {
        if (current === checkpoint) throw new Error(name);
      } },
    });
    assert.equal(result.status, "failed");
    await assertOriginals(s);
    assert.deepEqual(await artifacts(s.root), []);
  });
}

test("replacement failure rolls back and verifies original bytes", async (t) => {
  const s = await setup(t);
  const result = await applyFixture(s, {
    hooks: { checkpoint: (name) => {
      if (name === "after-replacement") throw new Error("replacement failure");
    } },
  });
  assert.equal(result.status, "failed-rolled-back");
  assert.equal(result.rollback.verified, true);
  await assertOriginals(s);
  assert.deepEqual(await artifacts(s.root), []);
});

test("rollback verification failure is surfaced as critical", async (t) => {
  const s = await setup(t);
  const result = await applyFixture(s, {
    hooks: { checkpoint: (name) => {
      if (name === "after-replacement") throw new Error("replacement failure");
      if (name === "before-rollback-verification") throw new Error("verification unavailable");
    } },
  });
  assert.equal(result.status, "critical");
  assert.equal(result.rollback.attempted, true);
  assert.equal(result.rollback.verified, false);
  assert.ok(result.retainedArtifacts.length > 0);
});

test("the explicit update apply command accepts no bypass arguments", async () => {
  await assert.rejects(runUpdateApply(["--force"], () => {}), /no options/);
  await assert.rejects(runUpdateApply(["--skip-validation"], () => {}), /no options/);
});
