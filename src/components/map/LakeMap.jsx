import { useEffect, useMemo, useRef, useState } from "react";
import {
  GeolocateControl,
  Map,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  getLakePointLayers,
  getLakePoints,
  getPointTypeLabel,
  getPointTypes,
} from "../../data/lakePoints";
import {
  getLakeBathymetryStatus,
  getLakeDepthMap,
} from "../../data/lakeDepthMaps";
import { supportsInteractiveMap } from "../../utils/mapSupport";
import {
  applyNaturalBasemapPalette,
  getPikeMapColors,
  NATURAL_BASEMAP_STYLE_URL,
} from "./mapTheme";

setWorkerUrl(workerUrl);

const POINT_SOURCE_ID = "lake-map-points";
const CLUSTER_CIRCLE_LAYER_ID = "lake-map-point-clusters";
const CLUSTER_COUNT_LAYER_ID = "lake-map-point-cluster-count";
const UNCLUSTERED_CIRCLE_LAYER_ID = "lake-map-point-unclustered-circle";
const UNCLUSTERED_SYMBOL_LAYER_ID = "lake-map-point-unclustered-symbol";
const DEPTH_MAP_SOURCE_ID = "lake-depth-map";
const DEPTH_MAP_CONTOUR_LAYER_ID = "lake-depth-map-contours";
const DEPTH_MAP_LABEL_LAYER_ID = "lake-depth-map-labels";
const EMPTY_FEATURE_COLLECTION = {
  type: "FeatureCollection",
  features: [],
};

const LAKE_MAP_ZOOM_BY_ID = {
  bolmen: 10,
  bunn: 11,
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
};

function getLakeMapZoom(lakeId) {
  return LAKE_MAP_ZOOM_BY_ID[lakeId] ?? 12;
}

function createPopupContent(featureProperties) {
  const popupContent = document.createElement("div");
  popupContent.className = "lake-point-popup-content";

  const title = document.createElement("strong");
  title.textContent = featureProperties.name || featureProperties.typeLabel;
  popupContent.appendChild(title);

  if (featureProperties.note) {
    const note = document.createElement("p");
    note.textContent = featureProperties.note;
    popupContent.appendChild(note);
  }

  if (featureProperties.typeLabel) {
    const type = document.createElement("small");
    type.textContent = featureProperties.typeLabel;
    popupContent.appendChild(type);
  }

  const actions = document.createElement("div");
  actions.className = "lake-point-popup-actions";

  const directions = document.createElement("a");
  directions.href = `https://www.google.com/maps/dir/?api=1&destination=${featureProperties.latitude},${featureProperties.longitude}`;
  directions.target = "_blank";
  directions.rel = "noreferrer";
  directions.textContent = "Vägbeskrivning";
  actions.appendChild(directions);

  if (featureProperties.source) {
    const source = document.createElement("a");
    source.href = featureProperties.source;
    source.target = "_blank";
    source.rel = "noreferrer";
    source.textContent = "Källa";
    actions.appendChild(source);
  }

  popupContent.appendChild(actions);

  return popupContent;
}

