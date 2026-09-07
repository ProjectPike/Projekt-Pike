import FishingChoices from "./FishingChoices";
import { fishingChoices as fishingChoiceOptions } from "../../data/fishingChoices";

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
          choices={fishingChoiceOptions.places}
          selected={fishingChoices.place}
          onChange={onChange}
        />

        <FishingChoices
          title="Metod"
          category="method"
          choices={fishingChoiceOptions.methods}
          selected={fishingChoices.method}
          onChange={onChange}
        />

        <FishingChoices
          title="Art"
          category="species"
          choices={fishingChoiceOptions.species}
          selected={fishingChoices.species}
          onChange={onChange}
        />

        <button className="reset-button" onClick={onReset}>
          Rensa val
        </button>
      </section>
    </div>
  );
}

export default FishingSheet;
