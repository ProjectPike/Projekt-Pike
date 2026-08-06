function SearchBar({ searchQuery, onSearchChange }) {
  return (
    <header className="map-header">
      <input
        className="search-field"
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
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
  );
}

export default SearchBar;
