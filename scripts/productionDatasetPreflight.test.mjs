import assert from "node:assert/strict";
import { copyFile, mkdtemp, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import test from "node:test";
import { buildLakeDatasetDryRun } from "./buildLakeDataset.mjs";
import { candidateHash } from "./publishCandidateLake.mjs";
import {
  createProductionDatasetPreflight,
  formatProductionDatasetPreflight,
  productionDatasetFiles,
  sha256,
  verifyPreflightProductionState,
} from "./productionDatasetPreflight.mjs";
import { run as runRealPreflight } from "./preflightLakeDataset.mjs";

function lake(id, overrides = {}) {
  return {
    id,
    name: `Lake ${id}`,
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14, 57],
    coordinateSource: "https://example.org/coordinates",
    distance: { kilometers: 1, travelTime: "1 min" },
    verification: { status: "unverified", updatedAt: null, sources: [] },
    fishing: {
      permit: { status: "unknown", label: "Unknown" },
      rules: { status: "unknown", label: "Unknown" },
      protectedAreas: { status: "unknown", label: "Unknown" },
    },
    practical: {
      parking: { status: "unknown", label: "Unknown", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
    details: {
      access: {}, methods: {}, species: {}, watercraft: {},
      boat: {}, practical: {}, geography: {}, safety: {},
    },
    ...overrides,
  };
}

function depthResearch(overrides = {}) {
  return {
    status: "not-found",
    checkedAt: "2026-09-10",
    provider: "Synthetic registry",
    smhiLakeId: null,
    maps: [],
    note: "No map found.",
    ...overrides,
  };
}

function publication(id = "new-lake") {
  const candidate = {
    schemaVersion: 1,
    id,
    name: `Lake ${id}`,
    region: "Småland",
    counties: ["Jönköping"],
    sources: [{
      id: "source",
      type: "authority",
      title: "Synthetic source",
      url: "https://example.org/source",
      checkedAt: "2026-09-10",
    }],
    location: {
      coordinates: [14, 57],
      sources: ["source"],
      verifiedAt: "2026-09-10",
    },
    details: [],
    app: {
      type: "sjö",
      coordinateSource: "https://example.org/coordinates",
      distance: { kilometers: 1, travelTime: "1 min" },
      verification: { status: "unverified", updatedAt: null, sources: [] },
      fishing: {
        permit: { status: "unknown", label: "Unknown" },
        rules: { status: "unknown", label: "Unknown" },
        protectedAreas: { status: "unknown", label: "Unknown" },
      },
      practical: {
        parking: { status: "unknown", label: "Unknown", locations: [] },
        ramps: [],
        piers: [],
        trails: [],
      },
      lakeDepthMapResearch: depthResearch(),
    },
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

function fixture(id = "new-lake") {
  const productionLakes = { existing: lake("existing") };
  const productionDepthMapResearch = { existing: depthResearch() };
  const publishedDocuments = id === null ? [] : [{
    file: `${id}.json`,
    content: JSON.stringify(publication(id)),
  }];
  const buildResult = buildLakeDatasetDryRun({
    productionLakes,
    productionDepthMapResearch,
    publishedDocuments,
  });
  const currentFiles = {
    [productionDatasetFiles.lakes]: `export const lakes = ${JSON.stringify(productionLakes, null, 2)};\n`,
    [productionDatasetFiles.lakeDepthMapResearch]: `export const lakeDepthMapResearch = ${JSON.stringify(productionDepthMapResearch, null, 2)};\n`,
  };
  return {
    productionLakes,
    productionDepthMapResearch,
    lakePointsByLakeId: {},
    buildResult,
    currentFiles,
  };
}

async function preflight(input = fixture()) {
  return createProductionDatasetPreflight(input);
}

async function temporaryFiles(t, contents = { "lakes.js": "old lakes", "depth.js": "old depth" }) {
  const directory = await mkdtemp(join(tmpdir(), "pike-preflight-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(contents)) {
    await writeFile(join(directory, name), content);
  }
  return { directory, contents };
}

async function stageFixtureFiles(directory, replacements) {
  const staged = [];
  for (const [name, content] of Object.entries(replacements)) {
    const destination = join(directory, name);
    const next = `${destination}.next`;
    await writeFile(next, content, { flag: "wx" });
    staged.push({ destination, next, backup: `${destination}.backup` });
  }
  return staged;
}

async function simulateFixtureApply(staged, failAfterReplacement = null) {
  for (const entry of staged) await copyFile(entry.destination, entry.backup, 1);
  try {
    for (const entry of staged) {
      await rename(entry.next, entry.destination);
      if (basename(entry.destination) === failAfterReplacement) {
        throw new Error("simulated replacement failure");
      }
    }
  } catch (error) {
    for (const entry of staged) await copyFile(entry.backup, entry.destination);
    throw error;
  } finally {
    for (const entry of staged) {
      await unlink(entry.backup).catch(() => {});
      await unlink(entry.next).catch(() => {});
    }
  }
}

test("a valid approved new-lake proposal is eligible and names both replacement files", async () => {
  const result = await preflight();

  assert.equal(result.eligible, true, JSON.stringify({
    blockers: result.blockers,
    validationErrors: result.validationErrors,
  }));
  assert.deepEqual(result.additions, ["new-lake"]);
  assert.deepEqual(result.filesToChange, [
    productionDatasetFiles.lakeDepthMapResearch,
    productionDatasetFiles.lakes,
  ]);
  assert.equal(result.validationErrors.length, 0);
  assert.equal(result.validationStats.lakeCount, 2);
  assert.match(formatProductionDatasetPreflight(result), /PRODUCTION MODIFIED: NO/);
});

test("altered or removed existing lake and depth records are blocked", async () => {
  const altered = fixture();
  altered.buildResult.proposedDataset.lakes.existing.name = "Changed";
  altered.buildResult.proposedDataset.lakeDepthMapResearch.existing.note = "Changed";
  const alteredResult = await preflight(altered);
  assert.ok(alteredResult.blockers.some(({ code }) => code === "existing-lake-modified"));
  assert.ok(alteredResult.blockers.some(({ code }) => code === "existing-depth-research-modified"));

  const removed = fixture();
  delete removed.buildResult.proposedDataset.lakes.existing;
  delete removed.buildResult.proposedDataset.lakeDepthMapResearch.existing;
  const removedResult = await preflight(removed);
  assert.ok(removedResult.blockers.some(({ code }) => code === "existing-lake-removed"));
  assert.ok(removedResult.blockers.some(({ code }) => code === "existing-depth-research-removed"));
});

test("an existing lake ID collision remains blocked", async () => {
  const input = fixture("existing");
  const result = await preflight(input);

  assert.equal(result.eligible, false);
  assert.ok(result.blockers.some(({ code }) => code === "production-id-conflict"));
  assert.deepEqual(result.additions, []);
});

test("changed production bytes make a previously eligible preflight stale", async () => {
  const input = fixture();
  const result = await preflight(input);
  const changedFiles = { ...input.currentFiles };
  changedFiles[productionDatasetFiles.lakes] += "// changed\n";
  const verification = verifyPreflightProductionState(result, changedFiles);

  assert.equal(verification.eligible, false);
  assert.deepEqual(verification.blockers.map(({ code }) => code), [
    "stale-production-fingerprint",
  ]);
});

test("invalid complete proposed lake data is rejected by the production validator", async () => {
  const input = fixture();
  input.buildResult.proposedDataset.lakes["new-lake"].coordinateSource = "invalid";
  input.buildResult.additions[0].lake.coordinateSource = "invalid";
  const result = await preflight(input);

  assert.equal(result.eligible, false);
  assert.ok(result.validationErrors.some((error) => error.includes("coordinateSource")));
});

test("invalid complete proposed depth research is rejected by the production validator", async () => {
  const input = fixture();
  input.buildResult.proposedDataset.lakeDepthMapResearch["new-lake"].status = "available";
  const result = await preflight(input);

  assert.equal(result.eligible, false);
  assert.ok(result.validationErrors.some((error) => error.includes("SMHI-id")));
});

test("serialization and all fingerprints are byte-deterministic", async () => {
  const input = fixture();
  const first = await preflight(input);
  const second = await preflight(input);

  assert.deepEqual(first, second);
  for (const path of Object.values(productionDatasetFiles)) {
    assert.equal(first.proposedOutputFingerprints[path], sha256(first.serializedFiles[path]));
    assert.ok(first.serializedFiles[path].startsWith(input.currentFiles[path].slice(0, 20)));
  }
});

test("no-addition serialization is exactly the current source bytes", async () => {
  const input = fixture(null);
  const result = await preflight(input);

  assert.equal(result.eligible, true);
  assert.deepEqual(result.filesToChange, []);
  assert.deepEqual(result.serializedFiles, input.currentFiles);
  assert.deepEqual(result.proposedOutputFingerprints, result.productionFingerprints);
});

test("unapproved proposed output entries cannot enter either production file", async () => {
  const input = fixture();
  input.buildResult.proposedDataset.lakes.rogue = lake("rogue");
  input.buildResult.proposedDataset.lakeDepthMapResearch.rogue = depthResearch();
  const result = await preflight(input);

  assert.equal(result.eligible, false);
  assert.ok(result.blockers.some(({ code }) => code === "unapproved-lake-addition"));
  assert.ok(result.blockers.some(({ code }) => code === "unapproved-depth-research-addition"));
  assert.doesNotMatch(result.serializedFiles[productionDatasetFiles.lakes], /rogue/);
});

test("staging fixture outputs does not touch originals before the apply point", async (t) => {
  const { directory, contents } = await temporaryFiles(t);
  await stageFixtureFiles(directory, { "lakes.js": "new lakes", "depth.js": "new depth" });

  for (const [name, content] of Object.entries(contents)) {
    assert.equal(await readFile(join(directory, name), "utf8"), content);
  }
});

test("simulated same-directory multi-file replacement succeeds", async (t) => {
  const { directory } = await temporaryFiles(t);
  const replacements = { "lakes.js": "new lakes", "depth.js": "new depth" };
  const staged = await stageFixtureFiles(directory, replacements);
  await simulateFixtureApply(staged);

  for (const [name, content] of Object.entries(replacements)) {
    assert.equal(await readFile(join(directory, name), "utf8"), content);
  }
});

test("a simulated failure before replacement leaves fixture originals intact", async (t) => {
  const { directory, contents } = await temporaryFiles(t);
  await stageFixtureFiles(directory, { "lakes.js": "new lakes", "depth.js": "new depth" });

  for (const [name, content] of Object.entries(contents)) {
    assert.equal(await readFile(join(directory, name), "utf8"), content);
  }
});

test("a simulated mid-apply failure restores every original fixture file", async (t) => {
  const { directory, contents } = await temporaryFiles(t);
  const staged = await stageFixtureFiles(directory, {
    "lakes.js": "new lakes",
    "depth.js": "new depth",
  });
  await assert.rejects(simulateFixtureApply(staged, "lakes.js"), /simulated/);

  for (const [name, content] of Object.entries(contents)) {
    assert.equal(await readFile(join(directory, name), "utf8"), content);
  }
});

test("real repository preflight leaves production files byte-for-byte unchanged", async () => {
  const paths = Object.values(productionDatasetFiles).map(
    (path) => new URL(`../${path}`, import.meta.url),
  );
  const before = await Promise.all(paths.map((path) => readFile(path)));
  const result = await runRealPreflight([], () => {});
  const after = await Promise.all(paths.map((path) => readFile(path)));

  assert.equal(result.eligible, true);
  assert.deepEqual(result.additions, []);
  assert.deepEqual(result.filesToChange, []);
  assert.deepEqual(after, before);
});

test("the preflight command has no force, apply or write option", async () => {
  const source = await readFile(new URL("./preflightLakeDataset.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /writeFile|rename|unlink/);
  await assert.rejects(runRealPreflight(["--apply"], () => {}), /preflight only; no options/);
  await assert.rejects(runRealPreflight(["--force"], () => {}), /preflight only; no options/);
});
