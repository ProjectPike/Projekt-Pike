function SavedLakeCard({ lake, onOpen, onRemove }) {
  return (
    <article className="saved-lake-card">
      <button className="saved-lake-main" onClick={onOpen}>
        <span>
          <small>{lake.region}</small>
          <strong>{lake.name}</strong>
          <em>
            {lake.distance.kilometers} km · {lake.distance.travelTime}
          </em>
        </span>
        <span className="saved-chevron">›</span>
      </button>

      <button className="saved-remove" onClick={onRemove}>
        Ta bort
      </button>
    </article>
  );
}

export default SavedLakeCard;
