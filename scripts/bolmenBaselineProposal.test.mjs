import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakes } from "../src/data/lakes.js";
import { getLakeFishingSelectionDetails } from "../src/services/lakeService.js";
import {
  evaluateLakeUpdateProposal,
  semanticFingerprint,
} from "./evaluateLakeUpdates.mjs";

const proposalUrl = new URL("../data/updates/bolmen-baseline-audit-1.json", import.meta.url);
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
  const beforeBytes = await Promise.all(productionUrls.map((url) => readFile(url)));
  const beforeRuleArrays = structuredClone({
    sizeLimits: lakes.bolmen.details.species.sizeLimits,
    releaseRequirements: lakes.bolmen.details.species.releaseRequirements,
    releaseRestrictions: lakes.bolmen.details.species.releaseRestrictions,
    bagLimits: lakes.bolmen.details.species.bagLimits,
  });

  assert.equal(proposal.targetLakeFingerprint, semanticFingerprint(lakes.bolmen));
  assert.deepEqual(proposal.changes.map(({ path }) => path), expectedPaths);
  assert.deepEqual(proposal.changes.at(-1).proposed.value, expectedSpecies);
  assert.ok(proposal.changes.every(({ path }) => ![
    "details.species.sizeLimits",
    "details.species.releaseRequirements",
    "details.species.releaseRestrictions",
    "details.species.bagLimits",
  ].includes(path)));

  const result = evaluateLakeUpdateProposal({
    proposal,
    productionLakes: lakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    lakePointsByLakeId,
  });
  assert.equal(result.eligible, true, JSON.stringify({
    blockers: result.blockers,
    validationErrors: result.validationErrors,
  }));
  assert.equal(result.changes.length, 5);
  assert.deepEqual(result.changes.map(({ path }) => path), expectedPaths);
  assert.equal(result.summary.changedTargetPathCount, 11);
  assert.equal(result.summary.otherTargetFieldsChanged, 0);
  assert.equal(result.summary.otherLakesChanged, 0);
  assert.equal(result.summary.productionModified, false);
  assert.deepEqual(result.proposedDataset.lakeDepthMapResearch, lakeDepthMapResearch);
  assert.deepEqual({
    sizeLimits: result.proposedDataset.lakes.bolmen.details.species.sizeLimits,
    releaseRequirements: result.proposedDataset.lakes.bolmen.details.species.releaseRequirements,
    releaseRestrictions: result.proposedDataset.lakes.bolmen.details.species.releaseRestrictions,
    bagLimits: result.proposedDataset.lakes.bolmen.details.species.bagLimits,
  }, beforeRuleArrays);

  assert.deepEqual(
    getLakeFishingSelectionDetails(result.proposedDataset.lakes.bolmen, {
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
