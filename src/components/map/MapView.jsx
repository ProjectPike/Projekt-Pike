import { useEffect, useMemo, useRef, useState } from "react";
import { Map, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import MapPlaceholder from "./MapPlaceholder";
import {
  applyNaturalBasemapPalette,
  getPikeMapColors,
  NATURAL_BASEMAP_STYLE_URL,
} from "./mapTheme";
import { supportsInteractiveMap } from "../../utils/mapSupport";

setWorkerUrl(workerUrl);

const LAKE_SOURCE_ID = "discovery-map-lakes";
const SELECTED_LAKE_SOURCE_ID = "discovery-map-selected-lake";
const CLUSTER_CIRCLE_LAYER_ID = "discovery-map-clusters";
const CLUSTER_COUNT_LAYER_ID = "discovery-map-cluster-count";
const CLUSTER_ALLOWED_INDICATOR_LAYER_ID = "discovery-map-cluster-allowed-indicator";
const CLUSTER_WARNING_INDICATOR_LAYER_ID = "discovery-map-cluster-warning-indicator";
const UNCLUSTERED_CIRCLE_LAYER_ID = "discovery-map-lake-circles";
const SELECTED_HIGHLIGHT_LAYER_ID = "discovery-map-selected-highlight";
const SELECTED_LABEL_LAYER_ID = "discovery-map-selected-label";
const EMPTY_FEATURE_COLLECTION = {
  type: "FeatureCollection",
  features: [],
};

function createSelectedLakeFeature(lake, showHighlight = true, showLabel = true) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: lake.coordinates,
    },
    properties: {
      lakeId: lake.id,
      name: lake.name,
      showHighlight: showHighlight ? 1 : 0,
      showLabel: showLabel ? 1 : 0,
    },
  };
}

