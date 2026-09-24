export const LAKE_FOCUS_MASK_COLOR = "#07110f";
export const LAKE_FOCUS_MASK_OPACITY = 0.62;

export const LAKE_FOCUS_MASK_URL_BY_ID = Object.freeze({
  bolmen: "/lake-focus/bolmen.geojson",
  ulvstorpasjon: "/lake-focus/ulvstorpasjon.geojson",
});

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
