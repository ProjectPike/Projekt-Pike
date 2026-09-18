import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { lakes } from "../src/data/lakes.js";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { getLakeFishingSelectionDetails } from "../src/services/lakeService.js";
import {
  replacementHash,
  validateReplacementManifest,
} from "./entityReplacement.mjs";
import { validateLakeDataState } from "./lakeDataValidation.mjs";

const manifest = JSON.parse(
  await readFile(new URL("../data/replacements/bunn-split-1.json", import.meta.url), "utf8"),
);
const replacements = Object.fromEntries(
  manifest.replacements.map((replacement) => [replacement.id, replacement]),
);
const selectedMethods = ["Spinn", "Mete", "Flugfiske", "Pimpelfiske", "Trolling"];
const now = new Date("2026-09-18T12:00:00Z");

function methodStatuses(lake) {
  return Object.fromEntries(
    getLakeFishingSelectionDetails(lake, { method: selectedMethods }, now)
      .categories.method.map(({ choice, status }) => [choice, status]),
  );
}

test("real Bunn split manifest preserves its before-state and matches applied production", () => {
  assert.deepEqual(validateReplacementManifest(manifest), []);
  assert.equal(manifest.replacementId, "bunn-split-1");
  assert.equal(manifest.source.lakeFingerprint, "aa8a538e4289716576b55f44a69bd9b728877ed530f807079e661b3ce3edc1ea");
  assert.equal(manifest.source.lakeFingerprint, replacementHash(manifest.source.lake));
  assert.equal(Object.hasOwn(lakes, "bunn"), false);
  assert.equal(Object.hasOwn(lakeDepthMapResearch, "bunn"), false);
  assert.equal(Object.hasOwn(lakePointsByLakeId, "bunn"), false);
  for (const replacement of manifest.replacements) {
    assert.deepEqual(lakes[replacement.id], replacement.lake);
    assert.deepEqual(lakeDepthMapResearch[replacement.id], replacement.depth);
    assert.deepEqual(lakePointsByLakeId[replacement.id], replacement.points);
  }
  assert.equal(manifest.expectedCountBefore, 23);
  assert.equal(manifest.expectedCountAfter, 24);
});

test("future Bunn replacement state is complete and production-valid", () => {
  const future = {
    lakes: structuredClone(lakes),
    lakeDepthMapResearch: structuredClone(lakeDepthMapResearch),
    lakePointsByLakeId: structuredClone(lakePointsByLakeId),
  };

  for (const record of Object.values(future)) delete record.bunn;
  for (const replacement of manifest.replacements) {
    future.lakes[replacement.id] = replacement.lake;
    future.lakeDepthMapResearch[replacement.id] = replacement.depth;
    future.lakePointsByLakeId[replacement.id] = replacement.points;
  }

  const validation = validateLakeDataState({ ...future, expectedLakeCount: 24 });
  assert.deepEqual(validation.errors, []);
  assert.equal(Object.keys(future.lakes).length, 24);
  assert.equal(Object.hasOwn(future.lakes, "bunn"), false);
});

test("replacement identities, coordinates and fish-only species are exact", () => {
  const north = replacements["bunn-norra-mellersta"].lake;
  const south = replacements["bunn-sodra"].lake;
  const species = ["abborre", "lake", "braxen", "mört", "gers", "nors", "gädda", "sarv", "gös"];

  assert.deepEqual(north.coordinates, [14.5255853220231, 58.0128658993479]);
  assert.equal(north.coordinateSource, "https://www.naturkartan.se/sv/jonkopings-lan/norra-bunns-fvof");
  assert.deepEqual(south.coordinates, [14.5151225407906, 57.949419193117]);
  assert.equal(south.coordinateSource, "https://www.naturkartan.se/sv/jonkopings-lan/sodra-bunns-fvof");
  assert.equal(Object.hasOwn(north, "distance"), false);
  assert.equal(Object.hasOwn(south, "distance"), false);
  assert.deepEqual(north.details.species.knownSpecies.value, species);
  assert.deepEqual(south.details.species.knownSpecies.value, species);
  assert.equal(species.includes("signalkräfta"), false);
});

test("future matching remains scoped independently for both Bunn entities", () => {
  assert.deepEqual(methodStatuses(replacements["bunn-norra-mellersta"].lake), {
    Spinn: "allowed",
    Mete: "allowed",
    Flugfiske: "allowed",
    Pimpelfiske: "allowed",
    Trolling: "unknown",
  });
  assert.deepEqual(methodStatuses(replacements["bunn-sodra"].lake), {
    Spinn: "allowed",
    Mete: "allowed",
    Flugfiske: "unknown",
    Pimpelfiske: "allowed",
    Trolling: "unknown",
  });
});

test("Rotabron moves only north and provider-neutral depth remains unpublished", () => {
  const north = replacements["bunn-norra-mellersta"];
  const south = replacements["bunn-sodra"];

  assert.deepEqual(north.points.map((point) => point.id), ["bunn-boat-ramp-rotabron"]);
  assert.deepEqual(north.points[0].coordinates, [14.516454, 57.975362]);
  assert.equal(north.points[0].note.includes("06-15"), false);
  assert.deepEqual(south.points, []);

  for (const replacement of [north, south]) {
    assert.equal(replacement.depth.status, "available");
    assert.equal(replacement.depth.smhiLakeId, null);
    assert.equal(replacement.depth.bathymetry.processingState, "needs-review");
    assert.equal(replacement.depth.bathymetry.georeferencingStatus, "unverified");
    assert.equal(replacement.depth.bathymetry.qualityStatus, "needs-review");
    assert.equal(replacement.depth.bathymetry.published, false);
    assert.equal(Object.hasOwn(replacement.depth, "dataUrl"), false);
    assert.match(replacement.depth.bathymetry.reviewNote, /äldre SMHI-tilldelningen/);
  }
});

test("source conflicts and unsupported numeric scopes remain explicit without false rules", () => {
  const north = replacements["bunn-norra-mellersta"].lake;
  const south = replacements["bunn-sodra"].lake;
  const southZander = south.details.species.sizeLimits.find((entry) => entry.species === "gös");
  const southDistanceRule = south.details.geography.fishingProhibitionAreas[0];

  assert.deepEqual(southZander.value, { minSizeCm: 50, maxSizeCm: 70 });
  assert.match(southZander.note, /55–70/);
  assert.match(southDistanceRule.note, /100 meter/);
  assert.equal(Object.hasOwn(north.details.methods, "maxRodsPerPerson"), false);
  assert.equal(Object.hasOwn(north.details.methods, "maxRodsPerPermit"), false);
  assert.equal(Object.keys(south.details.methods).some((key) => key.startsWith("iceMax")), false);
  assert.match(north.details.access.permitMethodSupport.note, /två spön samtidigt/);
  assert.match(south.details.access.permitMethodSupport.note, /högst tio redskap/);
});
