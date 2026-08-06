import InformationCard from "../components/lake/InformationCard";
import LakeHero from "../components/lake/LakeHero";

function LakePage({
  lake,
  fishingChoices,
  isFavorite,
  onToggleFavorite,
  onBack,
  onOpenFishing,
  children,
}) {
  return (
    <main className="lake-page lake-page-enter">
      <header className="lake-topbar">
        <button className="round-button" onClick={onBack} aria-label="Tillbaka">
          ←
        </button>

        <strong>{lake.name}</strong>

        <button
          className="round-button favorite-button"
          onClick={onToggleFavorite}
          aria-label={
            isFavorite ? "Ta bort från favoriter" : "Spara som favorit"
          }
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </header>

      <LakeHero lake={lake} />

      <section className="lake-content lake-content-enter">
        <button className="lake-mini-map">
          <span>Öppna karta</span>
          <strong>›</strong>
        </button>

        <button className="lake-fishing-summary" onClick={onOpenFishing}>
          <span>
            <small>Mitt fiske</small>
            <strong>
              {fishingChoices.place} · {fishingChoices.method} ·{" "}
              {fishingChoices.species}
            </strong>
          </span>

          <strong>›</strong>
        </button>

        <section className="lake-status-grid">
          <InformationCard label="Regler" information={lake.fishing.rules} />
          <InformationCard label="Fiskekort" information={lake.fishing.permit} />
          <InformationCard label="Parkering" information={lake.practical.parking} />
          <InformationCard
            label="Fredningsområde"
            information={lake.fishing.protectedAreas}
          />
        </section>

        <section className="lake-information">
          <p className="eyebrow">Information</p>
          <h2>Vi kartlägger fortfarande {lake.name}</h2>

          <p>
            Vi har inte hunnit verifiera regler och praktisk information för
            det här vattnet ännu.
          </p>

          <button className="help-button">
            Hjälp oss förbättra informationen
          </button>

          <button className="report-button">Rapportera fel</button>
        </section>
      </section>

      {children}
    </main>
  );
}

export default LakePage;
