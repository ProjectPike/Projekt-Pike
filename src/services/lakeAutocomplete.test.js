import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getLakeAutocompleteSuggestions } from "./lakeAutocomplete.js";

const bunnPublication = JSON.parse(
  await readFile(
    new URL("../../data/published-replacements/bunn-split-1.json", import.meta.url),
    "utf8",
  ),
);

function lake(id, name, region = "Småland", counties = ["Jönköpings län"]) {
  return { id, name, region, counties };
}

function suggestionNames(lakes, query) {
  return getLakeAutocompleteSuggestions(lakes, query).map(({ name }) => name);
}

test("one prefix match suppresses name and location fallback matches", () => {
  const lakes = {
    attarp: lake("attarp", "Attarpsdammen"),
    bolmen: lake("bolmen", "Bolmen", "Halland"),
    ramsjon: lake("ramsjon", "Ramsjön", "Attarp"),
  };

  assert.deepEqual(suggestionNames(lakes, "A"), ["Attarpsdammen"]);
});

test("multiple prefix matches are alphabetical and limited without fallback fill", () => {
  const lakes = {
    munksjon: lake("munksjon", "Munksjön"),
    rumm: lake("rumm", "Rummelsjön"),
    mullsjon: lake("mullsjon", "Mullsjön"),
  };

  assert.deepEqual(suggestionNames(lakes, "Mu"), ["Mullsjön", "Munksjön"]);
});

test("zero prefix matches enables ranked name contains fallback", () => {
  const lakes = {
    vattern: lake("vattern", "Vättern"),
    munksjon: lake("munksjon", "Munksjön"),
    rocksjon: lake("rocksjon", "Rocksjön"),
  };

  assert.deepEqual(suggestionNames(lakes, "sjön"), ["Munksjön", "Rocksjön"]);
});

test("zero prefix matches enables region and county fallback after name matches", () => {
  const lakes = {
    jonkopingssjon: lake("jonkopingssjon", "Lilla Jönköpingssjön", "Småland", ["Kalmar län"]),
    rocksjon: lake("rocksjon", "Rocksjön", "Jönköping", ["Jönköpings län"]),
    vattern: lake("vattern", "Vättern", "Småland", ["Jönköpings län"]),
  };

  assert.deepEqual(suggestionNames(lakes, "Jönköping"), [
    "Lilla Jönköpingssjön",
    "Rocksjön",
    "Vättern",
  ]);
});

test("matching is case-insensitive with Swedish locale normalization", () => {
  const lakes = {
    oasjon: lake("oasjon", "Öasjön"),
    annan: lake("annan", "Lilla sjön", "Örebro"),
  };

  assert.deepEqual(suggestionNames(lakes, "öA"), ["Öasjön"]);
});

test("Swedish alphabetical ordering is deterministic", () => {
  const lakes = {
    sa: lake("sa", "Salen"),
    saa: lake("saa", "Sålen"),
    sae: lake("sae", "Sälen"),
  };

  assert.deepEqual(suggestionNames(lakes, "S"), ["Salen", "Sålen", "Sälen"]);
});

test("approved future Bunn entities remain distinct ordered prefix results", () => {
  const futureBunnLakes = Object.fromEntries(
    bunnPublication.manifest.replacements.map(({ id, lake }) => [id, lake]),
  );
  const suggestions = getLakeAutocompleteSuggestions(
    {
      ...futureBunnLakes,
      filler: lake("filler", "Lilla Bunnsjön"),
    },
    "Bunn",
  );

  assert.deepEqual(
    suggestions.map(({ id, name }) => ({ id, name })),
    [
      { id: "bunn-norra-mellersta", name: "Bunn – Norra/Mellersta" },
      { id: "bunn-sodra", name: "Bunn – Södra" },
    ],
  );
  assert.equal(suggestions.some(({ id }) => id === "bunn"), false);
});
