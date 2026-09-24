import assert from "node:assert/strict";
import test from "node:test";
import {
  formatAccessDetailValue,
  formatLakeDetailValue,
  formatPermitMethodSupportValue,
  getKnownLakeDetailLabel,
} from "./lakeDetailFormatting.js";

const permitMethodSupport = [
  { permitType: "ordinary-open-water", methods: ["spin", "fly"] },
  { permitType: "ice-fishing", methods: ["ice"] },
];

test("formats scoped permit support without leaking internal values", () => {
  const result = formatAccessDetailValue("permitMethodSupport", permitMethodSupport);

  assert.equal(result, "Ordinarie + isfiskekort");
  for (const internalValue of [
    "ordinary-open-water",
    "ice-fishing",
    "spin",
    "fly",
    "ice",
    "[object Object]",
  ]) {
    assert.equal(result.includes(internalValue), false);
  }
});

test("unsupported structured values use a safe empty fallback", () => {
  assert.equal(formatPermitMethodSupportValue([{ permitType: "future", methods: ["spin"] }]), null);
  assert.equal(formatPermitMethodSupportValue([{ permitType: "ice-fishing" }]), null);
  assert.equal(formatLakeDetailValue([{ value: "allowed" }]), null);
  assert.notEqual(formatLakeDetailValue([{ value: "allowed" }]), "[object Object]");
});

test("existing primitive and primitive-array detail values retain their labels", () => {
  assert.equal(formatAccessDetailValue("permitRequirement", "allowed"), "Tillåtet");
  assert.equal(formatAccessDetailValue("other", "Egen text"), "Egen text");
  assert.equal(formatAccessDetailValue("permitCost", 3), "3");
  assert.equal(formatAccessDetailValue("permitProducts", ["day", "week"]), "Dagskort, Veckokort");
});

test("current production detail keys have deliberate Swedish labels", () => {
  assert.equal(
    getKnownLakeDetailLabel("methods", "maxRodsPerPerson"),
    "Spön per person",
  );
  assert.equal(getKnownLakeDetailLabel("methods", "chumming"), "Mäskning");
  assert.equal(
    getKnownLakeDetailLabel("access", "membershipRequirement"),
    "Medlemskap",
  );
  assert.equal(
    getKnownLakeDetailLabel("watercraft", "floatingCraft"),
    "Flytande farkost",
  );
  assert.equal(
    getKnownLakeDetailLabel("safety", "winterFishingRisk"),
    "Risk vid vinterfiske",
  );
  assert.equal(getKnownLakeDetailLabel("methods", "futureKey"), null);
});
