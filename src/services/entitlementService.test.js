import assert from "node:assert/strict";
import test from "node:test";
import {
  ACCESS_PROFILES,
  DEFAULT_ACCESS_PROFILE,
  FEATURES,
  isFeatureAllowed,
} from "./entitlementService.js";

test("default and current profiles retain depth map access", () => {
  assert.equal(DEFAULT_ACCESS_PROFILE, ACCESS_PROFILES.CURRENT);
  assert.equal(isFeatureAllowed(FEATURES.DEPTH_MAPS), true);
  assert.equal(isFeatureAllowed(FEATURES.DEPTH_MAPS, ACCESS_PROFILES.CURRENT), true);
});

test("free profile locks depth maps without changing subsequent evaluations", () => {
  assert.equal(isFeatureAllowed(FEATURES.DEPTH_MAPS, ACCESS_PROFILES.FREE), false);
  assert.equal(isFeatureAllowed(FEATURES.DEPTH_MAPS), true);
});

test("unknown features are denied, including inherited object keys", () => {
  for (const feature of ["future-feature", "toString", "__proto__", null, undefined]) {
    assert.equal(isFeatureAllowed(feature), false);
  }
});

test("unknown or malformed profiles are denied", () => {
  for (const profile of ["future-tier", "", null, {}, []]) {
    assert.equal(isFeatureAllowed(FEATURES.DEPTH_MAPS, profile), false);
  }
});
