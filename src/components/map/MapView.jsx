import { useEffect, useMemo, useRef } from "react";
import { Map, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(workerUrl);

const LAKE_SOURCE_ID = "discovery-map-lakes";
const SELECTED_LAKE_SOURCE_ID = "discovery-map-selected-lake";
const CLUSTER_CIRCLE_LAYER_ID = "discovery-map-clusters";
const CLUSTER_COUNT_LAYER_ID = "discovery-map-cluster-count";
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
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const selectedHighlightTimeoutRef = useRef(null);
  const selectedLabelTimeoutRef = useRef(null);

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

    const map = new Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [14.5, 57.2],
      zoom: 7.4,
    });

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
          },
        });
      }

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
            "circle-color": "#123f56",
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
            "circle-stroke-color": "rgba(255, 255, 255, 0.82)",
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
            "text-color": "#f2f7fb",
            "text-halo-color": "rgba(7, 26, 42, 0.8)",
            "text-halo-width": 0.8,
            "text-opacity": ["case", [">", ["get", "matchingCount"], 0], 1, 0.45],
          },
        });
      }

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
              "#7fbf8b",
              "warning",
              "#dba55d",
              "#8b95a2",
            ],
            "circle-radius": 8,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
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
            "circle-color": "rgba(255, 255, 255, 0.08)",
            "circle-stroke-width": 2,
            "circle-stroke-color": "rgba(255, 255, 255, 0.82)",
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
            "text-color": "#f3f6f6",
            "text-halo-color": "rgba(10, 19, 24, 0.92)",
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

        map.easeTo({
          center: [longitude, latitude],
          zoom,
          duration: 500,
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
  }, [hasSearch, lakeFeatureCollection, lakes, onSelectLake]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !userPosition) {
      return;
    }

    const [longitude, latitude] = userPosition;

    if (!userMarkerRef.current) {
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.style.width = "12px";
      markerElement.style.height = "12px";
      markerElement.style.border = "2px solid #d4f8ff";
      markerElement.style.borderRadius = "50%";
      markerElement.style.background = "#87d596";
      markerElement.style.boxShadow = "0 0 0 3px rgba(0, 0, 0, 0.24)";
      markerElement.style.padding = "0";
      markerElement.style.cursor = "auto";

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

  return (
    <section className="map-view-shell">
      <div ref={mapContainerRef} className="map-view" />
    </section>
  );
}

export default MapView;