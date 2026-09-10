import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  applyProductionDataset,
  formatProductionApply,
} from "./applyProductionDataset.mjs";
import { run as runRealApply } from "./applyLakeDataset.mjs";
import {
  createProductionDatasetPreflight,
  productionDatasetFiles,
  productionProposalFingerprint,
  sha256,
} from "./productionDatasetPreflight.mjs";

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
      ramps: [], piers: [], trails: [],
    },
    details: {
      access: {}, methods: {}, species: {}, watercraft: {},
      boat: {}, practical: {}, geography: {}, safety: {},
    },
    ...overrides,
  };
}

function depthResearch() {
  return {
    status: "not-found",
    checkedAt: "2026-09-10",
    provider: "Synthetic registry",
    smhiLakeId: null,
    maps: [],
    note: "No map found.",
  };
}

function moduleSource(exportName, value) {
  return `export const ${exportName} = ${JSON.stringify(value, null, 2)};\n`;
}

async function createFixture(t, { addition = true } = {}) {
  const repositoryRoot = await mkdtemp(join(tmpdir(), "pike-apply-test-"));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));
  await mkdir(join(repositoryRoot, "src", "data"), { recursive: true });

  const productionLakes = { existing: lake("existing") };
  const productionDepthMapResearch = { existing: depthResearch() };
  const newLake = lake("new-lake");
  const proposedLakes = addition
    ? { existing: structuredClone(productionLakes.existing), "new-lake": newLake }
    : structuredClone(productionLakes);
  const proposedDepth = addition
    ? { existing: structuredClone(productionDepthMapResearch.existing), "new-lake": depthResearch() }
    : structuredClone(productionDepthMapResearch);
  const buildResult = {
    proposedDataset: { lakes: proposedLakes, lakeDepthMapResearch: proposedDepth },
    additions: addition ? [{ file: "new-lake.json", id: "new-lake", lake: newLake }] : [],
    blocked: [],
    productionErrors: [],
  };
  const currentFiles = {
    [productionDatasetFiles.lakes]: moduleSource("lakes", productionLakes),
    [productionDatasetFiles.lakeDepthMapResearch]: moduleSource(
      "lakeDepthMapResearch",
      productionDepthMapResearch,
    ),
  };
  for (const [path, content] of Object.entries(currentFiles)) {
    await writeFile(join(repositoryRoot, path), content);
  }
  const preflight = await createProductionDatasetPreflight({
    buildResult,
    productionLakes,
    productionDepthMapResearch,
    lakePointsByLakeId: {},
    currentFiles,
    publishedInputFingerprint: "published-input",
  });
  return {
    repositoryRoot,
    productionLakes,
    productionDepthMapResearch,
    buildResult,
    currentFiles,
    preflight,
  };
}

function refreshPreflight(preflight) {
  preflight.proposedOutputFingerprints = Object.fromEntries(
    Object.entries(preflight.serializedFiles).map(([path, content]) => [path, sha256(content)]),
  );
  preflight.filesToChange = Object.keys(preflight.serializedFiles)
    .filter((path) => preflight.productionFingerprints[path] !== preflight.proposedOutputFingerprints[path])
    .sort();
  preflight.proposalFingerprint = productionProposalFingerprint({
    productionFingerprints: preflight.productionFingerprints,
    proposedOutputFingerprints: preflight.proposedOutputFingerprints,
    additionIds: preflight.additions,
    publishedInputFingerprint: preflight.publishedInputFingerprint,
  });
  preflight.applyContract.replacementOrder = [...preflight.filesToChange];
  return preflight;
}

async function apply(input, options = {}) {
  return applyProductionDataset({
    preflight: input.preflight,
    repositoryRoot: input.repositoryRoot,
    lakePointsByLakeId: {},
    recomputePreflight: options.recomputePreflight ?? (() => structuredClone(input.preflight)),
    hooks: options.hooks,
  });
}

async function productionBytes(input) {
  return Object.fromEntries(await Promise.all(Object.values(productionDatasetFiles).map(async (path) => [
    path,
    await readFile(join(input.repositoryRoot, path), "utf8"),
  ])));
}

async function dataArtifacts(input) {
  return (await readdir(join(input.repositoryRoot, "src", "data")))
    .filter((name) => name.includes(".pike-"))
    .sort();
}

async function importModule(content) {
  return import(`data:text/javascript;base64,${Buffer.from(content).toString("base64")}#${sha256(content)}`);
}

test("an eligible zero-change proposal is a write-free no-op", async (t) => {
  const input = await createFixture(t, { addition: false });
  const before = await productionBytes(input);
  const result = await apply(input);

  assert.equal(result.status, "noop");
  assert.equal(result.productionModified, false);
  assert.deepEqual(await productionBytes(input), before);
  assert.deepEqual(await dataArtifacts(input), []);
  assert.match(formatProductionApply(result), /^APPLY NO-OP/);
});

