import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { lakes } from "../src/data/lakes.js";
import { candidateHash } from "./publishCandidateLake.mjs";
import {
  buildLakeDatasetDryRun,
  formatLakeDatasetDryRunReport,
  run,
} from "./buildLakeDataset.mjs";

const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/candidate-app.json", import.meta.url), "utf8"),
);

function appIntegration() {
  return structuredClone(fixture.app);
}

function fact(overrides = {}) {
  return {
    section: "methods",
    key: "spin",
    valueType: "state",
    value: "unknown",
    status: "unknown",
    ruleType: null,
    sources: [],
    verifiedAt: null,
    ...overrides,
  };
}

function publication(id = "new-lake", details = [fact()]) {
  const candidate = {
    schemaVersion: 1,
    id,
    name: `Lake ${id}`,
    region: "Småland",
    counties: ["Jönköping"],
    sources: [{
      id: "authority",
      type: "authority",
      title: "Synthetic authority",
      url: "https://example.org/rules",
      checkedAt: "2026-09-10",
    }],
    location: {
      coordinates: [14, 57],
      sources: ["authority"],
      verifiedAt: "2026-09-10",
    },
    details,
    app: appIntegration(),
  };
  return {
    schemaVersion: 1,
    candidate,
    review: {
      schemaVersion: 1,
      candidateId: id,
      decision: "approved",
      reviewer: "Test reviewer",
      reviewedAt: "2026-09-10",
      hashStrategy: "sha256-canonical-json-v1",
      candidateHash: candidateHash(candidate),
    },
  };
}

function document(input, file = `${input?.candidate?.id ?? "unknown"}.json`) {
  return { file, content: JSON.stringify(input) };
}

function production() {
  return {
    lakes: {
      existing: {
        id: "existing",
        name: "Existing",
        marker: { untouched: true },
      },
    },
    depth: {
      existing: {
        status: "not-found",
        checkedAt: "2026-09-10",
        provider: "Existing registry",
        smhiLakeId: null,
        maps: [],
        note: "Existing research.",
      },
    },
  };
}

function build(documents = [], input = production()) {
  return buildLakeDatasetDryRun({
    productionLakes: input.lakes,
    productionDepthMapResearch: input.depth,
    publishedDocuments: documents,
  });
}

test("no published lakes preserve an independent copy of production", () => {
  const input = production();
  const before = structuredClone(input);
  const result = build([], input);

  assert.deepEqual(result.proposedDataset.lakes, input.lakes);
  assert.deepEqual(result.proposedDataset.lakeDepthMapResearch, input.depth);
  assert.deepEqual(input, before);
  assert.notEqual(result.proposedDataset.lakes, input.lakes);
  assert.deepEqual(result.summary, {
    productionLakeCount: 1,
    publishedLakeCount: 0,
    compatibleAdditionCount: 0,
    alreadyAppliedPublishedLakeCount: 0,
    blockedPublishedLakeCount: 0,
    idConflictCount: 0,
    compatibilityOrTransformationErrorCount: 0,
    proposedLakeCount: 1,
  });
});

test("a compatible reviewed new lake becomes an in-memory addition", () => {
  const input = publication();
  const result = build([document(input)]);
  const lake = result.proposedDataset.lakes["new-lake"];

  assert.equal(result.additions.length, 1);
  assert.equal(result.blocked.length, 0);
  assert.equal(result.summary.proposedLakeCount, 2);
  assert.equal(lake.type, input.candidate.app.type);
  assert.deepEqual(lake.distance, input.candidate.app.distance);
  assert.deepEqual(lake.verification, input.candidate.app.verification);
  assert.deepEqual(lake.fishing, input.candidate.app.fishing);
  assert.deepEqual(lake.practical, input.candidate.app.practical);
  assert.deepEqual(
    result.proposedDataset.lakeDepthMapResearch["new-lake"],
    input.candidate.app.lakeDepthMapResearch,
  );
  assert.equal(Object.hasOwn(lake, "lakeDepthMapResearch"), false);
});

test("an existing production ID is blocked without update or merge", () => {
  const result = build([document(publication("existing"))]);

  assert.equal(result.additions.length, 0);
  assert.equal(result.summary.idConflictCount, 1);
  assert.equal(result.proposedDataset.lakes.existing.name, "Existing");
  assert.ok(result.blocked[0].reasons.some(({ code }) => code === "production-id-conflict"));
});

