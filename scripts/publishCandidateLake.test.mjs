import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { candidateHash, canonicalJson, preparePublication, publishCandidate, validateReview } from "./publishCandidateLake.mjs";

async function setup(t) {
  const root = await mkdtemp(join(tmpdir(), "pike-publish-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const area of ["candidates", "reviews", "published"]) await mkdir(join(root, "data", area), { recursive: true });
  const candidate = JSON.parse(await readFile(new URL("./fixtures/candidate-lake.json", import.meta.url), "utf8"));
  candidate.sources = [{ id: "source", type: "other", title: "Synthetic source", url: "https://example.org", checkedAt: "2024-02-29" }];
  candidate.details.push({ section: "practical", key: "access", valueType: "text", value: "Synthetic advice", status: "verified", ruleType: "recommendation", sources: ["source"], verifiedAt: "2024-02-29" });
  const review = { schemaVersion: 1, candidateId: candidate.id, decision: "approved", reviewer: "Test reviewer", reviewedAt: "2024-02-29", hashStrategy: "sha256-canonical-json-v1", candidateHash: candidateHash(candidate) };
  const path = (area) => join(root, "data", area, `${candidate.id}.json`);
  const save = (area, value) => writeFile(path(area), JSON.stringify(value, null, 2));
  await save("candidates", candidate);
  await save("reviews", review);
  return { root, candidate, review, path, save };
}

test("first publish succeeds, preserves sources/unknown/advice and repeats without writing", async (t) => {
  const s = await setup(t);
  const before = await readFile(s.path("candidates"), "utf8");
  assert.equal(await publishCandidate(s.candidate.id, s.root), "published");
  const output = await readFile(s.path("published"), "utf8");
  assert.deepEqual(JSON.parse(output), { schemaVersion: 1, candidate: s.candidate, review: s.review });
  assert.equal(await readFile(s.path("candidates"), "utf8"), before);
  // Different whitespace in already-published output must remain untouched.
  const formatted = JSON.stringify(JSON.parse(output), null, 4);
  await writeFile(s.path("published"), formatted);
  assert.equal(await publishCandidate(s.candidate.id, s.root), "unchanged");
  assert.equal(await readFile(s.path("published"), "utf8"), formatted);
});

for (const [name, mutate, pattern] of [
  ["missing review", async (s) => rm(s.path("reviews")), /Review missing/],
  ["rejected review", async (s) => s.save("reviews", { ...s.review, decision: "rejected" }), /Review rejected/],
  ["malformed review", async (s) => s.save("reviews", { ...s.review, reviewer: "" }), /Review malformed/],
  ["broken review JSON", async (s) => writeFile(s.path("reviews"), "{"), /invalid.*JSON/],
  ["changed candidate", async (s) => s.save("candidates", { ...s.candidate, name: "Changed" }), /changed after approval/],
  ["invalid candidate despite matching hash", async (s) => {
    delete s.candidate.name;
    await s.save("candidates", s.candidate);
    await s.save("reviews", { ...s.review, candidateHash: candidateHash(s.candidate) });
  }, /Candidate .* invalid/],
  ["wrong review identity", async (s) => s.save("reviews", { ...s.review, candidateId: "another-lake" }), /identity mismatch/],
  ["wrong filename identity", async (s) => s.save("candidates", { ...s.candidate, id: "another-lake" }), /identity does not match/],
]) {
  test(`${name} blocks without output`, async (t) => {
    const s = await setup(t);
    await mutate(s);
    await assert.rejects(publishCandidate(s.candidate.id, s.root), pattern);
    assert.deepEqual(await readdir(join(s.root, "data", "published")), []);
  });
}

test("different existing content and damaged destinations are never overwritten", async (t) => {
  const s = await setup(t);
  await publishCandidate(s.candidate.id, s.root);
  const original = await readFile(s.path("published"), "utf8");
  s.candidate.name = "New reviewed name";
  await s.save("candidates", s.candidate);
  await s.save("reviews", { ...s.review, candidateHash: candidateHash(s.candidate) });
  await assert.rejects(publishCandidate(s.candidate.id, s.root), /Destination conflict/);
  assert.equal(await readFile(s.path("published"), "utf8"), original);
  await writeFile(s.path("published"), "{");
  await assert.rejects(publishCandidate(s.candidate.id, s.root), /Destination conflict/);
  assert.equal(await readFile(s.path("published"), "utf8"), "{");
});

test("hash ignores formatting/key order, but preserves arrays and exact string values", () => {
  assert.equal(candidateHash(JSON.parse('{"b":2,"a":1}')), candidateHash(JSON.parse('{\n "a": 1, "b": 2 }')));
  assert.equal(candidateHash({ nested: { b: 2, a: 1 } }), candidateHash({ nested: { a: 1, b: 2 } }));
  assert.notEqual(candidateHash([1, 2]), candidateHash([2, 1]));
  assert.notEqual(candidateHash("text"), candidateHash("text "));
  assert.notEqual(candidateHash({ a: null }), candidateHash({}));
  assert.equal(canonicalJson(JSON.parse('{"__proto__":{"a":1}}')), '{"__proto__":{"a":1}}');
  assert.equal(candidateHash({ app: { type: "sjö", distance: 12 } }), candidateHash({ app: { distance: 12, type: "sjö" } }));
});

test("published app integration is preserved and any later change invalidates approval", async (t) => {
  const repositoryRoot = await mkdtemp(join(tmpdir(), "pike-publish-app-test-"));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));
  for (const area of ["candidates", "reviews", "published"]) {
    await mkdir(join(repositoryRoot, "data", area), { recursive: true });
  }
  const candidate = JSON.parse(await readFile(new URL("./fixtures/candidate-app.json", import.meta.url), "utf8"));
  const review = {
    schemaVersion: 1,
    candidateId: candidate.id,
    decision: "approved",
    reviewer: "Test reviewer",
    reviewedAt: "2026-09-10",
    hashStrategy: "sha256-canonical-json-v1",
    candidateHash: candidateHash(candidate),
  };
  const path = (area) => join(repositoryRoot, "data", area, `${candidate.id}.json`);
  await writeFile(path("candidates"), JSON.stringify(candidate));
  await writeFile(path("reviews"), JSON.stringify(review));

  assert.equal(await publishCandidate(candidate.id, repositoryRoot), "published");
  const published = JSON.parse(await readFile(path("published"), "utf8"));
  assert.deepEqual(published.candidate.app, candidate.app);

  candidate.app.distance.travelTime = "19 min";
  await writeFile(path("candidates"), JSON.stringify(candidate));
  await assert.rejects(
    publishCandidate(candidate.id, repositoryRoot),
    /changed after approval/,
  );
});

