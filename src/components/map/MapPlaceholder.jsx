function MapPlaceholder({
  lakes,
  onSelectLake,
  matchingLakeIds,
  hasSearch,
}) {
  const stateClass = (lakeId) => {
    if (!hasSearch) return "";
    return matchingLakeIds.includes(lakeId)
      ? "map-water-match"
      : "map-water-dimmed";
  };

  return (
    <section className="map-placeholder">
      <button
        className={`map-water map-water-large ${stateClass("bolmen")}`}
        onClick={() => onSelectLake(lakes.bolmen.id)}
      >
        {lakes.bolmen.name}
      </button>

      <button
        className={`map-water map-water-small ${stateClass("bunn")}`}
        onClick={() => onSelectLake(lakes.bunn.id)}
      >
        {lakes.bunn.name}
      </button>

      <button
        className={`map-water map-water-sommen ${stateClass("sommen")}`}
        onClick={() => onSelectLake(lakes.sommen.id)}
      >
        {lakes.sommen.name}
      </button>

      <p className="map-message">
        {hasSearch && matchingLakeIds.length === 0
          ? "Ingen tydlig träff – alla vatten visas ändå"
          : "Kartan kopplas in här"}
      </p>
    </section>
  );
}

export default MapPlaceholder;
