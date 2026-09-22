import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakes } from "../src/data/lakes.js";
import { getLakeFishingSelectionDetails } from "../src/services/lakeService.js";
import { semanticFingerprint } from "./evaluateLakeUpdates.mjs";
import { createRepositoryLakeUpdatePreflight } from "./preflightLakeUpdates.mjs";
import { updateProposalHash } from "./publishLakeUpdate.mjs";

const proposalUrl = new URL("../data/updates/bolmen-baseline-audit-1.json", import.meta.url);
const reviewUrl = new URL("../data/update-reviews/bolmen-baseline-audit-1.json", import.meta.url);
const publicationUrl = new URL("../data/published-updates/bolmen-baseline-audit-1.json", import.meta.url);
const productionUrls = [
  new URL("../src/data/lakes.js", import.meta.url),
  new URL("../src/data/lakeDepthMapResearch.js", import.meta.url),
  new URL("../src/data/lakePoints.js", import.meta.url),
];
const expectedPaths = [
  "fishing.permit",
  "fishing.rules",
  "fishing.protectedAreas",
  "details.access.familyCoverage",
  "details.species.knownSpecies",
];
const expectedSpecies = [
  "abborre",
  "benlöja",
  "bergsimpa",
  "björkna",
  "braxen",
  "gers",
  "gädda",
  "gös",
  "lake",
  "mört",
  "sik",
  "siklöja",
  "sutare",
  "ål",
  "öring",
];

test("the Bolmen baseline proposal is exact, scoped and matcher-safe", async () => {
  const proposal = JSON.parse(await readFile(proposalUrl, "utf8"));
  const review = JSON.parse(await readFile(reviewUrl, "utf8"));
  const publication = JSON.parse(await readFile(publicationUrl, "utf8"));
  const beforeBytes = await Promise.all(productionUrls.map((url) => readFile(url)));

  assert.equal(
    proposal.targetLakeFingerprint,
    "e578138e9e8e53bb3dc710b7af3ed72a56439543bc467588f82444a1c7bce357",
  );
  assert.notEqual(proposal.targetLakeFingerprint, semanticFingerprint(lakes.bolmen));
  assert.equal(
    updateProposalHash(proposal),
    "af44557e6fc987bcdc3ecc8eb628ff177c4b3e52920cda1fb57e828ddcff24b6",
  );
  assert.equal(review.proposalHash, updateProposalHash(proposal));
  assert.deepEqual(publication, { proposal, review, schemaVersion: 1 });
  assert.deepEqual(proposal.changes.map(({ path }) => path), expectedPaths);
  assert.deepEqual(proposal.changes.at(-1).proposed.value, expectedSpecies);
  assert.ok(proposal.changes.every(({ path }) => ![
    "details.species.sizeLimits",
    "details.species.releaseRequirements",
    "details.species.releaseRestrictions",
    "details.species.bagLimits",
  ].includes(path)));

  const readPath = (root, path) => path.split(".").reduce((value, key) => value[key], root);
  for (const change of proposal.changes) {
    assert.deepEqual(readPath(lakes.bolmen, change.path), change.proposed);
  }
  assert.deepEqual(lakes.bolmen.details.species.knownSpecies.value, expectedSpecies);
  assert.equal(
    semanticFingerprint(lakes.bolmen.details.species.sizeLimits),
    "f606d3eedd84139c4ccb456bd9f9e89b68f41b3855c6da82430319d1aee09e4e",
  );
  assert.equal(
    semanticFingerprint(lakes.bolmen.details.species.releaseRequirements),
    "b92efaf6996bcddc89d9a6fa50733b335cfe5f99991f392c1eefddb13c73804d",
  );
  assert.equal(
    semanticFingerprint(lakes.bolmen.details.species.releaseRestrictions),
    "d549e57745a5fa987a7e31c023e7840f810da72cb8df3bc9e38f595241dd5f81",
  );
  assert.equal(
    semanticFingerprint(lakes.bolmen.details.species.bagLimits),
    "db145d8d6895dc22f8f1c7689ea919fed34b321f5264e43dd47c0332e28d7b8e",
  );
  assert.equal(
    semanticFingerprint(lakeDepthMapResearch.bolmen),
    "c4a6705facb8ffaff8ac5f1aa0044e43898f47c2864d48950b8e5c50118807e0",
  );
  assert.equal(
    semanticFingerprint(lakePointsByLakeId.bolmen),
    "627652e2b31a1b9a20053995dd86bbc6a81bd534b77e5e87ff88a5926b523d9d",
  );

  const preflight = await createRepositoryLakeUpdatePreflight();
  assert.deepEqual(preflight.pendingUpdates, []);
  assert.equal(preflight.alreadyApplied.length, 18);
  assert.ok(preflight.alreadyApplied.includes("bolmen-baseline-audit-1"));
  assert.deepEqual(preflight.filesToChange, []);

  assert.deepEqual(
    getLakeFishingSelectionDetails(lakes.bolmen, {
      method: ["Spinn", "Mete", "Flugfiske", "Trolling", "Pimpelfiske"],
    }).categories.method,
    [
      { choice: "Spinn", status: "allowed", missing: [] },
      { choice: "Mete", status: "allowed", missing: [] },
      { choice: "Flugfiske", status: "allowed", missing: [] },
      { choice: "Trolling", status: "allowed", missing: [] },
      { choice: "Pimpelfiske", status: "allowed", missing: [] },
    ],
  );

  const afterBytes = await Promise.all(productionUrls.map((url) => readFile(url)));
  assert.deepEqual(afterBytes, beforeBytes);
});
