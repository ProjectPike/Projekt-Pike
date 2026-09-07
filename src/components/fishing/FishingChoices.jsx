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
        {choices.map((choice) => {
          const isSelected = selected.includes(choice);

          return (
            <button
              key={choice}
              className={`choice-button ${isSelected ? "choice-button-selected" : ""}`}
              onClick={() => onChange(category, choice)}
              aria-pressed={isSelected}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default FishingChoices;
