import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakes } from "../src/data/lakes.js";
import {
  evaluateLakeUpdateProposal,
  run,
  semanticFingerprint,
  validateLakeUpdateProposal,
} from "./evaluateLakeUpdates.mjs";
import { canonicalJson } from "./publishCandidateLake.mjs";

const targetId = "mogolen-hedenstorp";
const otherId = Object.keys(lakes).find((id) => id !== targetId);

function production() {
  const result = {
    lakes: {
      [otherId]: structuredClone(lakes[otherId]),
      [targetId]: structuredClone(lakes[targetId]),
    },
    depth: {
      [otherId]: structuredClone(lakeDepthMapResearch[otherId]),
      [targetId]: structuredClone(lakeDepthMapResearch[targetId]),
    },
  };
  delete result.lakes[targetId].details.methods.spin;
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

function proposal(input = production()) {
  return {
    schemaVersion: 1,
    proposalId: "mogolen-hedenstorp-spin-test",
    targetLakeId: targetId,
    targetLakeFingerprint: semanticFingerprint(input.lakes[targetId]),
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

function evaluate(input, update = proposal(input)) {
  return evaluateLakeUpdateProposal({
    proposal: update,
    productionLakes: input.lakes,
    productionDepthMapResearch: input.depth,
    lakePointsByLakeId: {},
  });
}

test("an absent path can be set without mutating production or unrelated data", () => {
  const input = production();
  const before = structuredClone(input);
  const result = evaluate(input);

  assert.equal(result.eligible, true, JSON.stringify(result.blockers));
  assert.deepEqual(result.changes, [{
    path: "details.methods.spin",
    before: { state: "absent" },
    after: spinFact(),
  }]);
  assert.deepEqual(result.proposedDataset.lakes[targetId].details.methods.spin, spinFact());
  assert.equal(result.summary.changedTargetPathCount, 1);
  assert.equal(result.summary.otherTargetFieldsChanged, 0);
  assert.equal(result.summary.otherLakesChanged, 0);
  assert.equal(result.summary.productionModified, false);
  assert.equal(
    canonicalJson(result.proposedDataset.lakes[otherId]),
    canonicalJson(input.lakes[otherId]),
  );
  assert.deepEqual(result.proposedDataset.lakeDepthMapResearch, input.depth);
  assert.deepEqual(input, before);
});

test("an exact current value can be replaced", () => {
  const input = production();
  const update = proposal(input);
  const current = structuredClone(input.lakes[targetId].details.methods.bait);
  const proposed = { ...structuredClone(current), note: "Explicitly corrected note." };
  update.changes[0] = {
    ...update.changes[0],
    path: "details.methods.bait",
    expected: { mode: "exact", value: current },
    proposed,
  };
  const result = evaluate(input, update);

  assert.equal(result.eligible, true);
  assert.deepEqual(result.changes[0].before, { state: "exact", value: current });
  assert.deepEqual(result.proposedDataset.lakes[targetId].details.methods.bait, proposed);
});

test("the complete proposed production dataset must remain valid", () => {
  const input = production();
  const update = proposal(input);
  update.changes[0].proposed.sources = [];
  const result = evaluate(input, update);

  assert.equal(result.eligible, false);
  assert.ok(result.validationErrors.some((error) =>
    error.includes("verifierad uppgift saknar källa")));
});

test("a stale target fingerprint is blocked", () => {
  const input = production();
  const update = proposal(input);
  update.targetLakeFingerprint = "0".repeat(64);
  const result = evaluate(input, update);

  assert.equal(result.eligible, false);
  assert.deepEqual(result.blockers.map(({ code }) => code), ["stale-target-fingerprint"]);
});

test("expected absent is blocked when the field exists", () => {
  const input = production();
  const update = proposal(input);
  update.changes[0].path = "details.methods.bait";
  const result = evaluate(input, update);

  assert.equal(result.eligible, false);
  assert.deepEqual(result.blockers.map(({ code }) => code), ["expected-absent-mismatch"]);
});

test("an exact expectation mismatch is blocked", () => {
  const input = production();
  const update = proposal(input);
  update.changes[0].path = "details.methods.bait";
  update.changes[0].expected = { mode: "exact", value: spinFact() };
  const result = evaluate(input, update);

  assert.equal(result.eligible, false);
  assert.deepEqual(result.blockers.map(({ code }) => code), ["expected-value-mismatch"]);
});

test("an unknown target lake is blocked", () => {
  const input = production();
  const update = proposal(input);
  update.targetLakeId = "missing-lake";
  const result = evaluate(input, update);

  assert.equal(result.eligible, false);
  assert.deepEqual(result.blockers.map(({ code }) => code), ["unknown-target-lake"]);
});

test("duplicate and ancestor-descendant update paths are blocked", () => {
  const input = production();
  const duplicate = proposal(input);
  duplicate.changes.push(structuredClone(duplicate.changes[0]));
  assert.ok(validateLakeUpdateProposal(duplicate).some(
    ({ code }) => code === "conflicting-update-path",
  ));

  const overlapping = proposal(input);
  overlapping.changes.push({
    ...structuredClone(overlapping.changes[0]),
    path: "details.methods.spin.value",
  });
  assert.ok(validateLakeUpdateProposal(overlapping).some(
    ({ code }) => code === "conflicting-update-path",
  ));
});

test("malformed or unsafe update paths and missing parents are blocked", () => {
  const input = production();
  for (const path of ["details..spin", "details.__proto__.spin", "details.methods[0]"]) {
    const update = proposal(input);
    update.changes[0].path = path;
    assert.ok(validateLakeUpdateProposal(update).some(
      ({ code }) => code === "malformed-update-path",
    ));
  }

  const missingParent = proposal(input);
  missingParent.changes[0].path = "details.notCreated.spin";
  const result = evaluate(input, missingParent);
  assert.deepEqual(result.blockers.map(({ code }) => code), ["missing-update-parent"]);
});

test("real raw evaluator separates applied history from targeted QA proposals", async () => {
  const paths = [
    new URL("../src/data/lakes.js", import.meta.url),
    new URL("../src/data/lakeDepthMapResearch.js", import.meta.url),
  ];
  const before = await Promise.all(paths.map((path) => readFile(path)));
  const suite = await run([], () => {});
  const after = await Promise.all(paths.map((path) => readFile(path)));

  assert.equal(suite.summary.proposalCount, 12);
  assert.equal(suite.summary.eligibleProposalCount, 3);
  assert.equal(suite.summary.blockedProposalCount, 9);
  assert.equal(suite.summary.productionModified, false);
  assert.deepEqual(
    suite.results.filter(({ eligible }) => eligible).map(({ proposalId }) => proposalId),
    [
      "nommen-method-qa-1",
      "ryssbysjon-method-qa-1",
      "sandhemssjon-species-qa-1",
    ],
  );
  assert.ok(suite.results.filter(({ eligible }) => !eligible).every(({ blockers }) =>
    blockers.some(({ code }) => code === "stale-target-fingerprint")));
  assert.deepEqual(after, before);
});

test("the update evaluator exposes no production write path", async () => {
  const source = await readFile(new URL("./evaluateLakeUpdates.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /writeFile|rename|unlink/);
  await assert.rejects(run(["--apply"], () => {}), /dry run only; no options/);
});
