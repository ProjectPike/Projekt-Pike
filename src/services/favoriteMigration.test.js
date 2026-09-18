import test from "node:test";
import assert from "node:assert/strict";
import { migrateFavoriteLakeIds } from "./favoriteMigration.js";

const preApplyLakes = { bunn: { id: "bunn" }, nommen: { id: "nommen" } };
const liveReplacementLakes = {
  "bunn-norra-mellersta": { id: "bunn-norra-mellersta" },
  "bunn-sodra": { id: "bunn-sodra" },
};

test("legacy Bunn favorite remains dormant against the current pre-apply dataset", () => {
  const favorites = ["bunn"];
  assert.equal(migrateFavoriteLakeIds(favorites, preApplyLakes), favorites);
  assert.deepEqual(favorites, ["bunn"]);
});

test("live replacement expands legacy Bunn north then south", () => {
  assert.deepEqual(migrateFavoriteLakeIds(["bunn"], liveReplacementLakes), [
    "bunn-norra-mellersta",
    "bunn-sodra",
  ]);
});

test("unrelated favorite order is preserved around the expansion", () => {
  assert.deepEqual(
    migrateFavoriteLakeIds(["nommen", "bunn", "vattern"], liveReplacementLakes),
    ["nommen", "bunn-norra-mellersta", "bunn-sodra", "vattern"],
  );
});

test("an existing north successor remains ordered and deduplicated", () => {
  assert.deepEqual(
    migrateFavoriteLakeIds(
      ["nommen", "bunn-norra-mellersta", "bunn", "vattern"],
      liveReplacementLakes,
    ),
    ["nommen", "bunn-norra-mellersta", "bunn-sodra", "vattern"],
  );
});

test("an existing south successor before legacy Bunn is reordered north then south", () => {
  assert.deepEqual(
    migrateFavoriteLakeIds(
      ["nommen", "bunn-sodra", "bunn", "vattern"],
      liveReplacementLakes,
    ),
    ["nommen", "bunn-norra-mellersta", "bunn-sodra", "vattern"],
  );
});

test("duplicate legacy IDs produce one successor pair", () => {
  assert.deepEqual(
    migrateFavoriteLakeIds(["bunn", "bunn", "bunn"], liveReplacementLakes),
    ["bunn-norra-mellersta", "bunn-sodra"],
  );
});

test("migration is idempotent", () => {
  const once = migrateFavoriteLakeIds(["bunn"], liveReplacementLakes);
  const twice = migrateFavoriteLakeIds(once, liveReplacementLakes);
  assert.equal(twice, once);
  assert.deepEqual(twice, ["bunn-norra-mellersta", "bunn-sodra"]);
});

test("source absent with only north present does not migrate", () => {
  const favorites = ["bunn"];
  assert.equal(
    migrateFavoriteLakeIds(favorites, {
      "bunn-norra-mellersta": liveReplacementLakes["bunn-norra-mellersta"],
    }),
    favorites,
  );
});

test("source absent with only south present does not migrate", () => {
  const favorites = ["bunn"];
  assert.equal(
    migrateFavoriteLakeIds(favorites, {
      "bunn-sodra": liveReplacementLakes["bunn-sodra"],
    }),
    favorites,
  );
});

test("source still present blocks migration even when both successors exist", () => {
  const favorites = ["bunn"];
  assert.equal(
    migrateFavoriteLakeIds(favorites, { ...preApplyLakes, ...liveReplacementLakes }),
    favorites,
  );
});

test("unknown unrelated favorite IDs are preserved", () => {
  assert.deepEqual(
    migrateFavoriteLakeIds(["unknown-lake", "bunn"], liveReplacementLakes),
    ["unknown-lake", "bunn-norra-mellersta", "bunn-sodra"],
  );
});

test("favorites without legacy Bunn are returned without mutation", () => {
  const favorites = ["nommen", "bunn-sodra", "vattern"];
  assert.equal(migrateFavoriteLakeIds(favorites, liveReplacementLakes), favorites);
  assert.deepEqual(favorites, ["nommen", "bunn-sodra", "vattern"]);
});
