import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { validateCandidate, validateCandidateDocuments } from "./validateCandidateLakes.mjs";

const minimal = () => JSON.parse(readFileSync(new URL("./fixtures/candidate-lake.json", import.meta.url), "utf8"));
const sourced = () => {
  const candidate = minimal();
  candidate.sources = [{ id: "source", type: "other", title: "Synthetic fixture", url: "https://example.org/rules", checkedAt: "2024-02-29" }];
  Object.assign(candidate.details[0], { value: "allowed", status: "verified", ruleType: "rule", verifiedAt: "2024-02-29", sources: ["source"] });
  return candidate;
};

test("minimal, sourced and recommendation candidates pass without mutation", () => {
  for (const candidate of [minimal(), sourced()]) {
    const before = JSON.stringify(candidate);
    assert.deepEqual(validateCandidate(candidate), []);
    assert.equal(JSON.stringify(candidate), before);
  }
  const candidate = sourced();
  candidate.details[0].ruleType = "recommendation";
  assert.deepEqual(validateCandidate(candidate), []);
  assert.equal(candidate.details[0].ruleType, "recommendation");
});

test("every required root field and wrong containers fail", () => {
  for (const key of ["schemaVersion", "id", "name", "sources", "details"]) {
    const candidate = minimal(); delete candidate[key];
    assert.ok(validateCandidate(candidate).some((e) => e.includes(key)));
  }
  for (const value of [null, [], 1, "lake"]) assert.ok(validateCandidate(value).length);
  for (const key of ["sources", "details"]) {
    const candidate = minimal(); candidate[key] = {};
    assert.ok(validateCandidate(candidate).length);
  }
});

test("unsupported statuses, rule types, types and permission values fail", () => {
  for (const [key, value] of [["status", "allowed"], ["ruleType", "law"], ["valueType", "toString"], ["valueType", ["state"]], ["valueType", { toString: null }], ["value", "supported"], ["value", 1]]) {
    const candidate = sourced(); candidate.details[0][key] = value;
    assert.ok(validateCandidate(candidate).length, key);
  }
});

test("source metadata, references and duplicates are checked", () => {
  for (const key of ["id", "type", "title", "url", "checkedAt"]) {
    const candidate = sourced(); delete candidate.sources[0][key];
    assert.ok(validateCandidate(candidate).length, key);
  }
  for (const value of [[], ["missing"], ["source", "source"], null]) {
    const candidate = sourced(); candidate.details[0].sources = value;
    assert.ok(validateCandidate(candidate).length);
  }
  const candidate = sourced(); candidate.sources.push({ ...candidate.sources[0] });
  assert.ok(validateCandidate(candidate).some((e) => e.includes("duplicate source")));
  candidate.sources = [{ ...candidate.sources[0], url: "javascript:alert(1)" }];
  assert.ok(validateCandidate(candidate).length);
});

test("real calendar dates required independently of wall clock", () => {
  for (const value of [undefined, null, "", "2023-02-29", "2024-02-30", "2024-13-01", "2024-1-1", 20240101]) {
    const candidate = sourced(); candidate.details[0].verifiedAt = value;
    assert.ok(validateCandidate(candidate).length, String(value));
  }
});

test("unknown cannot carry permission or verification, unverified cannot claim verification", () => {
  for (const change of [{ value: "allowed" }, { verifiedAt: "2024-01-01" }, { ruleType: "rule" }]) {
    const candidate = minimal(); Object.assign(candidate.details[0], change);
    assert.ok(validateCandidate(candidate).length);
  }
  const candidate = sourced(); candidate.details[0].status = "unverified";
  assert.ok(validateCandidate(candidate).length);
  candidate.details[0].verifiedAt = null;
  assert.deepEqual(validateCandidate(candidate), []);
});

test("duplicate identities and malformed JSON report filenames", () => {
  const content = JSON.stringify(minimal());
  assert.ok(validateCandidateDocuments([{ file: "a.json", content }, { file: "b.json", content }]).some((e) => e.includes("b.json: id: duplicate")));
  assert.deepEqual(validateCandidateDocuments([{ file: "bad.json", content: "{" }]), ["bad.json: invalid JSON"]);
});

test("same subject/scope duplicate is rejected, different explicit scopes retained", () => {
  const candidate = sourced();
  candidate.details.push({ ...candidate.details[0], value: "prohibited" });
  assert.ok(validateCandidate(candidate).some((e) => e.includes("conflicting")));
  candidate.details[1].conditions = { species: ["Gädda"] };
  assert.deepEqual(validateCandidate(candidate), []);
  candidate.details[0].conditions = { species: ["Gös", "Gädda"], timeFrom: "12:00" };
  candidate.details[1].conditions = { timeFrom: "12:00", species: ["Gädda", "Gös"] };
  assert.ok(validateCandidate(candidate).some((e) => e.includes("conflicting")));
});

test("coordinates, conditions and unexpected fields validated", () => {
  for (const coordinates of [[181, 0], [0, 91], ["14", 57], [14], null]) {
    const candidate = sourced(); candidate.location = { coordinates, sources: ["source"], verifiedAt: "2024-02-29" };
    assert.ok(validateCandidate(candidate).length);
  }
  const candidate = sourced(); candidate.location = { coordinates: [14, 57], sources: ["source"], verifiedAt: "2024-02-29" };
  assert.deepEqual(validateCandidate(candidate), []);
  for (const conditions of [{ timeFrom: "25:00" }, { dateFrom: "02-30" }, { species: [] }, { typo: 1 }, []]) {
    candidate.details[0].conditions = conditions;
    assert.ok(validateCandidate(candidate).length);
  }
});

test("typed factual values and explicit unknown placeholders are validated", () => {
  for (const [valueType, value, invalid] of [["number", 4, "4"], ["boolean", false, 0], ["string-list", ["Gädda"], [""]], ["text", "Källbelagd uppgift", ""]]) {
    const candidate = sourced();
    Object.assign(candidate.details[0], { section: "practical", key: "access", ruleType: null, valueType, value });
    assert.deepEqual(validateCandidate(candidate), []);
    candidate.details[0].value = invalid;
    assert.ok(validateCandidate(candidate).length);
    Object.assign(candidate.details[0], { value: "unknown", status: "unknown", verifiedAt: null });
    assert.deepEqual(validateCandidate(candidate), []);
  }
  const candidate = minimal(); candidate.unexpected = true;
  assert.ok(validateCandidate(candidate).some((e) => e.includes("unsupported field")));
});

test("CLI succeeds on fixture and fails on unreadable input directory", () => {
  const script = fileURLToPath(new URL("./validateCandidateLakes.mjs", import.meta.url));
  const good = spawnSync(process.execPath, [script, fileURLToPath(new URL("./fixtures/", import.meta.url))], { encoding: "utf8" });
  assert.equal(good.status, 0, good.stderr);
  assert.match(good.stdout, /1 candidate/);
  const bad = spawnSync(process.execPath, [script, script], { encoding: "utf8" });
  assert.equal(bad.status, 1);
});
