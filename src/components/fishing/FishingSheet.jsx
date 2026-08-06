import FishingChoices from "./FishingChoices";

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

          <button className="close-button" onClick={onClose} aria-label="Stäng">
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

export default FishingSheet;