test("a valid one-file fixture replacement succeeds", async (t) => {
  const input = await createFixture(t, { addition: false });
  input.preflight.serializedFiles[productionDatasetFiles.lakes] += "// deterministic comment\n";
  refreshPreflight(input.preflight);
  const result = await apply(input);

  assert.equal(result.status, "success");
  assert.deepEqual(result.filesChanged, [productionDatasetFiles.lakes]);
  assert.equal(
    (await productionBytes(input))[productionDatasetFiles.lakes],
    input.preflight.serializedFiles[productionDatasetFiles.lakes],
  );
});

test("a valid multi-file new-lake apply succeeds with exact final bytes", async (t) => {
  const input = await createFixture(t);
  const result = await apply(input);
  const final = await productionBytes(input);

  assert.equal(result.status, "success");
  assert.deepEqual(result.filesChanged, input.preflight.filesToChange);
  assert.deepEqual(final, input.preflight.serializedFiles);
  assert.deepEqual(await dataArtifacts(input), []);
  assert.match(formatProductionApply(result), /^APPLY SUCCESS/);
});

test("stale production is blocked before backups or writes", async (t) => {
  const input = await createFixture(t);
  await writeFile(
    join(input.repositoryRoot, productionDatasetFiles.lakes),
    `${input.currentFiles[productionDatasetFiles.lakes]}// external change\n`,
  );
  const before = await productionBytes(input);
  const result = await apply(input);

  assert.equal(result.status, "blocked");
  assert.equal(result.error.code, "stale-production-fingerprint");
  assert.deepEqual(await productionBytes(input), before);
  assert.deepEqual(await dataArtifacts(input), []);
});

test("changed published input or serialized proposal integrity is blocked", async (t) => {
  const published = await createFixture(t);
  const recomputed = structuredClone(published.preflight);
  recomputed.publishedInputFingerprint = "changed-published-input";
  refreshPreflight(recomputed);
  const publishedResult = await apply(published, { recomputePreflight: () => recomputed });
  assert.equal(publishedResult.error.code, "proposal-integrity-mismatch");

  const proposal = await createFixture(t);
  proposal.preflight.serializedFiles[productionDatasetFiles.lakes] += "// tampered\n";
  const proposalResult = await apply(proposal);
  assert.equal(proposalResult.error.code, "proposal-integrity-mismatch");
  assert.deepEqual(await dataArtifacts(proposal), []);
});

test("an ineligible preflight is blocked", async (t) => {
  const input = await createFixture(t);
  input.preflight.eligible = false;
  const result = await apply(input);

  assert.equal(result.status, "blocked");
  assert.equal(result.error.code, "ineligible-preflight");
});

test("backup failure leaves all originals untouched", async (t) => {
  const input = await createFixture(t);
  const before = await productionBytes(input);
  const result = await apply(input, { hooks: {
    checkpoint(name) {
      if (name === "before-backup-write") throw new Error("injected backup failure");
    },
  } });

  assert.equal(result.status, "failed");
  assert.deepEqual(await productionBytes(input), before);
  assert.deepEqual(await dataArtifacts(input), []);
});

test("staged-output verification failure leaves originals untouched", async (t) => {
  const input = await createFixture(t);
  const before = await productionBytes(input);
  let corrupted = false;
  const result = await apply(input, { hooks: {
    async checkpoint(name, entry) {
      if (name === "after-stage-write" && !corrupted) {
        corrupted = true;
        await writeFile(entry.staging, "corrupt staged output");
      }
    },
  } });

  assert.equal(result.error.code, "staged-output-fingerprint-mismatch");
  assert.deepEqual(await productionBytes(input), before);
  assert.deepEqual(await dataArtifacts(input), []);
});

test("failure before the first replacement leaves originals untouched", async (t) => {
  const input = await createFixture(t);
  const before = await productionBytes(input);
  const result = await apply(input, { hooks: {
    checkpoint(name) {
      if (name === "before-first-replacement") throw new Error("injected pre-replace failure");
    },
  } });

  assert.equal(result.status, "failed");
  assert.deepEqual(await productionBytes(input), before);
  assert.deepEqual(await dataArtifacts(input), []);
});

test("failure after the first replacement rolls back every original", async (t) => {
  const input = await createFixture(t);
  const before = await productionBytes(input);
  let failed = false;
  const result = await apply(input, { hooks: {
    checkpoint(name) {
      if (name === "after-replacement" && !failed) {
        failed = true;
        throw new Error("injected post-replace failure");
      }
    },
  } });

  assert.equal(result.status, "failed-rolled-back");
  assert.equal(result.rollback.verified, true);
  assert.deepEqual(await productionBytes(input), before);
  assert.deepEqual(await dataArtifacts(input), []);
});

