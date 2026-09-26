import { LAKE_MAP_FRAMING_BY_ID } from "./lakeMapBounds.js";

export const LAKE_FOCUS_MASK_COLOR = "#07110f";
export const LAKE_FOCUS_MASK_OPACITY = 0.62;

// Its representative production coordinate is 15.5 m outside OSM relation 8035331.
export const LAKE_FOCUS_MASK_BLOCKED_IDS = Object.freeze(["attarpsdammen"]);

const blockedLakeIds = new Set(LAKE_FOCUS_MASK_BLOCKED_IDS);

export const LAKE_FOCUS_MASK_URL_BY_ID = Object.freeze(
  Object.fromEntries(
    Object.keys(LAKE_MAP_FRAMING_BY_ID)
      .filter((lakeId) => !blockedLakeIds.has(lakeId))
      .map((lakeId) => [lakeId, `/lake-focus/${lakeId}.geojson`]),
  ),
);

const focusMaskPromiseByLakeId = new Map();

export function getLakeFocusMaskUrl(lakeId) {
  return LAKE_FOCUS_MASK_URL_BY_ID[lakeId] ?? null;
}

export function isLakeFocusMaskRevealReady({
  camera,
  depth,
  hasFocusMask,
  mask,
  points,
}) {
  return !hasFocusMask || [camera, depth, mask, points].every(Boolean);
}

export function loadLakeFocusMask(lakeId, fetchMask = globalThis.fetch) {
  const maskUrl = getLakeFocusMaskUrl(lakeId);

  if (!maskUrl) {
    return Promise.resolve(null);
  }

  const cachedPromise = focusMaskPromiseByLakeId.get(lakeId);

  if (cachedPromise) {
    return cachedPromise;
  }

  const maskPromise = fetchMask(maskUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    })
    .catch((error) => {
      focusMaskPromiseByLakeId.delete(lakeId);
      console.error(`Kunde inte läsa fokusmasken för ${lakeId}:`, error);
      return null;
    });

  focusMaskPromiseByLakeId.set(lakeId, maskPromise);
  return maskPromise;
}

export function preloadLakeFocusMask(lakeId, fetchMask = globalThis.fetch) {
  return loadLakeFocusMask(lakeId, fetchMask);
}

export function resetLakeFocusMaskCacheForTests() {
  focusMaskPromiseByLakeId.clear();
}
