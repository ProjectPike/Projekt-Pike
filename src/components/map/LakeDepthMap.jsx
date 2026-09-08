import { useState } from "react";

const ZOOM_LEVELS = [1, 1.5, 2.25, 3];

function LakeDepthMap({ lake, depthMap, onBack }) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = ZOOM_LEVELS[zoomIndex];

  return (
    <section className="lake-depth-map-shell">
      <header className="lake-map-topbar">
        <button className="round-button" onClick={onBack} aria-label="Tillbaka">
          ←
        </button>
        <strong>{lake.name} · djupkarta</strong>
        <a
          className="round-button lake-depth-map-source-link"
          href={depthMap.sourceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Öppna originalkällan"
          title="Öppna originalkällan"
        >
          ↗
        </a>
      </header>

      <div className="lake-depth-map-viewport">
        <img
          src={depthMap.imageUrl}
          alt={`Bearbetad djupkarta för ${lake.name} från ${depthMap.year}`}
          style={{ width: `${zoom * 100}%` }}
          draggable="false"
        />
      </div>

      <footer className="lake-depth-map-controls">
        <span>
          <strong>Historiskt underlag från {depthMap.year}</strong>
          <small>{depthMap.sourceLabel} · Ej för navigering</small>
        </span>
        <div aria-label="Zooma djupkartan">
          <button
            onClick={() => setZoomIndex((current) => Math.max(0, current - 1))}
            disabled={zoomIndex === 0}
            aria-label="Zooma ut"
          >
            −
          </button>
          <output>{Math.round(zoom * 100)}%</output>
          <button
            onClick={() =>
              setZoomIndex((current) => Math.min(ZOOM_LEVELS.length - 1, current + 1))
            }
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            aria-label="Zooma in"
          >
            +
          </button>
        </div>
      </footer>
    </section>
  );
}

export default LakeDepthMap;
