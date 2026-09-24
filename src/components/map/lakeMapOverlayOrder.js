export const LAKE_MAP_OVERLAY_LAYER_IDS = Object.freeze({
  focusMask: "lake-focus-mask-fill",
  depthContours: "lake-depth-map-contours",
  depthLabels: "lake-depth-map-labels",
  pointClusters: "lake-map-point-clusters",
  pointClusterCount: "lake-map-point-cluster-count",
  pointCircle: "lake-map-point-unclustered-circle",
  pointSymbol: "lake-map-point-unclustered-symbol",
});

export const LAKE_MAP_OVERLAY_ORDER = Object.freeze([
  LAKE_MAP_OVERLAY_LAYER_IDS.focusMask,
  LAKE_MAP_OVERLAY_LAYER_IDS.depthContours,
  LAKE_MAP_OVERLAY_LAYER_IDS.depthLabels,
  LAKE_MAP_OVERLAY_LAYER_IDS.pointClusters,
  LAKE_MAP_OVERLAY_LAYER_IDS.pointClusterCount,
  LAKE_MAP_OVERLAY_LAYER_IDS.pointCircle,
  LAKE_MAP_OVERLAY_LAYER_IDS.pointSymbol,
]);

export function normalizeLakeMapOverlayOrder(map) {
  for (const layerId of LAKE_MAP_OVERLAY_ORDER) {
    if (map.getLayer(layerId)) {
      map.moveLayer(layerId);
    }
  }
}
