export const DEFAULT_LAKE_MAP_ZOOM = 12;
export const LAKE_MAP_MIN_ZOOM_ALLOWANCE = 0.75;
export const LAKE_MAP_BOUNDS_MARGIN = 0.4;

export const LAKE_MAP_BOUNDS_BY_ID = Object.freeze({
  ulvstorpasjon: [
    [14.0893048, 57.7557063],
    [14.0968151, 57.7583418],
  ],
  bolmen: [
    [13.5648438, 56.7612877],
    [13.8538054, 57.0789265],
  ],
});

export const LAKE_MAP_BOUNDS_PROVENANCE_BY_ID = Object.freeze({
  ulvstorpasjon: {
    osmObjectType: "way",
    osmObjectId: 23543708,
    sourceUrl: "https://www.openstreetmap.org/way/23543708",
    retrievedAt: "2026-09-24",
  },
  bolmen: {
    osmObjectType: "relation",
    osmObjectId: 7130,
    sourceUrl: "https://www.openstreetmap.org/relation/7130",
    retrievedAt: "2026-09-24",
  },
});

export const LAKE_MAP_ZOOM_BY_ID = Object.freeze({
  bolmen: 10,
  "bunn-norra-mellersta": 11,
  "bunn-sodra": 11,
  gravsjon: 13.4,
  hokesjon: 12.8,
  knipesjon: 13.1,
  landsjon: 11.8,
  mullsjon: 12.4,
  munksjon: 13.2,
  nommen: 10.7,
  risbrodammen: 13.2,
  klappasjon: 13.1,
  rocksjon: 13.4,
  ryssbysjon: 12.5,
  sandhemssjon: 12.8,
  sommen: 9.2,
  spexhultasjon: 12.4,
  straken: 10.2,
  svansjon: 12.8,
  tenhultasjon: 12.3,
  ulvstorpasjon: 14.2,
  vattern: 8.3,
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
