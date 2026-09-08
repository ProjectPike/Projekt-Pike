export const NATURAL_BASEMAP_STYLE_URL =
  "https://tiles.openfreemap.org/styles/fiord";

// One shared, restrained nature palette for the external basemap in every Pike theme.
// These values intentionally stay independent from the theme-specific Pike UI tokens.
const NATURAL_BASEMAP_PAINT = [
  ["background", "background-color", "#18241f"],
  ["water", "fill-color", "#285f78"],
  ["landcover_ice_shelf", "fill-color", "#80939a"],
  ["landuse_residential", "fill-color", "#3b4139"],
  [
    "landuse_residential",
    "fill-opacity",
    ["interpolate", ["linear"], ["zoom"], 6, 0.3, 12, 0.5],
  ],
  ["landcover_wood", "fill-color", "#244b35"],
  [
    "landcover_wood",
    "fill-opacity",
    ["interpolate", ["linear"], ["zoom"], 6, 0.32, 9, 0.5, 12, 0.76],
  ],
  ["park", "fill-color", "#31573d"],
  ["park", "fill-opacity", 0.55],
  ["park_outline", "line-color", "#50735a"],
  ["waterway", "line-color", "#3e7890"],
  ["building", "fill-color", "#41483f"],
  ["road_area_pier", "fill-color", "#596259"],
  ["road_pier", "line-color", "#596259"],
  ["highway_path", "line-color", "#65715f"],
  ["highway_minor", "line-color", "#747d72"],
  ["highway_major_casing", "line-color", "#4b554e"],
  ["highway_major_inner", "line-color", "#8b846f"],
  ["highway_major_subtle", "line-color", "#6d756b"],
  ["highway_motorway_casing", "line-color", "#4b554e"],
  ["highway_motorway_inner", "line-color", "#9b8567"],
  ["highway_motorway_subtle", "line-color", "#70654f"],
  ["water_name", "text-color", "#9cc5d6"],
  ["water_name", "text-halo-color", "#15231e"],
  ["highway_name_other", "text-color", "#c5c8bb"],
  ["highway_name_other", "text-halo-color", "#19231e"],
  ["place_other", "text-color", "#aebcb3"],
  ["place_other", "text-halo-color", "#17231e"],
  ["place_suburb", "text-color", "#a8bbae"],
  ["place_suburb", "text-halo-color", "#17231e"],
  ["place_village", "text-color", "#d1d9d3"],
  ["place_village", "text-halo-color", "#17231e"],
  ["place_town", "text-color", "#e0e5e1"],
  ["place_town", "text-halo-color", "#17231e"],
  ["place_city", "text-color", "#e0e5e1"],
  ["place_city", "text-halo-color", "#17231e"],
  ["place_city_large", "text-color", "#edf1ee"],
  ["place_city_large", "text-halo-color", "#17231e"],
];

function readCssColor(style, property, fallback) {
  return style.getPropertyValue(property).trim() || fallback;
}

export function getPikeMapColors() {
  const style = getComputedStyle(document.documentElement);

  return {
    cluster: readCssColor(style, "--color-map-cluster", "#123b2e"),
    markerOutline: readCssColor(style, "--color-map-marker-outline", "#f4f7fa"),
    selection: readCssColor(style, "--color-map-selection", "#c9b893"),
    selectionSoft: readCssColor(
      style,
      "--color-map-selection-soft",
      "rgb(201 184 147 / 20%)",
    ),
    text: readCssColor(style, "--color-text", "#f4f7fa"),
    labelHalo: readCssColor(style, "--color-map-label-halo", "rgb(11 31 45 / 94%)"),
    supported: readCssColor(style, "--color-status-supported", "#7fbf8b"),
    warning: readCssColor(style, "--color-status-warning", "#f4a261"),
    unknown: readCssColor(style, "--color-status-unknown", "#8b9baa"),
    pointRamp: readCssColor(style, "--color-map-point-ramp", "#245f7b"),
    pointParking: readCssColor(style, "--color-map-point-parking", "#315d70"),
    pointBathing: readCssColor(style, "--color-map-point-bathing", "#16747f"),
    pointAccess: readCssColor(style, "--color-map-point-access", "#34705b"),
    pointRental: readCssColor(style, "--color-map-point-rental", "#59628d"),
    bathymetryContour: readCssColor(
      style,
      "--color-bathymetry-contour",
      "#dfd1ac",
    ),
    bathymetryHalo: readCssColor(
      style,
      "--color-bathymetry-halo",
      "rgb(15 54 70 / 88%)",
    ),
  };
}

export function applyNaturalBasemapPalette(map) {
  NATURAL_BASEMAP_PAINT.forEach(([layerId, property, value]) => {
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, property, value);
    }
  });
}