function MapView({
  lakes,
  lakeStatuses = {},
  onSelectLake,
  matchingLakeIds = [],
  hasSearch = false,
  userPosition = null,
  themeId,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const selectedHighlightTimeoutRef = useRef(null);
  const selectedLabelTimeoutRef = useRef(null);
  const [mapError, setMapError] = useState(false);
  const hasActiveFishingSelections = Object.values(lakeStatuses).some(
    (status) => status !== "neutral",
  );

  const lakeFeatureCollection = useMemo(() => {
    const matchingLakeIdSet = new Set(matchingLakeIds);

    return {
      type: "FeatureCollection",
      features: Object.values(lakes).map((lake) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: lake.coordinates,
        },
        properties: {
          lakeId: lake.id,
          name: lake.name,
          status: lakeStatuses[lake.id] ?? "unknown",
          isMatch: !hasSearch || matchingLakeIdSet.has(lake.id) ? 1 : 0,
        },
      })),
    };
  }, [hasSearch, lakeStatuses, lakes, matchingLakeIds]);

  const clearSelectedLakePreview = () => {
    if (selectedHighlightTimeoutRef.current) {
      window.clearTimeout(selectedHighlightTimeoutRef.current);
      selectedHighlightTimeoutRef.current = null;
    }

    if (selectedLabelTimeoutRef.current) {
      window.clearTimeout(selectedLabelTimeoutRef.current);
      selectedLabelTimeoutRef.current = null;
    }

    const map = mapRef.current;
    const source = map?.getSource(SELECTED_LAKE_SOURCE_ID);

    if (source) {
      source.setData(EMPTY_FEATURE_COLLECTION);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return undefined;
    }

    if (!supportsInteractiveMap()) {
      queueMicrotask(() => setMapError(true));
      return undefined;
    }

    let map;

    try {
      map = new Map({
        container: mapContainerRef.current,
        style: NATURAL_BASEMAP_STYLE_URL,
        center: [14.5, 57.2],
        zoom: 7.4,
      });
    } catch (error) {
      console.error("Kartan kunde inte startas:", error);
      queueMicrotask(() => setMapError(true));
      return undefined;
    }

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    map.addControl(
      new NavigationControl({
        showCompass: false,
      }),
      "bottom-right",
    );

    map.on("error", (event) => {
      console.error("Kartfel:", event.error);
    });

    map.on("style.load", () => {
      applyNaturalBasemapPalette(map);
    });

    requestAnimationFrame(() => {
      map.resize();
    });

    mapRef.current = map;

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }

      clearSelectedLakePreview();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return undefined;
    }

    const setSelectedLakeData = (featureCollection) => {
      const source = map.getSource(SELECTED_LAKE_SOURCE_ID);

      if (source) {
        source.setData(featureCollection);
      }
    };

    const showSelectedLakePreview = (lake) => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      clearSelectedLakePreview();
      setSelectedLakeData({
        type: "FeatureCollection",
        features: [createSelectedLakeFeature(lake)],
      });

      selectedHighlightTimeoutRef.current = window.setTimeout(() => {
        setSelectedLakeData({
          type: "FeatureCollection",
          features: [createSelectedLakeFeature(lake, false, true)],
        });
        selectedHighlightTimeoutRef.current = null;
      }, 180);

      selectedLabelTimeoutRef.current = window.setTimeout(() => {
        setSelectedLakeData(EMPTY_FEATURE_COLLECTION);
        selectedLabelTimeoutRef.current = null;
      }, prefersReducedMotion ? 220 : 700);
    };

    const ensureLakeSourcesAndLayers = () => {
      if (!map.isStyleLoaded()) {
        return false;
      }

      if (!map.getSource(LAKE_SOURCE_ID)) {
        map.addSource(LAKE_SOURCE_ID, {
          type: "geojson",
          data: EMPTY_FEATURE_COLLECTION,
          cluster: true,
          clusterRadius: 45,
          clusterMaxZoom: 13,
          clusterProperties: {
            matchingCount: [["+", ["accumulated"], ["get", "isMatch"]], ["get", "isMatch"]],
            allowedCount: [
              [
                "+",
                ["accumulated"],
                ["case", ["==", ["get", "status"], "allowed"], 1, 0],
              ],
              ["case", ["==", ["get", "status"], "allowed"], 1, 0],
            ],
            warningCount: [
              [
                "+",
                ["accumulated"],
                ["case", ["==", ["get", "status"], "warning"], 1, 0],
              ],
              ["case", ["==", ["get", "status"], "warning"], 1, 0],
            ],
          },
        });
      }

      const colors = getPikeMapColors();

      if (!map.getSource(SELECTED_LAKE_SOURCE_ID)) {
        map.addSource(SELECTED_LAKE_SOURCE_ID, {
          type: "geojson",
          data: EMPTY_FEATURE_COLLECTION,
        });
      }

      if (!map.getLayer(CLUSTER_CIRCLE_LAYER_ID)) {
        map.addLayer({
          id: CLUSTER_CIRCLE_LAYER_ID,
          type: "circle",
          source: LAKE_SOURCE_ID,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": colors.cluster,
            "circle-radius": [
              "step",
              ["get", "point_count"],
              16,
              5,
              20,
              10,
              24,
            ],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": colors.markerOutline,
            "circle-opacity": ["case", [">", ["get", "matchingCount"], 0], 1, 0.35],
            "circle-stroke-opacity": ["case", [">", ["get", "matchingCount"], 0], 1, 0.35],
          },
        });
      }

      if (!map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
        map.addLayer({
          id: CLUSTER_COUNT_LAYER_ID,
          type: "symbol",
          source: LAKE_SOURCE_ID,
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 11,
            "text-allow-overlap": true,
          },
          paint: {
            "text-color": colors.text,
            "text-halo-color": colors.labelHalo,
            "text-halo-width": 0.8,
            "text-opacity": ["case", [">", ["get", "matchingCount"], 0], 1, 0.45],
          },
        });
      }

      if (!map.getLayer(CLUSTER_ALLOWED_INDICATOR_LAYER_ID)) {
        map.addLayer({
          id: CLUSTER_ALLOWED_INDICATOR_LAYER_ID,
          type: "circle",
          source: LAKE_SOURCE_ID,
          filter: ["all", ["has", "point_count"], [">", ["get", "allowedCount"], 0]],
          layout: {
            visibility: hasActiveFishingSelections ? "visible" : "none",
          },
          paint: {
            "circle-color": colors.supported,
            "circle-radius": 3.5,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": colors.markerOutline,
            "circle-translate": [12, 12],
          },
        });
      }

      if (!map.getLayer(CLUSTER_WARNING_INDICATOR_LAYER_ID)) {
        map.addLayer({
          id: CLUSTER_WARNING_INDICATOR_LAYER_ID,
          type: "circle",
          source: LAKE_SOURCE_ID,
          filter: ["all", ["has", "point_count"], [">", ["get", "warningCount"], 0]],
          layout: {
            visibility: hasActiveFishingSelections ? "visible" : "none",
          },
          paint: {
            "circle-color": colors.warning,
            "circle-radius": 3.5,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": colors.markerOutline,
            "circle-translate": [18, 7],
          },
        });
      }

      map.setLayoutProperty(
        CLUSTER_ALLOWED_INDICATOR_LAYER_ID,
        "visibility",
        hasActiveFishingSelections ? "visible" : "none",
      );
      map.setLayoutProperty(
        CLUSTER_WARNING_INDICATOR_LAYER_ID,
        "visibility",
        hasActiveFishingSelections ? "visible" : "none",
      );

      if (!map.getLayer(UNCLUSTERED_CIRCLE_LAYER_ID)) {
        map.addLayer({
          id: UNCLUSTERED_CIRCLE_LAYER_ID,
          type: "circle",
          source: LAKE_SOURCE_ID,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "match",
              ["get", "status"],
              "allowed",
              colors.supported,
              "warning",
              colors.warning,
              colors.unknown,
            ],
            "circle-radius": 8,
            "circle-stroke-width": 2,
            "circle-stroke-color": colors.markerOutline,
            "circle-stroke-opacity": [
              "case",
              ["==", ["get", "isMatch"], 1],
              1,
              0.35,
            ],
            "circle-opacity": [
              "case",
              ["==", ["get", "isMatch"], 1],
              1,
              0.35,
            ],
          },
        });
      }

      if (!map.getLayer(SELECTED_HIGHLIGHT_LAYER_ID)) {
        map.addLayer({
          id: SELECTED_HIGHLIGHT_LAYER_ID,
          type: "circle",
          source: SELECTED_LAKE_SOURCE_ID,
          filter: ["==", ["get", "showHighlight"], 1],
          paint: {
            "circle-radius": 10.25,
            "circle-color": colors.selectionSoft,
            "circle-stroke-width": 2,
            "circle-stroke-color": colors.selection,
          },
        });
      }

      if (!map.getLayer(SELECTED_LABEL_LAYER_ID)) {
        map.addLayer({
          id: SELECTED_LABEL_LAYER_ID,
          type: "symbol",
          source: SELECTED_LAKE_SOURCE_ID,
          filter: ["==", ["get", "showLabel"], 1],
          layout: {
            "text-field": ["get", "name"],
            "text-size": 10,
            "text-offset": [0, -1.75],
            "text-anchor": "bottom",
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": colors.text,
            "text-halo-color": colors.labelHalo,
            "text-halo-width": 2.2,
          },
        });
      }

      const lakeSource = map.getSource(LAKE_SOURCE_ID);

      if (!lakeSource) {
        return false;
      }

      lakeSource.setData(lakeFeatureCollection);

      return true;
    };

    const expandCluster = async (clusterFeature) => {
      if (!clusterFeature || clusterFeature.geometry?.type !== "Point") {
        return;
      }

      const source = map.getSource(LAKE_SOURCE_ID);

      if (!source) {
        return;
      }

      try {
        const [longitude, latitude] = clusterFeature.geometry.coordinates;
        const zoom = await source.getClusterExpansionZoom(
          Number(clusterFeature.properties.cluster_id),
        );
        const targetZoom = Math.min(
          Math.max(zoom + 1.2, map.getZoom() + 2),
          14,
        );

        map.easeTo({
          center: [longitude, latitude],
          zoom: targetZoom,
          duration: 320,
          essential: true,
        });
      } catch (error) {
        console.error("Kunde inte expandera kluster:", error);
      }
    };

    const handleLakeSelection = (lakeFeature) => {
      const lakeId = lakeFeature?.properties?.lakeId;
      const lake = lakes[lakeId];

      if (!lake) {
        return;
      }

      showSelectedLakePreview(lake);

      map.flyTo({
        center: lake.coordinates,
        zoom: Math.max(map.getZoom(), 8.2),
        duration: 700,
        essential: true,
      });

      map.once("moveend", () => {
        onSelectLake(lake.id);
      });
    };

    const handleMapClick = async (event) => {
      const clickedFeature = map.queryRenderedFeatures(event.point, {
        layers: [
          SELECTED_LABEL_LAYER_ID,
          SELECTED_HIGHLIGHT_LAYER_ID,
          UNCLUSTERED_CIRCLE_LAYER_ID,
          CLUSTER_COUNT_LAYER_ID,
          CLUSTER_CIRCLE_LAYER_ID,
        ],
      })[0];

      if (!clickedFeature) {
        return;
      }

      if (
        clickedFeature.layer.id === CLUSTER_CIRCLE_LAYER_ID ||
        clickedFeature.layer.id === CLUSTER_COUNT_LAYER_ID
      ) {
        await expandCluster(clickedFeature);
        return;
      }

      handleLakeSelection(clickedFeature);
    };

    const handlePointerEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handlePointerLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const bindLakeEvents = () => {
      map.on("click", handleMapClick);
      map.on("mouseenter", CLUSTER_CIRCLE_LAYER_ID, handlePointerEnter);
      map.on("mouseenter", CLUSTER_COUNT_LAYER_ID, handlePointerEnter);
      map.on("mouseenter", UNCLUSTERED_CIRCLE_LAYER_ID, handlePointerEnter);
      map.on("mouseenter", SELECTED_HIGHLIGHT_LAYER_ID, handlePointerEnter);
      map.on("mouseenter", SELECTED_LABEL_LAYER_ID, handlePointerEnter);
      map.on("mouseleave", CLUSTER_CIRCLE_LAYER_ID, handlePointerLeave);
      map.on("mouseleave", CLUSTER_COUNT_LAYER_ID, handlePointerLeave);
      map.on("mouseleave", UNCLUSTERED_CIRCLE_LAYER_ID, handlePointerLeave);
      map.on("mouseleave", SELECTED_HIGHLIGHT_LAYER_ID, handlePointerLeave);
      map.on("mouseleave", SELECTED_LABEL_LAYER_ID, handlePointerLeave);
    };

    const unbindLakeEvents = () => {
      map.off("click", handleMapClick);
      map.off("mouseenter", CLUSTER_CIRCLE_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", CLUSTER_COUNT_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", UNCLUSTERED_CIRCLE_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", SELECTED_HIGHLIGHT_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", SELECTED_LABEL_LAYER_ID, handlePointerEnter);
      map.off("mouseleave", CLUSTER_CIRCLE_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", CLUSTER_COUNT_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", UNCLUSTERED_CIRCLE_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", SELECTED_HIGHLIGHT_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", SELECTED_LABEL_LAYER_ID, handlePointerLeave);
      map.getCanvas().style.cursor = "";
    };

    const initializeLakeRendering = () => {
      if (!ensureLakeSourcesAndLayers()) {
        return;
      }

      bindLakeEvents();
    };

    if (map.isStyleLoaded()) {
      initializeLakeRendering();
    } else {
      map.once("load", initializeLakeRendering);
    }

    return () => {
      map.off("load", initializeLakeRendering);
      unbindLakeEvents();
    };
  }, [hasActiveFishingSelections, hasSearch, lakeFeatureCollection, lakes, onSelectLake]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return undefined;
    }

    const updateOverlayTheme = () => {
      const colors = getPikeMapColors();

      if (map.getLayer(CLUSTER_CIRCLE_LAYER_ID)) {
        map.setPaintProperty(CLUSTER_CIRCLE_LAYER_ID, "circle-color", colors.cluster);
        map.setPaintProperty(
          CLUSTER_CIRCLE_LAYER_ID,
          "circle-stroke-color",
          colors.markerOutline,
        );
      }

      if (map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
        map.setPaintProperty(CLUSTER_COUNT_LAYER_ID, "text-color", colors.text);
        map.setPaintProperty(CLUSTER_COUNT_LAYER_ID, "text-halo-color", colors.labelHalo);
      }

      if (map.getLayer(CLUSTER_ALLOWED_INDICATOR_LAYER_ID)) {
        map.setPaintProperty(
          CLUSTER_ALLOWED_INDICATOR_LAYER_ID,
          "circle-color",
          colors.supported,
        );
        map.setPaintProperty(
          CLUSTER_ALLOWED_INDICATOR_LAYER_ID,
          "circle-stroke-color",
          colors.markerOutline,
        );
      }

      if (map.getLayer(CLUSTER_WARNING_INDICATOR_LAYER_ID)) {
        map.setPaintProperty(
          CLUSTER_WARNING_INDICATOR_LAYER_ID,
          "circle-color",
          colors.warning,
        );
        map.setPaintProperty(
          CLUSTER_WARNING_INDICATOR_LAYER_ID,
          "circle-stroke-color",
          colors.markerOutline,
        );
      }

      if (map.getLayer(UNCLUSTERED_CIRCLE_LAYER_ID)) {
        map.setPaintProperty(UNCLUSTERED_CIRCLE_LAYER_ID, "circle-color", [
          "match",
          ["get", "status"],
          "allowed",
          colors.supported,
          "warning",
          colors.warning,
          colors.unknown,
        ]);
        map.setPaintProperty(
          UNCLUSTERED_CIRCLE_LAYER_ID,
          "circle-stroke-color",
          colors.markerOutline,
        );
      }

      if (map.getLayer(SELECTED_HIGHLIGHT_LAYER_ID)) {
        map.setPaintProperty(
          SELECTED_HIGHLIGHT_LAYER_ID,
          "circle-color",
          colors.selectionSoft,
        );
        map.setPaintProperty(
          SELECTED_HIGHLIGHT_LAYER_ID,
          "circle-stroke-color",
          colors.selection,
        );
      }

      if (map.getLayer(SELECTED_LABEL_LAYER_ID)) {
        map.setPaintProperty(SELECTED_LABEL_LAYER_ID, "text-color", colors.text);
        map.setPaintProperty(SELECTED_LABEL_LAYER_ID, "text-halo-color", colors.labelHalo);
      }
    };

    const animationFrame = window.requestAnimationFrame(updateOverlayTheme);
    map.on("load", updateOverlayTheme);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      map.off("load", updateOverlayTheme);
    };
  }, [themeId]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !userPosition) {
      return;
    }

    const [longitude, latitude] = userPosition;

    if (!userMarkerRef.current) {
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.className = "map-user-marker";

      userMarkerRef.current = new Marker({ element: markerElement })
        .setLngLat([longitude, latitude])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([longitude, latitude]);
    }

    map.flyTo({
      center: [longitude, latitude],
      zoom: 9.2,
      duration: 700,
      essential: true,
    });
  }, [userPosition]);

  if (mapError) {
    return (
      <MapPlaceholder
        lakes={lakes}
        lakeStatuses={lakeStatuses}
        onSelectLake={onSelectLake}
        matchingLakeIds={matchingLakeIds}
        hasSearch={hasSearch}
      />
    );
  }

  return (
    <section className="map-view-shell">
      <div ref={mapContainerRef} className="map-view" />
    </section>
  );
}

export default MapView;