test("failure during the later replacement restores every original", async (t) => {
  const input = await createFixture(t);
  const before = await productionBytes(input);
  const laterPath = input.preflight.filesToChange[1];
  const result = await apply(input, { hooks: {
    checkpoint(name, entry) {
      if (name === "before-replacement" && entry.path === laterPath) {
        throw new Error("injected later replacement failure");
      }
    },
  } });

  assert.equal(result.status, "failed-rolled-back");
  assert.deepEqual(await productionBytes(input), before);
});

test("final production validation failure restores every original", async (t) => {
  const input = await createFixture(t);
  const before = await productionBytes(input);
  const result = await apply(input, { hooks: {
    checkpoint(name) {
      if (name === "before-final-validation") throw new Error("injected final validation failure");
    },
  } });

  assert.equal(result.status, "failed-rolled-back");
  assert.deepEqual(await productionBytes(input), before);
});

test("successful apply preserves existing lakes and adds only approved IDs", async (t) => {
  const input = await createFixture(t);
  await apply(input);
  const final = await productionBytes(input);
  const lakeModule = await importModule(final[productionDatasetFiles.lakes]);
  const depthModule = await importModule(final[productionDatasetFiles.lakeDepthMapResearch]);

  assert.deepEqual(lakeModule.lakes.existing, input.productionLakes.existing);
  assert.deepEqual(depthModule.lakeDepthMapResearch.existing, input.productionDepthMapResearch.existing);
  assert.deepEqual(Object.keys(lakeModule.lakes).sort(), ["existing", "new-lake"]);
  assert.deepEqual(Object.keys(depthModule.lakeDepthMapResearch).sort(), ["existing", "new-lake"]);
});

test("existing-lake removal and modification proposals never reach writes", async (t) => {
  for (const change of ["remove", "modify"]) {
    const input = await createFixture(t);
    if (change === "remove") delete input.buildResult.proposedDataset.lakes.existing;
    else input.buildResult.proposedDataset.lakes.existing.name = "Changed";
    input.preflight = await createProductionDatasetPreflight({
      buildResult: input.buildResult,
      productionLakes: input.productionLakes,
      productionDepthMapResearch: input.productionDepthMapResearch,
      lakePointsByLakeId: {},
      currentFiles: input.currentFiles,
      publishedInputFingerprint: "published-input",
    });
    const before = await productionBytes(input);
    const result = await apply(input);
    assert.equal(result.status, "blocked", change);
    assert.deepEqual(await productionBytes(input), before, change);
  }
});

test("rollback verification failure is critical and retains recovery artifacts", async (t) => {
  const input = await createFixture(t);
  let failed = false;
  let corrupted = false;
  const result = await apply(input, { hooks: {
    async checkpoint(name, entry) {
      if (name === "after-replacement" && !failed) {
        failed = true;
        throw new Error("start rollback");
      }
      if (name === "after-rollback-restore" && !corrupted) {
        corrupted = true;
        await writeFile(entry.destination, "corrupt restoration");
      }
    },
  } });

  assert.equal(result.status, "critical");
  assert.equal(result.productionModified, null);
  assert.equal(result.rollback.verified, false);
  assert.ok(result.rollback.errors.some((error) => error.includes("restored fingerprint mismatch")));
  assert.ok(result.retainedArtifacts.some((path) => path.endsWith(".backup")));
  assert.match(formatProductionApply(result), /^CRITICAL — ROLLBACK VERIFICATION FAILED/);
});

test("identical inputs produce deterministic successful results", async (t) => {
  const first = await createFixture(t);
  const second = await createFixture(t);
  const firstResult = await apply(first);
  const secondResult = await apply(second);

  assert.deepEqual(firstResult, secondResult);
});

test("real repository apply is a zero-change no-op with no artifacts", async () => {
  const paths = Object.values(productionDatasetFiles).map(
    (path) => new URL(`../${path}`, import.meta.url),
  );
  const dataDirectory = new URL("../src/data/", import.meta.url);
  const before = await Promise.all(paths.map((path) => readFile(path)));
  const artifactsBefore = (await readdir(dataDirectory)).filter((name) => name.includes(".pike-")).sort();
  const result = await runRealApply([], () => {});
  const after = await Promise.all(paths.map((path) => readFile(path)));
  const artifactsAfter = (await readdir(dataDirectory)).filter((name) => name.includes(".pike-")).sort();

  assert.equal(result.status, "noop");
  assert.deepEqual(after, before);
  assert.deepEqual(artifactsAfter, artifactsBefore);
});

test("the explicit apply command accepts no bypass or mode arguments", async () => {
  for (const argument of ["--force", "--skip-validation", "--no-backup", "--allow-existing"]) {
    await assert.rejects(runRealApply([argument], () => {}), /explicit safe apply; no options/);
  }
});
