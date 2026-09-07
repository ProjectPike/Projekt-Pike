import { useEffect, useMemo, useRef, useState } from "react";
import { Map, NavigationControl, Popup, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  getLakePointLayers,
  getLakePoints,
  getPointTypeLabel,
  getPointTypes,
} from "../../data/lakePoints";
import { supportsInteractiveMap } from "../../utils/mapSupport";

setWorkerUrl(workerUrl);

const POINT_SOURCE_ID = "lake-map-points";
const CLUSTER_CIRCLE_LAYER_ID = "lake-map-point-clusters";
const CLUSTER_COUNT_LAYER_ID = "lake-map-point-cluster-count";
const UNCLUSTERED_CIRCLE_LAYER_ID = "lake-map-point-unclustered-circle";
const UNCLUSTERED_SYMBOL_LAYER_ID = "lake-map-point-unclustered-symbol";
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

function LakeMap({ lake, onBack }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const availableLayers = useMemo(() => getLakePointLayers(lake.id), [lake.id]);
  const lakePoints = useMemo(() => getLakePoints(lake.id), [lake.id]);
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [mapError, setMapError] = useState(false);
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
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center: lake.coordinates,
        zoom: getLakeMapZoom(lake.id),
        attributionControl: false,
      });
    } catch (error) {
      console.error("Sjökartan kunde inte startas:", error);
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

      if (!map.getLayer(CLUSTER_CIRCLE_LAYER_ID)) {
        map.addLayer({
          id: CLUSTER_CIRCLE_LAYER_ID,
          type: "circle",
          source: POINT_SOURCE_ID,
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
            "text-color": "#f2f7fb",
            "text-halo-color": "rgba(7, 26, 42, 0.8)",
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
              "#1c526e",
              "parking",
              "#295068",
              "bathing-area",
              "#16747f",
              "shore-access",
              "#34705b",
              "boat-rental",
              "#4f5f91",
              "#1a4d67",
            ],
            "circle-radius": 12,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "rgba(255, 255, 255, 0.7)",
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
            "text-color": "#f2f7fb",
            "text-halo-color": "rgba(7, 26, 42, 0.8)",
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

          {availableLayers.length === 0 ? (
            <p>Inga tillgängliga lager för den här sjön ännu.</p>
          ) : (
            <div className="lake-map-layer-list">
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
          )}
        </div>
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
        </div>
      ) : (
        <div ref={mapContainerRef} className="lake-map-view" />
      )}

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
