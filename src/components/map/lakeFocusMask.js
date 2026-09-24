export const LAKE_FOCUS_MASK_COLOR = "#07110f";
export const LAKE_FOCUS_MASK_OPACITY = 0.62;

export const LAKE_FOCUS_MASK_URL_BY_ID = Object.freeze({
  bolmen: "/lake-focus/bolmen.geojson",
  ulvstorpasjon: "/lake-focus/ulvstorpasjon.geojson",
});

export function getLakeFocusMaskUrl(lakeId) {
  return LAKE_FOCUS_MASK_URL_BY_ID[lakeId] ?? null;
}
