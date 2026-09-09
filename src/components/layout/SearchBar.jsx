import { useEffect, useRef, useState } from "react";

function SearchBar({
  searchQuery,
  suggestions,
  onSearchChange,
  onSelectSuggestion,
  onUseLocation,
  onOpenSettings,
}) {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const listboxId = "lake-search-suggestions";
  const hasQuery = searchQuery.trim().length > 0;
  const showSuggestions = isSuggestionsOpen && hasQuery && suggestions.length > 0;

  useEffect(() => {
    if (!isSuggestionsOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSuggestionsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isSuggestionsOpen]);

  function selectSuggestion(lake) {
    setIsSuggestionsOpen(false);
    setHighlightedIndex(-1);
    onSelectSuggestion(lake);
  }

  function handleSearchChange(event) {
    const nextQuery = event.target.value;
    onSearchChange(nextQuery);
    setIsSuggestionsOpen(nextQuery.trim().length > 0);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsSuggestionsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && suggestions.length > 0) {
      event.preventDefault();
      setIsSuggestionsOpen(true);
      setHighlightedIndex((currentIndex) => {
        if (event.key === "ArrowDown") {
          return currentIndex < 0 ? 0 : (currentIndex + 1) % suggestions.length;
        }

        return currentIndex < 0
          ? suggestions.length - 1
          : (currentIndex - 1 + suggestions.length) % suggestions.length;
      });
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    const highlightedSuggestion = suggestions[highlightedIndex];
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("sv-SE");
    const exactSuggestion = suggestions.find(
      (lake) => lake.name.toLocaleLowerCase("sv-SE") === normalizedQuery,
    );
    const suggestionToOpen = highlightedSuggestion ?? exactSuggestion;

    if (suggestionToOpen) {
      event.preventDefault();
      selectSuggestion(suggestionToOpen);
    }
  }

  return (
    <header className="map-header">
      <div className="search-combobox" ref={searchContainerRef}>
        <input
          className="search-field"
          type="search"
          role="combobox"
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsSuggestionsOpen(hasQuery)}
          onKeyDown={handleKeyDown}
          placeholder="Sök vatten, ort eller kommun"
          aria-label="Sök vatten, ort eller kommun"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showSuggestions}
          aria-activedescendant={
            showSuggestions && highlightedIndex >= 0
              ? `lake-search-option-${suggestions[highlightedIndex].id}`
              : undefined
          }
        />

        {showSuggestions ? (
          <ul className="search-suggestions" id={listboxId} role="listbox">
            {suggestions.map((lake, index) => {
              const locations = [lake.region, ...lake.counties]
                .filter(Boolean)
                .filter((location, locationIndex, allLocations) =>
                  allLocations.indexOf(location) === locationIndex,
                );

              return (
                <li
                  className={`search-suggestion${
                    highlightedIndex === index ? " search-suggestion-highlighted" : ""
                  }`}
                  id={`lake-search-option-${lake.id}`}
                  key={lake.id}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectSuggestion(lake)}
                >
                  <span>{lake.name}</span>
                  {locations.length > 0 ? <small>{locations.join(" · ")}</small> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <button
        className="round-button"
        aria-label="Använd min plats"
        onClick={onUseLocation}
      >
        ◎
      </button>

      <button
        className="round-button"
        aria-label="Öppna inställningar"
        onClick={onOpenSettings}
      >
        ⚙
      </button>
    </header>
  );
}

export default SearchBar;
