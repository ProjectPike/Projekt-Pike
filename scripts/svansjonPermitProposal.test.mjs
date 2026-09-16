import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fishingChoices } from "../src/data/fishingChoices.js";
import { lakes } from "../src/data/lakes.js";
import { getLakeFishingSelectionDetails } from "../src/services/lakeService.js";
import { semanticFingerprint } from "./evaluateLakeUpdates.mjs";

const proposalUrl = new URL("../data/updates/svansjon-method-permits-1.json", import.meta.url);
const productionUrls = [
  new URL("../src/data/lakes.js", import.meta.url),
  new URL("../src/data/lakeDepthMapResearch.js", import.meta.url),
];

test("the applied Svansjön permit proposal remains exact and behaviorally scoped", async () => {
  const proposal = JSON.parse(await readFile(proposalUrl, "utf8"));
  const beforeBytes = await Promise.all(productionUrls.map((url) => readFile(url)));

  assert.notEqual(proposal.targetLakeFingerprint, semanticFingerprint(lakes.svansjon));
  assert.deepEqual(proposal.changes.map(({ path }) => path), [
    "details.access.permitMethodSupport",
  ]);
  assert.equal(proposal.changes[0].expected.mode, "absent");
  assert.equal(proposal.changes[0].proposed.conditions, null);
  assert.deepEqual(
    lakes.svansjon.details.access.permitMethodSupport,
    proposal.changes[0].proposed,
  );

  assert.deepEqual(
    getLakeFishingSelectionDetails(lakes.svansjon, {
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
