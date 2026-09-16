import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fishingChoices } from "../src/data/fishingChoices.js";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakes } from "../src/data/lakes.js";
import { getLakeFishingSelectionDetails } from "../src/services/lakeService.js";
import {
  evaluateLakeUpdateProposal,
  semanticFingerprint,
} from "./evaluateLakeUpdates.mjs";
import { canonicalJson } from "./publishCandidateLake.mjs";

const proposalUrl = new URL("../data/updates/svansjon-method-permits-1.json", import.meta.url);
const productionUrls = [
  new URL("../src/data/lakes.js", import.meta.url),
  new URL("../src/data/lakeDepthMapResearch.js", import.meta.url),
];

test("the Svansjön permit proposal is stale-bound, isolated and behaviorally exact", async () => {
  const proposal = JSON.parse(await readFile(proposalUrl, "utf8"));
  const beforeBytes = await Promise.all(productionUrls.map((url) => readFile(url)));
  const beforeOtherLakes = Object.fromEntries(
    Object.entries(lakes).filter(([id]) => id !== "svansjon"),
  );

  assert.equal(proposal.targetLakeFingerprint, semanticFingerprint(lakes.svansjon));
  assert.deepEqual(proposal.changes.map(({ path }) => path), [
    "details.access.permitMethodSupport",
  ]);
  assert.equal(proposal.changes[0].expected.mode, "absent");
  assert.equal(proposal.changes[0].proposed.conditions, null);

  const result = evaluateLakeUpdateProposal({
    proposal,
    productionLakes: lakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    lakePointsByLakeId,
  });

  assert.equal(result.eligible, true);
  assert.deepEqual(result.blockers, []);
  assert.deepEqual(result.validationErrors, []);
  assert.equal(result.summary.changedTargetPathCount, 1);
  assert.equal(result.summary.otherTargetFieldsChanged, 0);
  assert.equal(result.summary.otherLakesChanged, 0);
  assert.equal(result.summary.productionModified, false);
  assert.equal(Object.keys(result.proposedDataset.lakes).length, 23);
  assert.equal(
    canonicalJson(Object.fromEntries(
      Object.entries(result.proposedDataset.lakes).filter(([id]) => id !== "svansjon"),
    )),
    canonicalJson(beforeOtherLakes),
  );

  assert.deepEqual(
    getLakeFishingSelectionDetails(result.proposedDataset.lakes.svansjon, {
      method: ["Spinn", "Flugfiske", "Pimpelfiske", "Mete", "Trolling"],
    }).categories.method,
    [
      { choice: "Spinn", status: "allowed", missing: [], inferred: true },
      { choice: "Flugfiske", status: "allowed", missing: [], inferred: true },
      { choice: "Pimpelfiske", status: "allowed", missing: [], inferred: true },
      { choice: "Mete", status: "unknown", missing: ["method"] },
      { choice: "Trolling", status: "unknown", missing: ["method"] },
    ],
  );
  assert.ok(fishingChoices.methods.includes("Pimpelfiske"));

  const afterBytes = await Promise.all(productionUrls.map((url) => readFile(url)));
  assert.deepEqual(afterBytes, beforeBytes);
});
