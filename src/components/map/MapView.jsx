import { useEffect, useRef } from "react";
import { Map, Marker, NavigationControl, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(workerUrl);

function MapView({
  lakes,
  onSelectLake,
  matchingLakeIds = [],
  hasSearch = false,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return undefined;
    }

    const map = new Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [14.16, 57.78],
      zoom: 7.6,
    });

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
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    if (markersRef.current.length === 0) {
      const lakeEntries = Object.values(lakes);

      markersRef.current = lakeEntries.map((lake) => {
        const markerElement = document.createElement("button");
        markerElement.type = "button";
        markerElement.style.width = "16px";
        markerElement.style.height = "16px";
        markerElement.style.border = "2px solid #ffffff";
        markerElement.style.borderRadius = "50%";
        markerElement.style.background = "#85bdd9";
        markerElement.style.boxShadow = "0 0 0 2px rgba(0, 0, 0, 0.2)";
        markerElement.style.cursor = "pointer";
        markerElement.style.padding = "0";
        markerElement.style.opacity = "1";

        markerElement.addEventListener("click", () => {
          onSelectLake(lake.id);
        });

        return new Marker({ element: markerElement })
          .setLngLat(lake.coordinates)
          .addTo(map);
      });
    }

    markersRef.current.forEach((marker, index) => {
      const lakeId = Object.values(lakes)[index].id;
      const isMatch = !hasSearch || matchingLakeIds.includes(lakeId);
      const element = marker.getElement();

      element.style.opacity = hasSearch && !isMatch ? "0.35" : "1";
      element.style.filter =
        hasSearch && !isMatch ? "saturate(0.55)" : "saturate(1.12) brightness(1.08)";
    });
  }, [lakes, matchingLakeIds, hasSearch, onSelectLake]);

  return <section className="map-view-shell"><div ref={mapContainerRef} className="map-view" /></section>;
}

export default MapView;