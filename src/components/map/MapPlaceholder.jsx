function MapPlaceholder({
  lakes,
  lakeStatuses = {},
  onSelectLake,
  matchingLakeIds,
  hasSearch,
}) {
  const visibleLakes = Object.values(lakes)
    .filter((lake) => !hasSearch || matchingLakeIds.includes(lake.id))
    .sort((first, second) => first.name.localeCompare(second.name, "sv"));

  return (
    <section className="map-placeholder" aria-label="Sjölistevy">
      <div className="map-fallback-panel">
        <p className="map-fallback-notice" role="status">
          Kartan stöds inte i den här webbläsaren. Du kan fortfarande välja sjö.
        </p>

        {visibleLakes.length === 0 ? (
          <p className="map-fallback-empty">Ingen sjö matchar sökningen.</p>
        ) : (
          <div className="map-fallback-list">
            {visibleLakes.map((lake) => (
              <button
                type="button"
                className="map-fallback-lake"
                key={lake.id}
                onClick={() => onSelectLake(lake.id)}
              >
                <span
                  className={`map-fallback-status map-fallback-status-${lakeStatuses[lake.id] ?? "unknown"}`}
                  aria-hidden="true"
                />
                <span>
                  <strong>{lake.name}</strong>
                  <small>{lake.region}</small>
                </span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MapPlaceholder;
