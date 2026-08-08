import { useEffect, useRef, useState } from "react";
import { Map, NavigationControl, setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(workerUrl);

function LakeMap({ lake, fishingChoices, onBack }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return undefined;
    }

    const map = new Map({
      container: mapContainerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: lake.coordinates,
      zoom: 10,
      attributionControl: false,
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
      map.remove();
      mapRef.current = null;
    };
  }, [lake.coordinates]);

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
          <p>Inga extra lager tillgängliga ännu.</p>
        </div>
      ) : null}

      <div ref={mapContainerRef} className="lake-map-view" />

      <div className="lake-map-footer">
        <small>Mitt fiske</small>
        <strong>
          {fishingChoices.place} · {fishingChoices.method} · {fishingChoices.species}
        </strong>
      </div>
    </section>
  );
}

export default LakeMap;
