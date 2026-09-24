import { LAKE_MAP_BOUNDS_BY_ID } from "./lakeMapBounds.js";

export {
  LAKE_MAP_BOUNDS_BY_ID,
  LAKE_MAP_BOUNDS_PROVENANCE_BY_ID,
  LAKE_MAP_FRAMING_BY_ID,
} from "./lakeMapBounds.js";

export const DEFAULT_LAKE_MAP_ZOOM = 12;
export const LAKE_MAP_MIN_ZOOM_ALLOWANCE = 0.75;
export const LAKE_MAP_BOUNDS_MARGIN = 0.4;

export const LAKE_MAP_ZOOM_BY_ID = Object.freeze({
  "bunn-norra-mellersta": 11,
  "bunn-sodra": 11,
});

export function getLakeMapZoom(lakeId) {
  return LAKE_MAP_ZOOM_BY_ID[lakeId] ?? DEFAULT_LAKE_MAP_ZOOM;
}

export function getLakeMapBounds(lakeId) {
  return LAKE_MAP_BOUNDS_BY_ID[lakeId] ?? null;
}

export function getLakeMapFitPadding(width, height) {
  const shortestSide = Math.min(width, height);

  if (!Number.isFinite(shortestSide) || shortestSide <= 0) {
    return 32;
  }

  return Math.round(Math.min(56, Math.max(24, shortestSide * 0.08)));
}

export function getLakeMapMinZoom(initialZoom) {
  return Math.max(0, initialZoom - LAKE_MAP_MIN_ZOOM_ALLOWANCE);
}

export function expandLakeMapBounds(bounds, margin = LAKE_MAP_BOUNDS_MARGIN) {
  const [[west, south], [east, north]] = bounds;
  const longitudeMargin = (east - west) * margin;
  const latitudeMargin = (north - south) * margin;

  return [
    [west - longitudeMargin, south - latitudeMargin],
    [east + longitudeMargin, north + latitudeMargin],
  ];
}

export function getLakeMapLocalConstraint(fittedZoom, fittedViewportBounds) {
  return {
    minZoom: getLakeMapMinZoom(fittedZoom),
    maxBounds: expandLakeMapBounds(fittedViewportBounds),
  };
}

export function getDiscoveryClusterTargetZoom(expansionZoom, currentZoom) {
  return Math.min(Math.max(expansionZoom + 1.2, currentZoom + 2), 14);
}

export function hasPlausibleSwedishCoordinates(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }

  const [longitude, latitude] = coordinates;

  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= 10 &&
    longitude <= 25 &&
    latitude >= 55 &&
    latitude <= 70
  );
}
