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
  userPosition = null,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

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

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }

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
          const map = mapRef.current;

          markerElement.classList.add("map-marker-selected");
          window.setTimeout(() => {
            markerElement.classList.remove("map-marker-selected");
          }, 180);

          if (!map) {
            onSelectLake(lake.id);
            return;
          }

          map.flyTo({
            center: lake.coordinates,
            zoom: Math.max(map.getZoom(), 8.2),
            duration: 700,
            essential: true,
          });

          map.once("moveend", () => {
            onSelectLake(lake.id);
          });
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

  return <section className="map-view-shell"><div ref={mapContainerRef} className="map-view" /></section>;
}

export default MapView;