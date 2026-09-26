import test from "node:test";
import assert from "node:assert/strict";
import {
  getLakePointLayers,
  getLakePoints,
  getPointTypes,
} from "../../data/lakePoints.js";
import { getLakeFocusMaskUrl } from "./lakeFocusMask.js";
import {
  LAKE_MAP_OVERLAY_LAYER_IDS,
  LAKE_MAP_OVERLAY_ORDER,
  normalizeLakeMapOverlayOrder,
} from "./lakeMapOverlayOrder.js";

function createMapLayerOrder(initialLayerIds) {
  const layerIds = [...initialLayerIds];

  return {
    getLayer(layerId) {
      return layerIds.includes(layerId) ? { id: layerId } : undefined;
    },
    moveLayer(layerId) {
      layerIds.splice(layerIds.indexOf(layerId), 1);
      layerIds.push(layerId);
    },
    layerIds,
  };
}

test("Bolmen retains ten stored points and its focus-mask assignment", () => {
  const points = getLakePoints("bolmen");
  const activeLayerIds = getLakePointLayers("bolmen").map((layer) => layer.id);
  const visiblePoints = points.filter((point) =>
    getPointTypes(point).some((type) => activeLayerIds.includes(type)),
  );

  assert.equal(points.length, 10);
  assert.deepEqual(activeLayerIds, ["boat-ramp", "parking", "bathing-area"]);
  assert.equal(visiblePoints.length, 10);
  assert.equal(getLakeFocusMaskUrl("bolmen"), "/lake-focus/bolmen.geojson");
  assert.equal(getLakeFocusMaskUrl("sommen"), "/lake-focus/sommen.geojson");
  assert.equal(getLakeFocusMaskUrl("bunn-norra-mellersta"), null);
});

test("Pike overlay order keeps depth and every point layer above the focus mask", () => {
  assert.deepEqual(LAKE_MAP_OVERLAY_ORDER, [
    LAKE_MAP_OVERLAY_LAYER_IDS.focusMask,
    LAKE_MAP_OVERLAY_LAYER_IDS.depthContours,
    LAKE_MAP_OVERLAY_LAYER_IDS.depthLabels,
    LAKE_MAP_OVERLAY_LAYER_IDS.pointClusters,
    LAKE_MAP_OVERLAY_LAYER_IDS.pointClusterCount,
    LAKE_MAP_OVERLAY_LAYER_IDS.pointCircle,
    LAKE_MAP_OVERLAY_LAYER_IDS.pointSymbol,
  ]);

  const map = createMapLayerOrder([
    "basemap-labels",
    LAKE_MAP_OVERLAY_LAYER_IDS.pointSymbol,
    LAKE_MAP_OVERLAY_LAYER_IDS.pointClusters,
    LAKE_MAP_OVERLAY_LAYER_IDS.focusMask,
    LAKE_MAP_OVERLAY_LAYER_IDS.depthLabels,
    LAKE_MAP_OVERLAY_LAYER_IDS.pointCircle,
    LAKE_MAP_OVERLAY_LAYER_IDS.depthContours,
    LAKE_MAP_OVERLAY_LAYER_IDS.pointClusterCount,
  ]);

  normalizeLakeMapOverlayOrder(map);
  assert.deepEqual(map.layerIds, ["basemap-labels", ...LAKE_MAP_OVERLAY_ORDER]);

  normalizeLakeMapOverlayOrder(map);
  assert.deepEqual(map.layerIds, ["basemap-labels", ...LAKE_MAP_OVERLAY_ORDER]);
});

test("overlay normalization is safe while only some asynchronous layers exist", () => {
  const map = createMapLayerOrder([
    "basemap-labels",
    LAKE_MAP_OVERLAY_LAYER_IDS.pointClusters,
    LAKE_MAP_OVERLAY_LAYER_IDS.focusMask,
    LAKE_MAP_OVERLAY_LAYER_IDS.pointClusterCount,
  ]);

  normalizeLakeMapOverlayOrder(map);
  assert.deepEqual(map.layerIds, [
    "basemap-labels",
    LAKE_MAP_OVERLAY_LAYER_IDS.focusMask,
    LAKE_MAP_OVERLAY_LAYER_IDS.pointClusters,
    LAKE_MAP_OVERLAY_LAYER_IDS.pointClusterCount,
  ]);
});
