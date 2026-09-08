import { useState } from "react";
import FishingChoices from "./FishingChoices";
import {
  additionalFishingSpecies,
  featuredFishingSpecies,
  fishingChoices as fishingChoiceOptions,
} from "../../data/fishingChoices";

function FishingSheet({
  fishingChoices,
  onChange,
  onReset,
  onClose,
}) {
  const hasSelectedAdditionalSpecies = fishingChoices.species.some((species) =>
    additionalFishingSpecies.includes(species),
  );
  const [showAllSpecies, setShowAllSpecies] = useState(hasSelectedAdditionalSpecies);
  const visibleSpecies = showAllSpecies
    ? fishingChoiceOptions.species
    : featuredFishingSpecies;

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
          choices={visibleSpecies}
          selected={fishingChoices.species}
          onChange={onChange}
        />

        <button
          type="button"
          className="more-species-button"
          onClick={() => setShowAllSpecies((current) => !current)}
          aria-expanded={showAllSpecies}
        >
          {showAllSpecies
            ? "Visa färre arter"
            : `Visa fler arter (${additionalFishingSpecies.length})`}
        </button>

        <button className="reset-button" onClick={onReset}>
          Rensa val
        </button>
      </section>
    </div>
  );
}

export default FishingSheet;
