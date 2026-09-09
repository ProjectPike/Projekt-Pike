export const FEATURES = Object.freeze({
  DEPTH_MAPS: "depth-maps",
});

export const ACCESS_PROFILES = Object.freeze({
  CURRENT: "current",
  FREE: "free",
});

// Temporary default preserves today's access; this is not a membership decision.
export const DEFAULT_ACCESS_PROFILE = ACCESS_PROFILES.CURRENT;

const featureGrants = Object.freeze({
  [FEATURES.DEPTH_MAPS]: Object.freeze([ACCESS_PROFILES.CURRENT]),
});

// Pure access policy only. Lake data availability is handled separately.
// Unknown features/profiles are denied rather than implicitly granted access.
export function isFeatureAllowed(featureId, accessProfile = DEFAULT_ACCESS_PROFILE) {
  return Object.hasOwn(featureGrants, featureId)
    && featureGrants[featureId].includes(accessProfile);
}