test("an exactly matching published lake and depth record are already applied", () => {
  const input = publication("already-applied");
  const initial = build([document(input)]).proposedDataset;
  const productionInput = {
    lakes: structuredClone(initial.lakes),
    depth: structuredClone(initial.lakeDepthMapResearch),
  };
  const before = structuredClone(productionInput);
  const result = build([document(input)], productionInput);

  assert.deepEqual(result.additions, []);
  assert.deepEqual(result.blocked, []);
  assert.deepEqual(result.alreadyApplied, [{
    file: "already-applied.json",
    id: "already-applied",
  }]);
  assert.equal(result.summary.alreadyAppliedPublishedLakeCount, 1);
  assert.deepEqual(result.proposedDataset.lakes, productionInput.lakes);
  assert.deepEqual(result.proposedDataset.lakeDepthMapResearch, productionInput.depth);
  assert.deepEqual(productionInput, before);
});

test("an existing ID with changed lake content remains a production conflict", () => {
  const input = publication("changed-lake");
  const initial = build([document(input)]).proposedDataset;
  const productionInput = {
    lakes: structuredClone(initial.lakes),
    depth: structuredClone(initial.lakeDepthMapResearch),
  };
  productionInput.lakes["changed-lake"].name = "Different production content";
  const result = build([document(input)], productionInput);

  assert.deepEqual(result.additions, []);
  assert.deepEqual(result.alreadyApplied, []);
  assert.equal(result.proposedDataset.lakes["changed-lake"].name, "Different production content");
  assert.ok(result.blocked[0].reasons.some(({ code }) => code === "production-id-conflict"));
});

test("an existing ID with changed depth research remains a production conflict", () => {
  const input = publication("changed-depth");
  const initial = build([document(input)]).proposedDataset;
  const productionInput = {
    lakes: structuredClone(initial.lakes),
    depth: structuredClone(initial.lakeDepthMapResearch),
  };
  productionInput.depth["changed-depth"].note = "Different production depth research.";
  const result = build([document(input)], productionInput);

  assert.deepEqual(result.additions, []);
  assert.deepEqual(result.alreadyApplied, []);
  assert.equal(
    result.proposedDataset.lakeDepthMapResearch["changed-depth"].note,
    "Different production depth research.",
  );
  assert.ok(result.blocked[0].reasons.some(({ code }) => code === "production-id-conflict"));
});

test("malformed JSON and malformed published wrappers are blocked", () => {
  const malformedWrapper = publication("bad-wrapper");
  delete malformedWrapper.review;
  const result = build([
    { file: "broken.json", content: "{" },
    document(malformedWrapper),
  ]);

  assert.equal(result.summary.publishedLakeCount, 2);
  assert.equal(result.summary.blockedPublishedLakeCount, 2);
  assert.ok(result.blocked.some((entry) =>
    entry.reasons.some(({ code }) => code === "invalid-json")));
  assert.ok(result.blocked.some((entry) =>
    entry.reasons.some(({ code }) => code === "invalid-publication")));
});

test("rejected and hash-mismatched reviews are blocked by the compatibility contract", () => {
  const rejected = publication("rejected-lake");
  rejected.review.decision = "rejected";
  const changed = publication("changed-lake");
  changed.candidate.app.distance.travelTime = "changed after review";
  const result = build([document(rejected), document(changed)]);

  assert.ok(result.blocked.some((entry) =>
    entry.reasons.some(({ code }) => code === "review-not-approved")));
  assert.ok(result.blocked.some((entry) =>
    entry.reasons.some(({ code }) => code === "review-hash-mismatch")));
  assert.equal(result.additions.length, 0);
});

test("compatibility reasons are surfaced exactly and unsupported scope is not flattened", () => {
  const unsupported = publication("scoped-lake", [fact({
    value: "allowed",
    status: "verified",
    ruleType: "rule",
    sources: ["authority"],
    verifiedAt: "2026-09-10",
    conditions: { species: ["Gädda"] },
  })]);
  const result = build([document(unsupported)]);
  const blocker = result.blocked[0].reasons.find(
    ({ code }) => code === "unsupported-selection-condition",
  );

  assert.deepEqual(blocker, {
    code: "unsupported-selection-condition",
    path: "$.candidate.details[0].conditions",
    message: "current app does not preserve candidate selection scopes",
  });
  assert.equal(result.proposedDataset.lakes["scoped-lake"], undefined);
});

