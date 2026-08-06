import { useEffect, useRef } from "react";
import { Map, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

function MapView() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

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

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapContainerRef} className="map-view" />;
}

export default MapView;