function LakeMap({ lake, onBack, themeId, depthMapLocked = false }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const availableLayers = useMemo(() => getLakePointLayers(lake.id), [lake.id]);
  const lakePoints = useMemo(() => getLakePoints(lake.id), [lake.id]);
  const depthMap = useMemo(() => getLakeDepthMap(lake.id), [lake.id]);
  const bathymetryStatus = useMemo(
    () => getLakeBathymetryStatus(lake.id),
    [lake.id],
  );
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isDepthMapVisible, setIsDepthMapVisible] = useState(
    Boolean(depthMap) && !depthMapLocked,
  );
  const [activeLayerIds, setActiveLayerIds] = useState(() =>
    getLakePointLayers(lake.id).map((layer) => layer.id),
  );

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
        center: lake.coordinates,
        zoom: getLakeMapZoom(lake.id),
      });
    } catch (error) {
      console.error("Sjökartan kunde inte startas:", error);
      queueMicrotask(() => setMapError(true));
      return undefined;
    }

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    map.addControl(
      new GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true,
        fitBoundsOptions: {
          maxZoom: 15.5,
        },
      }),
      "bottom-right",
    );

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

    const focusLake = () => {
      map.resize();
      map.jumpTo({
        center: lake.coordinates,
        zoom: getLakeMapZoom(lake.id),
      });
    };

    map.once("load", focusLake);
    requestAnimationFrame(focusLake);

    mapRef.current = map;

    return () => {
      map.off("load", focusLake);
      map.remove();
      mapRef.current = null;
    };
  }, [lake.coordinates, lake.id]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !depthMap || depthMapLocked) {
      return undefined;
    }

    const ensureDepthMap = () => {
      if (!map.isStyleLoaded()) {
        return;
      }

      if (!map.getSource(DEPTH_MAP_SOURCE_ID)) {
        map.addSource(DEPTH_MAP_SOURCE_ID, {
          type: "geojson",
          data: depthMap.dataUrl,
        });
      }

      const colors = getPikeMapColors();

      if (!map.getLayer(DEPTH_MAP_CONTOUR_LAYER_ID)) {
        map.addLayer({
          id: DEPTH_MAP_CONTOUR_LAYER_ID,
          type: "line",
          source: DEPTH_MAP_SOURCE_ID,
          filter: ["==", ["get", "kind"], "contour"],
          layout: {
            visibility: isDepthMapVisible && !depthMapLocked ? "visible" : "none",
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": colors.bathymetryContour,
            "line-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              9,
              0.62,
              13,
              0.82,
              16,
              0.94,
            ],
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              9,
              0.65,
              13,
              1,
              16,
              1.35,
            ],
          },
        });
      }

      if (!map.getLayer(DEPTH_MAP_LABEL_LAYER_ID)) {
        map.addLayer({
          id: DEPTH_MAP_LABEL_LAYER_ID,
          type: "symbol",
          source: DEPTH_MAP_SOURCE_ID,
          minzoom: 11.2,
          filter: ["==", ["get", "kind"], "contour"],
          layout: {
            visibility: isDepthMapVisible && !depthMapLocked ? "visible" : "none",
            "symbol-placement": "line",
            // Labels stay upright regardless of contour direction/map pitch;
            // spacing still follows the line so density scales with zoom.
            "text-rotation-alignment": "viewport",
            "text-pitch-alignment": "viewport",
            "symbol-spacing": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11.2,
              1100,
              13,
              680,
              16,
              340,
            ],
            "text-field": ["to-string", ["get", "depth"]],
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              11.2,
              11,
              15,
              14,
            ],
            "text-padding": 10,
            "text-allow-overlap": false,
            "text-ignore-placement": false,
          },
          paint: {
            "text-color": colors.bathymetryLabel,
            "text-halo-color": colors.bathymetryHalo,
            "text-halo-width": 1.4,
            "text-halo-blur": 0,
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      ensureDepthMap();
    } else {
      map.once("load", ensureDepthMap);
    }

    return () => {
      map.off("load", ensureDepthMap);
    };
  }, [depthMap, depthMapLocked, isDepthMapVisible]);

  useEffect(() => {
    const map = mapRef.current;

    [DEPTH_MAP_CONTOUR_LAYER_ID, DEPTH_MAP_LABEL_LAYER_ID].forEach((layerId) => {
      if (map?.getLayer(layerId)) {
        map.setLayoutProperty(
          layerId,
          "visibility",
          isDepthMapVisible && !depthMapLocked ? "visible" : "none",
        );
      }
    });
  }, [depthMapLocked, isDepthMapVisible]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return undefined;
    }

    popupRef.current?.remove();
    popupRef.current = null;

    const visiblePoints = lakePoints.filter((point) =>
      getPointTypes(point).some((type) => activeLayerIds.includes(type)),
    );

    const featureCollection = {
      type: "FeatureCollection",
      features: visiblePoints.map((point) => {
        const pointTypes = getPointTypes(point);
        const displayType =
          pointTypes.find((type) => activeLayerIds.includes(type)) ?? point.type;

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: point.coordinates,
          },
          properties: {
            pointId: point.id,
            type: displayType,
            name: point.name || getPointTypeLabel(point.type),
            note: point.note ?? "",
            typeLabel: pointTypes.map(getPointTypeLabel).join(" · "),
            source: point.source ?? "",
            longitude: point.coordinates[0],
            latitude: point.coordinates[1],
          },
        };
      }),
    };

    const ensurePointSourceAndLayers = () => {
      if (!map.isStyleLoaded()) {
        return false;
      }

      if (!map.getSource(POINT_SOURCE_ID)) {
        map.addSource(POINT_SOURCE_ID, {
          type: "geojson",
          data: EMPTY_FEATURE_COLLECTION,
          cluster: true,
          clusterRadius: 45,
          clusterMaxZoom: 13,
        });
      }

      const colors = getPikeMapColors();

      if (!map.getLayer(CLUSTER_CIRCLE_LAYER_ID)) {
        map.addLayer({
          id: CLUSTER_CIRCLE_LAYER_ID,
          type: "circle",
          source: POINT_SOURCE_ID,
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
          },
        });
      }

      if (!map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
        map.addLayer({
          id: CLUSTER_COUNT_LAYER_ID,
          type: "symbol",
          source: POINT_SOURCE_ID,
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
          },
        });
      }

      if (!map.getLayer(UNCLUSTERED_CIRCLE_LAYER_ID)) {
        map.addLayer({
          id: UNCLUSTERED_CIRCLE_LAYER_ID,
          type: "circle",
          source: POINT_SOURCE_ID,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              "match",
              ["get", "type"],
              "boat-ramp",
              colors.pointRamp,
              "parking",
              colors.pointParking,
              "bathing-area",
              colors.pointBathing,
              "shore-access",
              colors.pointAccess,
              "boat-rental",
              colors.pointRental,
              colors.cluster,
            ],
            "circle-radius": 12,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": colors.markerOutline,
          },
        });
      }

      if (!map.getLayer(UNCLUSTERED_SYMBOL_LAYER_ID)) {
        map.addLayer({
          id: UNCLUSTERED_SYMBOL_LAYER_ID,
          type: "symbol",
          source: POINT_SOURCE_ID,
          filter: ["!", ["has", "point_count"]],
          layout: {
            "text-field": [
              "match",
              ["get", "type"],
              "parking",
              "P",
              "boat-ramp",
              "R",
              "bathing-area",
              "B",
              "shore-access",
              "Å",
              "boat-rental",
              "H",
              "•",
            ],
            "text-size": 12,
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: {
            "text-color": colors.text,
            "text-halo-color": colors.labelHalo,
            "text-halo-width": 0.9,
          },
        });
      }

      const source = map.getSource(POINT_SOURCE_ID);

      if (!source) {
        return false;
      }

      source.setData(featureCollection);
      return true;
    };

    const expandCluster = async (clusterFeature) => {
      if (!clusterFeature || clusterFeature.geometry?.type !== "Point") {
        return;
      }

      const source = map.getSource(POINT_SOURCE_ID);

      if (!source) {
        return;
      }

      try {
        const [longitude, latitude] = clusterFeature.geometry.coordinates;
        const expansionZoom = await source.getClusterExpansionZoom(
          Number(clusterFeature.properties.cluster_id),
        );
        const targetZoom = Math.min(expansionZoom + 2, map.getMaxZoom());

        map.easeTo({
          center: [longitude, latitude],
          zoom: targetZoom,
        });
      } catch (error) {
        console.error("Kunde inte expandera kluster:", error);
      }
    };

    const openPointPopup = (pointFeature) => {
      if (!pointFeature || pointFeature.geometry?.type !== "Point") {
        return;
      }

      const [longitude, latitude] = pointFeature.geometry.coordinates;
      const featureProperties = pointFeature.properties ?? {};

      popupRef.current?.remove();

      const popup = new Popup({
        closeButton: false,
        offset: [0, -8],
        className: "lake-point-popup",
      });

      popup
        .setLngLat([longitude, latitude])
        .setDOMContent(createPopupContent(featureProperties))
        .addTo(map);

      popupRef.current = popup;
    };

    const handleMapClick = async (event) => {
      const clickedFeature = map.queryRenderedFeatures(event.point, {
        layers: [
          UNCLUSTERED_SYMBOL_LAYER_ID,
          UNCLUSTERED_CIRCLE_LAYER_ID,
          CLUSTER_COUNT_LAYER_ID,
          CLUSTER_CIRCLE_LAYER_ID,
        ],
      })[0];

      if (!clickedFeature) {
        return;
      }

      if (clickedFeature.layer.id === CLUSTER_CIRCLE_LAYER_ID || clickedFeature.layer.id === CLUSTER_COUNT_LAYER_ID) {
        await expandCluster(clickedFeature);
        return;
      }

      openPointPopup(clickedFeature);
    };

    const handlePointerEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handlePointerLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const bindLayerEvents = () => {
      map.on("click", handleMapClick);
      map.on("mouseenter", CLUSTER_CIRCLE_LAYER_ID, handlePointerEnter);
      map.on("mouseenter", CLUSTER_COUNT_LAYER_ID, handlePointerEnter);
      map.on("mouseenter", UNCLUSTERED_CIRCLE_LAYER_ID, handlePointerEnter);
      map.on("mouseenter", UNCLUSTERED_SYMBOL_LAYER_ID, handlePointerEnter);
      map.on("mouseleave", CLUSTER_CIRCLE_LAYER_ID, handlePointerLeave);
      map.on("mouseleave", CLUSTER_COUNT_LAYER_ID, handlePointerLeave);
      map.on("mouseleave", UNCLUSTERED_CIRCLE_LAYER_ID, handlePointerLeave);
      map.on("mouseleave", UNCLUSTERED_SYMBOL_LAYER_ID, handlePointerLeave);
    };

    const unbindLayerEvents = () => {
      map.off("click", handleMapClick);
      map.off("mouseenter", CLUSTER_CIRCLE_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", CLUSTER_COUNT_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", UNCLUSTERED_CIRCLE_LAYER_ID, handlePointerEnter);
      map.off("mouseenter", UNCLUSTERED_SYMBOL_LAYER_ID, handlePointerEnter);
      map.off("mouseleave", CLUSTER_CIRCLE_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", CLUSTER_COUNT_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", UNCLUSTERED_CIRCLE_LAYER_ID, handlePointerLeave);
      map.off("mouseleave", UNCLUSTERED_SYMBOL_LAYER_ID, handlePointerLeave);
      map.getCanvas().style.cursor = "";
    };

    const initializePointRendering = () => {
      if (!ensurePointSourceAndLayers()) {
        return;
      }

      bindLayerEvents();
    };

    if (map.isStyleLoaded()) {
      initializePointRendering();
    } else {
      map.once("load", initializePointRendering);
    }

    return () => {
      map.off("load", initializePointRendering);
      unbindLayerEvents();
      popupRef.current?.remove();
      popupRef.current = null;
    };
  }, [activeLayerIds, lake.id, lakePoints]);

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

      if (map.getLayer(UNCLUSTERED_CIRCLE_LAYER_ID)) {
        map.setPaintProperty(UNCLUSTERED_CIRCLE_LAYER_ID, "circle-color", [
          "match",
          ["get", "type"],
          "boat-ramp",
          colors.pointRamp,
          "parking",
          colors.pointParking,
          "bathing-area",
          colors.pointBathing,
          "shore-access",
          colors.pointAccess,
          "boat-rental",
          colors.pointRental,
          colors.cluster,
        ]);
        map.setPaintProperty(
          UNCLUSTERED_CIRCLE_LAYER_ID,
          "circle-stroke-color",
          colors.markerOutline,
        );
      }

      if (map.getLayer(UNCLUSTERED_SYMBOL_LAYER_ID)) {
        map.setPaintProperty(UNCLUSTERED_SYMBOL_LAYER_ID, "text-color", colors.text);
        map.setPaintProperty(UNCLUSTERED_SYMBOL_LAYER_ID, "text-halo-color", colors.labelHalo);
      }

      if (map.getLayer(DEPTH_MAP_CONTOUR_LAYER_ID)) {
        map.setPaintProperty(
          DEPTH_MAP_CONTOUR_LAYER_ID,
          "line-color",
          colors.bathymetryContour,
        );
      }

      if (map.getLayer(DEPTH_MAP_LABEL_LAYER_ID)) {
        map.setPaintProperty(
          DEPTH_MAP_LABEL_LAYER_ID,
          "text-color",
          colors.bathymetryContour,
        );
        map.setPaintProperty(
          DEPTH_MAP_LABEL_LAYER_ID,
          "text-halo-color",
          colors.bathymetryHalo,
        );
      }
    };

    const animationFrame = window.requestAnimationFrame(updateOverlayTheme);
    map.on("load", updateOverlayTheme);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      map.off("load", updateOverlayTheme);
    };
  }, [themeId]);

  const toggleLayer = (layerId) => {
    setActiveLayerIds((current) =>
      current.includes(layerId)
        ? current.filter((id) => id !== layerId)
        : [...current, layerId],
    );
  };

  return (
    <section className="lake-map-shell">
      <div className="lake-map-topbar">
        <button className="round-button" onClick={onBack} aria-label="Tillbaka">
          ←
        </button>

        <strong>{lake.name}</strong>

        <button
          className="round-button"
          aria-label="Lager"
          onClick={() => setIsLayersOpen((current) => !current)}
        >
          ☰
        </button>
      </div>

      {isLayersOpen ? (
        <div className="lake-map-layers" role="dialog" aria-label="Lager">
          <h2>Lager</h2>

          <div className="lake-map-layer-list">
            {depthMap ? (
              <label className="lake-map-layer-toggle lake-map-depth-toggle">
                <input
                  type="checkbox"
                  checked={!depthMapLocked && isDepthMapVisible}
                  disabled={depthMapLocked}
                  onChange={() => setIsDepthMapVisible((current) => !current)}
                />
                <span>
                  {depthMapLocked ? "Djupkarta 🔒" : `Djupkarta (${depthMap.year})`}
                  <small>{depthMapLocked ? "Låst" : "Djup i meter"}</small>
                </span>
              </label>
            ) : (
              <p title={bathymetryStatus.note}>{bathymetryStatus.message}</p>
            )}

            {availableLayers.map((layer) => (
              <label className="lake-map-layer-toggle" key={layer.id}>
                <input
                  type="checkbox"
                  checked={activeLayerIds.includes(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                />
                <span>
                  {layer.label} ({layer.points.length})
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {depthMap && (!mapError || depthMapLocked) ? (
        <button
          type="button"
          className={`lake-map-depth-control${
            isDepthMapVisible && !depthMapLocked ? " is-active" : ""
          }`}
          aria-pressed={depthMapLocked ? undefined : isDepthMapVisible}
          aria-label={
            depthMapLocked
              ? "Djupkarta låst"
              : `${isDepthMapVisible ? "Dölj" : "Visa"} djupkarta`
          }
          disabled={depthMapLocked}
          onClick={() => setIsDepthMapVisible((current) => !current)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 7c3-3 6-3 9 0s6 3 9 0" />
            <path d="M3 12c3-3 6-3 9 0s6 3 9 0" />
            <path d="M3 17c3-3 6-3 9 0s6 3 9 0" />
          </svg>
          <span>{depthMapLocked ? "Djupkarta 🔒" : "Djupkarta"}</span>
          {depthMapLocked ? null : <small>{isDepthMapVisible ? "På" : "Av"}</small>}
        </button>
      ) : null}

      {mapError ? (
        <div className="lake-map-fallback" role="status">
          <p>Kartan stöds inte i den här webbläsaren.</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${lake.coordinates[1]},${lake.coordinates[0]}`}
            target="_blank"
            rel="noreferrer"
          >
            Öppna {lake.name} i Google Maps
          </a>
          {depthMap && !depthMapLocked ? (
            <a href={depthMap.sourceUrl} target="_blank" rel="noreferrer">
              Öppna originalets djupkarta
            </a>
          ) : null}
        </div>
      ) : (
        <div ref={mapContainerRef} className="lake-map-view" />
      )}

      {depthMap && isDepthMapVisible && !depthMapLocked && !mapError ? (
        <aside className="lake-map-depth-source" title={depthMap.note}>
          <strong>Djup i meter</strong>
          <span>
            Djupdata: SMHI · karta {depthMap.sourceMapNumber} · Bearbetad för
            Pike · Verifierad {depthMap.verifiedAt}
          </span>
          <div>
            <a href={depthMap.sourceUrl} target="_blank" rel="noreferrer">
              Källa
            </a>
            <a href={depthMap.licenseUrl} target="_blank" rel="noreferrer">
              {depthMap.licenseLabel}
            </a>
          </div>
        </aside>
      ) : null}

      <div className="lake-map-footer">
        <small>{lakePoints.length > 0 ? "Verifierade platser" : "Kartläge"}</small>
        <strong>
          {lakePoints.length > 0
            ? `${lakePoints.length} platser · Tryck på en markör`
            : "Inga verifierade platser ännu"}
        </strong>
      </div>
    </section>
  );
}

export default LakeMap;
