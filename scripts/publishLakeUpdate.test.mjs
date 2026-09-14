import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakes } from "../src/data/lakes.js";
import { canonicalJson } from "./publishCandidateLake.mjs";
import {
  prepareUpdatePublication,
  publishLakeUpdate,
  updateProposalHash,
  validateUpdateReview,
} from "./publishLakeUpdate.mjs";
import { semanticFingerprint } from "./evaluateLakeUpdates.mjs";

const targetId = "mogolen-hedenstorp";
const otherId = Object.keys(lakes).find((id) => id !== targetId);
const proposalId = "mogolen-hedenstorp-spin-test";

function productionState() {
  const result = {
    productionLakes: {
      [otherId]: structuredClone(lakes[otherId]),
      [targetId]: structuredClone(lakes[targetId]),
    },
    productionDepthMapResearch: {
      [otherId]: structuredClone(lakeDepthMapResearch[otherId]),
      [targetId]: structuredClone(lakeDepthMapResearch[targetId]),
    },
    productionLakePointsByLakeId: {},
  };
  delete result.productionLakes[targetId].details.methods.spin;
  return result;
}

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

function proposal(state) {
  return {
    schemaVersion: 1,
    proposalId,
    targetLakeId: targetId,
    targetLakeFingerprint: semanticFingerprint(state.productionLakes[targetId]),
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
      reason: "Explicit method correction.",
      sources: ["rules-source"],
      verifiedAt: "2026-09-14",
    }],
  };
}

function review(update, overrides = {}) {
  return {
    schemaVersion: 1,
    proposalId: update.proposalId,
    targetLakeId: update.targetLakeId,
    decision: "approved",
    reviewer: "Test reviewer",
    reviewedAt: "2026-09-14",
    hashStrategy: "sha256-canonical-json-v1",
    proposalHash: updateProposalHash(update),
    note: "Reviewed exact update.",
    ...overrides,
  };
}

