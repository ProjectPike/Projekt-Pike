import SavedLakeCard from "../components/saved/SavedLakeCard";

function SavedPage({
  favoriteLakeIds,
  lakes,
  onOpenLake,
  onRemoveFavorite,
}) {
  const favoriteLakes = favoriteLakeIds
    .map((lakeId) => lakes[lakeId])
    .filter(Boolean);

  return (
    <main className="tab-page">
      <header className="tab-page-header">
        <p className="eyebrow">Dina vatten</p>
        <h1>Sparade</h1>
      </header>

      {favoriteLakes.length === 0 ? (
        <section className="empty-state">
          <h2>Inga sparade vatten ännu</h2>
          <p>
            Markera en sjö med stjärnan så dyker den upp här.
          </p>
        </section>
      ) : (
        <section className="saved-list">
          {favoriteLakes.map((lake) => (
            <SavedLakeCard
              key={lake.id}
              lake={lake}
              onOpen={() => onOpenLake(lake)}
              onRemove={() => onRemoveFavorite(lake.id)}
            />
          ))}
        </section>
      )}
    </main>
  );
}

export default SavedPage;
