import { useState } from "react";

const defaultFishingChoices = {
  place: "Båt",
  method: "Spinn",
  species: "Gädda",
};

const lakes = {
  bolmen: {
    id: "bolmen",
    name: "Bolmen",
    distance: "84 km",
    region: "Småland",
    status: "Informationen är ännu inte verifierad",
  },
  bunn: {
    id: "bunn",
    name: "Bunn",
    distance: "18 km",
    region: "Småland",
    status: "Informationen är ännu inte verifierad",
  },
};

function HomePage() {
  const [isFishingOpen, setIsFishingOpen] = useState(false);
  const [selectedLake, setSelectedLake] = useState(null);
  const [fishingChoices, setFishingChoices] = useState(
    defaultFishingChoices,
  );

  function updateFishingChoice(category, value) {
    setFishingChoices((currentChoices) => ({
      ...currentChoices,
      [category]: value,
    }));
  }

  function resetFishingChoices() {
    setFishingChoices(defaultFishingChoices);
  }

  if (selectedLake) {
    return (
      <LakePage
        lake={selectedLake}
        fishingChoices={fishingChoices}
        onBack={() => setSelectedLake(null)}
        onOpenFishing={() => setIsFishingOpen(true)}
      >
        {isFishingOpen && (
          <FishingSheet
            fishingChoices={fishingChoices}
            onChange={updateFishingChoice}
            onReset={resetFishingChoices}
            onClose={() => setIsFishingOpen(false)}
          />
        )}
      </LakePage>
    );
  }

  return (
    <main className="home-page">
      <section className="map-placeholder">
        <button
          className="map-water map-water-large"
          onClick={() => setSelectedLake(lakes.bolmen)}
        >
          Bolmen
        </button>

        <button
          className="map-water map-water-small"
          onClick={() => setSelectedLake(lakes.bunn)}
        >
          Bunn
        </button>

        <p className="map-message">Kartan kopplas in här</p>
      </section>

      <header className="map-header">
        <input
          className="search-field"
          type="search"
          placeholder="Sök vatten, ort eller kommun"
          aria-label="Sök vatten, ort eller kommun"
        />

        <button className="round-button" aria-label="Använd min plats">
          ◎
        </button>

        <button className="round-button" aria-label="Öppna inställningar">
          ⚙
        </button>
      </header>

      <button
        className="fishing-button"
        onClick={() => setIsFishingOpen(true)}
      >
        {fishingChoices.place} · {fishingChoices.method} ·{" "}
        {fishingChoices.species}
      </button>

      <nav className="bottom-navigation">
        <button className="navigation-item navigation-item-active">
          Karta
        </button>
        <button className="navigation-item">Sparade</button>
        <button className="navigation-item">Dagbok</button>
        <button className="navigation-item">Mer</button>
      </nav>

      {isFishingOpen && (
        <FishingSheet
          fishingChoices={fishingChoices}
          onChange={updateFishingChoice}
          onReset={resetFishingChoices}
          onClose={() => setIsFishingOpen(false)}
        />
      )}
    </main>
  );
}

function LakePage({
  lake,
  fishingChoices,
  onBack,
  onOpenFishing,
  children,
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <main className="lake-page">
      <header className="lake-topbar">
        <button className="round-button" onClick={onBack} aria-label="Tillbaka">
          ←
        </button>

        <strong>{lake.name}</strong>

        <button
          className="round-button"
          onClick={() => setIsFavorite((current) => !current)}
          aria-label="Spara som favorit"
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </header>

      <section className="lake-hero">
        <div className="lake-hero-water" />

        <div className="lake-hero-content">
          <p>{lake.region}</p>
          <h1>{lake.name}</h1>
          <span>{lake.distance} från dig</span>
        </div>
      </section>

      <section className="lake-content">
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
          <InformationCard
            label="Regler"
            value="Ej verifierade"
            color="orange"
          />

          <InformationCard
            label="Fiskekort"
            value="Uppgift saknas"
            color="blue"
          />

          <InformationCard
            label="Parkering"
            value="Uppgift saknas"
            color="blue"
          />

          <InformationCard
            label="Fredningsområde"
            value="Kontrolleras"
            color="orange"
          />
        </section>

        <section className="lake-information">
          <p className="eyebrow">Information</p>
          <h2>Vi kartlägger fortfarande {lake.name}</h2>

          <p>
            Vi har inte hunnit verifiera regler och praktisk information
            för det här vattnet ännu.
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

function InformationCard({ label, value, color }) {
  return (
    <button className="information-card">
      <span className={`information-card-line ${color}`} />
      <small>{label}</small>
      <strong>{value}</strong>
    </button>
  );
}

function FishingSheet({
  fishingChoices,
  onChange,
  onReset,
  onClose,
}) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="fishing-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" />

        <header className="sheet-header">
          <div>
            <p className="eyebrow">Anpassa kartan och reglerna</p>
            <h2>Mitt fiske</h2>
          </div>

          <button
            className="close-button"
            onClick={onClose}
            aria-label="Stäng"
          >
            ×
          </button>
        </header>

        <FishingChoices
          title="Plats"
          category="place"
          choices={["Båt", "Land", "Kajak", "Flytring"]}
          selected={fishingChoices.place}
          onChange={onChange}
        />

        <FishingChoices
          title="Metod"
          category="method"
          choices={["Spinn", "Mete", "Flugfiske", "Trolling"]}
          selected={fishingChoices.method}
          onChange={onChange}
        />

        <FishingChoices
          title="Art"
          category="species"
          choices={["Gädda", "Abborre", "Gös", "Öring"]}
          selected={fishingChoices.species}
          onChange={onChange}
        />

        <button className="reset-button" onClick={onReset}>
          Återställ
        </button>
      </section>
    </div>
  );
}

function FishingChoices({
  title,
  category,
  choices,
  selected,
  onChange,
}) {
  return (
    <section className="choice-section">
      <h3>{title}</h3>

      <div className="choice-list">
        {choices.map((choice) => (
          <button
            key={choice}
            className={`choice-button ${
              choice === selected ? "choice-button-selected" : ""
            }`}
            onClick={() => onChange(category, choice)}
          >
            {choice}
          </button>
        ))}
      </div>
    </section>
  );
}

export default HomePage;