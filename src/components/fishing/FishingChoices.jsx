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

export default FishingChoices;