test("a missing explicit candidate.app requirement is blocked exactly", () => {
  const input = publication("missing-field");
  delete input.candidate.app.fishing;
  input.review.candidateHash = candidateHash(input.candidate);
  const result = build([document(input)]);

  assert.deepEqual(
    result.blocked[0].reasons.find(({ code }) => code === "missing-explicit-field"),
    {
      code: "missing-explicit-field",
      path: "$.candidate.app.fishing",
      message: "fishing must be explicitly reviewed for app integration",
    },
  );
});

test("unknown domain semantics and verified source metadata survive unchanged", () => {
  const input = publication("source-lake", [
    fact(),
    fact({
      section: "access",
      key: "permitRequirement",
      valueType: "text",
      value: "required",
      status: "verified",
      ruleType: "rule",
      sources: ["authority"],
      verifiedAt: "2026-09-10",
      note: "Reviewed requirement.",
    }),
  ]);
  const result = build([document(input)]);
  const details = result.proposedDataset.lakes["source-lake"].details;

  assert.equal(details.methods.spin.value, "unknown");
  assert.equal(details.methods.spin.status, "unknown");
  assert.deepEqual(details.access.permitRequirement.sources, [{
    url: "https://example.org/rules",
    type: "authority",
  }]);
  assert.equal(details.access.permitRequirement.verifiedAt, "2026-09-10");
});

test("published and proposed ordering and report output are deterministic", () => {
  const alpha = document(publication("alpha-lake"));
  const zeta = document(publication("zeta-lake"));
  const first = build([zeta, alpha]);
  const second = build([alpha, zeta]);

  assert.deepEqual(first, second);
  assert.deepEqual(first.additions.map(({ id }) => id), ["alpha-lake", "zeta-lake"]);
  assert.deepEqual(Object.keys(first.proposedDataset.lakes), [
    "alpha-lake", "existing", "zeta-lake",
  ]);
  assert.equal(formatLakeDatasetDryRunReport(first), formatLakeDatasetDryRunReport(second));
  assert.match(formatLakeDatasetDryRunReport(first), /Proposed final lake count: 3/);
  assert.match(formatLakeDatasetDryRunReport(first), /Already applied published lakes: 0/);
  assert.match(formatLakeDatasetDryRunReport(first), /Production files modified: NO/);
});

test("duplicate published IDs and filename identity mismatches are deterministic conflicts", () => {
  const input = publication("duplicate-lake");
  const result = build([
    document(input, "zeta.json"),
    document(input, "alpha.json"),
  ]);

  assert.equal(result.additions.length, 0);
  assert.equal(result.summary.idConflictCount, 2);
  assert.deepEqual(result.blocked.map(({ file }) => file), ["alpha.json", "zeta.json"]);
  assert.ok(result.blocked.every((entry) =>
    entry.reasons.some(({ code }) => code === "duplicate-published-id")));
});

test("the command exposes no apply, force, or production-write path", async () => {
  const source = readFileSync(new URL("./buildLakeDataset.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /writeFile|rename|unlink/);
  await assert.rejects(run(["--force"], () => {}), /dry run only; no options/);
});

test("the real-repository dry run leaves both production datasets byte-for-byte unchanged", async () => {
  const lakePath = new URL("../src/data/lakes.js", import.meta.url);
  const depthPath = new URL("../src/data/lakeDepthMapResearch.js", import.meta.url);
  const before = await Promise.all([readFile(lakePath), readFile(depthPath)]);

  const result = await run([], () => {});
  const after = await Promise.all([readFile(lakePath), readFile(depthPath)]);

  assert.deepEqual(result.summary, {
    productionLakeCount: 22,
    publishedLakeCount: 1,
    compatibleAdditionCount: 1,
    alreadyAppliedPublishedLakeCount: 0,
    blockedPublishedLakeCount: 0,
    idConflictCount: 0,
    compatibilityOrTransformationErrorCount: 0,
    proposedLakeCount: 23,
  });
  assert.deepEqual(result.additions.map(({ id }) => id), ["mogolen-hedenstorp"]);
  assert.equal(result.proposedDataset.lakes["mogolen-hedenstorp"].name, "Mogölen");
  assert.equal(Object.hasOwn(lakes, "mogolen-hedenstorp"), false);
  assert.deepEqual(after, before);
});