async function setup(t) {
  const root = await mkdtemp(join(tmpdir(), "pike-update-publish-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const area of ["updates", "update-reviews", "published-updates", "published"]) {
    await mkdir(join(root, "data", area), { recursive: true });
  }
  const state = productionState();
  const update = proposal(state);
  const approval = review(update);
  const path = (area) => join(root, "data", area, `${proposalId}.json`);
  const save = (area, value) => writeFile(path(area), JSON.stringify(value, null, 2));
  await save("updates", update);
  await save("update-reviews", approval);
  return { root, state, update, approval, path, save };
}

test("valid approved review prepares the exact isolated wrapper", () => {
  const state = productionState();
  const update = proposal(state);
  const approval = review(update);
  const wrapper = prepareUpdatePublication({ proposal: update, review: approval, ...state });

  assert.deepEqual(wrapper, { schemaVersion: 1, proposal: update, review: approval });
  assert.deepEqual(validateUpdateReview(approval), []);
});

test("rejected review, hash mismatch and review identity mismatches block", () => {
  const state = productionState();
  const update = proposal(state);
  for (const [approval, pattern] of [
    [review(update, { decision: "rejected" }), /review rejected/],
    [review(update, { proposalHash: "0".repeat(64) }), /changed after approval/],
    [review(update, { proposalId: "another-proposal" }), /proposal identity mismatch/],
    [review(update, { targetLakeId: "another-lake" }), /target lake identity mismatch/],
  ]) {
    assert.throws(
      () => prepareUpdatePublication({ proposal: update, review: approval, ...state }),
      pattern,
    );
  }
});

test("review validation requires strict fields, supported hash and real date", () => {
  const state = productionState();
  const update = proposal(state);
  const valid = review(update);
  for (const key of Object.keys(valid)) {
    if (key === "note") continue;
    const candidate = { ...valid };
    delete candidate[key];
    assert.ok(validateUpdateReview(candidate).length, key);
  }
  for (const candidate of [
    null,
    [],
    { ...valid, reviewedAt: "2023-02-29" },
    { ...valid, reviewer: "" },
    { ...valid, hashStrategy: "other" },
    { ...valid, force: true },
  ]) assert.ok(validateUpdateReview(candidate).length);
});

test("proposal hash is canonical but binds exact semantic content", () => {
  assert.equal(
    updateProposalHash(JSON.parse('{"b":2,"a":1}')),
    updateProposalHash(JSON.parse('{\n "a": 1, "b": 2 }')),
  );
  assert.notEqual(updateProposalHash([1, 2]), updateProposalHash([2, 1]));
  assert.notEqual(updateProposalHash("text"), updateProposalHash("text "));
});

test("stale current production blocks publication preparation", () => {
  const state = productionState();
  const update = proposal(state);
  const approval = review(update);
  state.productionLakes[targetId].name = "Changed after proposal";

  assert.throws(
    () => prepareUpdatePublication({ proposal: update, review: approval, ...state }),
    /stale-target-fingerprint/,
  );
});

test("first publish succeeds and an identical repeat is unchanged without rewriting", async (t) => {
  const s = await setup(t);
  const productionBefore = structuredClone(s.state);
  assert.equal(await publishLakeUpdate(proposalId, s.root, s.state), "published");
  const published = JSON.parse(await readFile(s.path("published-updates"), "utf8"));
  assert.deepEqual(published, { schemaVersion: 1, proposal: s.update, review: s.approval });

  const formatted = JSON.stringify(published, null, 4);
  await writeFile(s.path("published-updates"), formatted);
  assert.equal(await publishLakeUpdate(proposalId, s.root, s.state), "unchanged");
  assert.equal(await readFile(s.path("published-updates"), "utf8"), formatted);
  assert.deepEqual(s.state, productionBefore);
});

test("different and malformed existing destinations are blocked without overwrite", async (t) => {
  const s = await setup(t);
  await writeFile(s.path("published-updates"), JSON.stringify({ schemaVersion: 1 }));
  const different = await readFile(s.path("published-updates"), "utf8");
  await assert.rejects(publishLakeUpdate(proposalId, s.root, s.state), /destination conflict/i);
  assert.equal(await readFile(s.path("published-updates"), "utf8"), different);

  await writeFile(s.path("published-updates"), "{");
  await assert.rejects(publishLakeUpdate(proposalId, s.root, s.state), /destination conflict/i);
  assert.equal(await readFile(s.path("published-updates"), "utf8"), "{");
});

test("proposal changes after approval and malformed proposal block without output", async (t) => {
  const s = await setup(t);
  s.update.reason = "Changed after review.";
  await s.save("updates", s.update);
  await assert.rejects(publishLakeUpdate(proposalId, s.root, s.state), /changed after approval/);
  assert.deepEqual(await readdir(join(s.root, "data", "published-updates")), []);

  delete s.update.reason;
  await s.save("updates", s.update);
  await assert.rejects(publishLakeUpdate(proposalId, s.root, s.state), /proposal .* invalid/i);
  assert.deepEqual(await readdir(join(s.root, "data", "published-updates")), []);
});

test("update publication never writes production or the new-lake publication area", async (t) => {
  const s = await setup(t);
  const newLakeArtifact = join(s.root, "data", "published", "existing.json");
  await writeFile(newLakeArtifact, "new-lake publication sentinel\n");
  const liveBefore = await Promise.all([
    readFile(new URL("../src/data/lakes.js", import.meta.url)),
    readFile(new URL("../src/data/lakeDepthMapResearch.js", import.meta.url)),
  ]);

  await publishLakeUpdate(proposalId, s.root, s.state);

  assert.equal(await readFile(newLakeArtifact, "utf8"), "new-lake publication sentinel\n");
  const liveAfter = await Promise.all([
    readFile(new URL("../src/data/lakes.js", import.meta.url)),
    readFile(new URL("../src/data/lakeDepthMapResearch.js", import.meta.url)),
  ]);
  assert.deepEqual(liveAfter, liveBefore);
  assert.doesNotMatch(canonicalJson(s.state.productionLakes[targetId]), /Reviewed spin rule/);
});