test("all review fields and real date are required, unsupported fields rejected", async (t) => {
  const s = await setup(t);
  for (const key of Object.keys(s.review)) {
    const review = { ...s.review }; delete review[key];
    assert.ok(validateReview(review).length, key);
  }
  for (const review of [null, [], { ...s.review, reviewedAt: "2023-02-29" }, { ...s.review, note: "" }, { ...s.review, force: true }, { ...s.review, decision: "pending" }]) {
    assert.ok(validateReview(review).length);
  }
  assert.throws(() => preparePublication(s.candidate, undefined), /Review missing/);
});

test("approval checked again even on an identical repeat, snapshot does not mutate inputs", async (t) => {
  const s = await setup(t);
  const output = preparePublication(s.candidate, s.review);
  output.candidate.name = "Output changed";
  assert.notEqual(output.candidate.name, s.candidate.name);
  await publishCandidate(s.candidate.id, s.root);
  await s.save("reviews", { ...s.review, decision: "rejected" });
  await assert.rejects(publishCandidate(s.candidate.id, s.root), /Review rejected/);
});

test("path traversal and CLI output overrides blocked", async (t) => {
  const s = await setup(t);
  await assert.rejects(publishCandidate("../../src/data/lakes", s.root), /slug/);
  const command = fileURLToPath(new URL("./publishCandidateLake.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [command, "publish", s.candidate.id, "--force"], { encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage/);
});

test("destination symlink cannot redirect writes", { skip: process.platform === "win32" }, async (t) => {
  const s = await setup(t);
  const target = join(s.root, "untouched.json");
  await writeFile(target, "sentinel");
  await symlink(target, s.path("published"));
  await assert.rejects(publishCandidate(s.candidate.id, s.root), /Destination conflict/);
  assert.equal(await readFile(target, "utf8"), "sentinel");
});
