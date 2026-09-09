import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import BottomNavigation from "../components/layout/BottomNavigation";
import SearchBar from "../components/layout/SearchBar";
import MapView from "../components/map/MapView";
import FishingSheet from "../components/fishing/FishingSheet";
import LakePage from "./LakePage";
import MorePage from "./MorePage";
import SavedPage from "./SavedPage";
import PlaceholderTabPage from "./PlaceholderTabPage";
import { lakes } from "../data/lakes";
import { fishingChoices as fishingChoiceOptions } from "../data/fishingChoices";
import useLocalStorage from "../hooks/useLocalStorage";
import { getLakeFishingSelectionDetails } from "../services/lakeService";
import { defaultThemeId, isThemeId } from "../theme/themes";
const fishingChoiceOptionsByCategory = {
  place: fishingChoiceOptions.places,
  method: fishingChoiceOptions.methods,
  species: fishingChoiceOptions.species,
};
const emptyFishingSelections = {
  place: [],
  method: [],
  species: [],
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeFishingSelections(selections) {
  if (!isPlainObject(selections)) {
    return emptyFishingSelections;
  }

  return Object.fromEntries(
    Object.entries(fishingChoiceOptionsByCategory).map(([category, options]) => {
      const storedValues = Array.isArray(selections[category])
        ? selections[category]
        : [selections[category]];
      const validValues = storedValues.filter(
        (value, index) => options.includes(value) && storedValues.indexOf(value) === index,
      );

      return [category, validValues];
    }),
  );
}

function hasSameFishingSelections(first, second) {
  return Object.keys(fishingChoiceOptionsByCategory).every(
    (category) =>
      Array.isArray(first?.[category]) &&
      Array.isArray(second?.[category]) &&
      first[category].length === second[category].length &&
      first[category].every((value, index) => value === second[category][index]),
  );
}

function getFishingSelectionSummary(selections) {
  const labels = {
    place: ["plats", "platser"],
    method: ["metod", "metoder"],
    species: ["art", "arter"],
  };
  const parts = Object.keys(fishingChoiceOptionsByCategory)
    .map((category) => {
      const choices = selections[category];

      if (choices.length === 0) {
        return null;
      }

      if (choices.length === 1) {
        return choices[0];
      }

      return `${choices.length} ${labels[category][1]}`;
    })
    .filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : "Välj fiske";
}

function HomePage() {
  const [activeTab, setActiveTab] = useState("map");
  const [isFishingOpen, setIsFishingOpen] = useState(false);
  const [selectedLake, setSelectedLake] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userPosition, setUserPosition] = useState(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const legendContainerRef = useRef(null);
  const [favoriteLakeIds, setFavoriteLakeIds] = useLocalStorage(
    "project-pike-favorites",
    [],
  );
  const [storedThemeId, setStoredThemeId] = useLocalStorage(
    "project-pike-theme",
    defaultThemeId,
  );
  const themeId = isThemeId(storedThemeId) ? storedThemeId : defaultThemeId;
  const [fishingChoices, setFishingChoices] = useLocalStorage(
    "project-pike-fishing-choices",
    emptyFishingSelections,
  );
  const normalizedFishingSelections = normalizeFishingSelections(fishingChoices);
  const fishingSelectionSummary = getFishingSelectionSummary(normalizedFishingSelections);
  const hasFishingSelections = Object.values(normalizedFishingSelections).some(
    (choices) => choices.length > 0,
  );

  useEffect(() => {
    if (!hasSameFishingSelections(fishingChoices, normalizedFishingSelections)) {
      setFishingChoices(normalizedFishingSelections);
    }
  }, [fishingChoices, normalizedFishingSelections, setFishingChoices]);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = themeId;

    if (storedThemeId !== themeId) {
      window.localStorage.setItem("project-pike-theme", JSON.stringify(themeId));
    }
  }, [storedThemeId, themeId]);

  function updateFishingChoice(category, value) {
    setFishingChoices((currentChoices) => {
      const normalizedCurrentChoices = normalizeFishingSelections(currentChoices);

      return {
        ...normalizedCurrentChoices,
        [category]: fishingChoiceOptionsByCategory[category]?.includes(value)
          ? normalizedCurrentChoices[category].includes(value)
            ? normalizedCurrentChoices[category].filter((choice) => choice !== value)
            : [...normalizedCurrentChoices[category], value]
          : normalizedCurrentChoices[category],
      };
    });
  }

  function resetFishingChoices() {
    setFishingChoices(emptyFishingSelections);
  }

  function toggleFavorite(lakeId) {
    setFavoriteLakeIds((currentFavorites) =>
      currentFavorites.includes(lakeId)
        ? currentFavorites.filter((id) => id !== lakeId)
        : [...currentFavorites, lakeId],
    );
  }

  function openLake(lake) {
    setSelectedLake(lake);
  }

  function openSearchSuggestion(lake) {
    setSearchQuery("");
    openLake(lake);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([
          position.coords.longitude,
          position.coords.latitude,
        ]);
      },
      () => {
        setUserPosition(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }

  const matchingLakeIds = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return Object.keys(lakes);
    }

    return Object.values(lakes)
      .filter((lake) => {
        const searchText = [
          lake.name,
          lake.type,
          lake.region,
          ...lake.counties,
        ]
          .join(" ")
          .toLowerCase();

        return searchText.includes(normalizedQuery);
      })
      .map((lake) => lake.id);
  }, [searchQuery]);

  const searchSuggestions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("sv-SE");

    if (!normalizedQuery) {
      return [];
    }

    return Object.values(lakes)
      .map((lake) => {
        const normalizedName = lake.name.toLocaleLowerCase("sv-SE");

        if (normalizedName.startsWith(normalizedQuery)) {
          return { lake, rank: 0 };
        }

        if (normalizedName.includes(normalizedQuery)) {
          return { lake, rank: 1 };
        }

        const locationMatches = [lake.region, ...lake.counties].some((location) =>
          location?.toLocaleLowerCase("sv-SE").includes(normalizedQuery),
        );

        return locationMatches ? { lake, rank: 2 } : null;
      })
      .filter(Boolean)
      .sort(
        (first, second) =>
          first.rank - second.rank || first.lake.name.localeCompare(second.lake.name, "sv-SE"),
      )
      .slice(0, 6)
      .map(({ lake }) => lake);
  }, [searchQuery]);

  const lakeStatuses = useMemo(() => {
    return Object.values(lakes).reduce((statuses, lake) => {
      statuses[lake.id] = getLakeFishingSelectionDetails(
        lake,
        normalizedFishingSelections,
      ).status ?? "neutral";
      return statuses;
    }, {});
  }, [normalizedFishingSelections]);

  useEffect(() => {
    if (!isLegendOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        legendContainerRef.current &&
        !legendContainerRef.current.contains(event.target)
      ) {
        setIsLegendOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isLegendOpen]);

  const fishingSheet = isFishingOpen ? (
    <FishingSheet
      fishingChoices={normalizedFishingSelections}
      onChange={updateFishingChoice}
      onReset={resetFishingChoices}
      onClose={() => setIsFishingOpen(false)}
    />
  ) : null;

  if (selectedLake) {
    return (
      <LakePage
        lake={selectedLake}
        themeId={themeId}
        fishingChoices={normalizedFishingSelections}
        fishingSelectionSummary={fishingSelectionSummary}
        isFavorite={favoriteLakeIds.includes(selectedLake.id)}
        onToggleFavorite={() => toggleFavorite(selectedLake.id)}
        onBack={() => setSelectedLake(null)}
        onOpenFishing={() => setIsFishingOpen(true)}
      >
        {fishingSheet}
      </LakePage>
    );
  }

  let pageContent;

  if (activeTab === "saved") {
    pageContent = (
      <SavedPage
        favoriteLakeIds={favoriteLakeIds}
        lakes={lakes}
        onOpenLake={openLake}
        onRemoveFavorite={toggleFavorite}
      />
    );
  } else if (activeTab === "journal") {
    pageContent = (
      <PlaceholderTabPage
        title="Dagbok"
        text="Här kommer dina privata fisketurer och anteckningar att samlas."
      />
    );
  } else if (activeTab === "more") {
    pageContent = (
      <MorePage themeId={themeId} onThemeChange={setStoredThemeId} />
    );
  } else {
    pageContent = (
      <main className="home-page">
        <MapView
          lakes={lakes}
          themeId={themeId}
          lakeStatuses={lakeStatuses}
          matchingLakeIds={matchingLakeIds}
          hasSearch={searchQuery.trim().length > 0}
          onSelectLake={(lakeId) => openLake(lakes[lakeId])}
          userPosition={userPosition}
        />

        <SearchBar
          searchQuery={searchQuery}
          suggestions={searchSuggestions}
          onSearchChange={setSearchQuery}
          onSelectSuggestion={openSearchSuggestion}
          onUseLocation={useCurrentLocation}
          onOpenSettings={() => setActiveTab("more")}
        />

        <div className="map-overlay-controls" ref={legendContainerRef}>
          {hasFishingSelections ? (
            <>
              <button
                type="button"
                className="map-help-button"
                onClick={() => setIsLegendOpen((current) => !current)}
                aria-label="Förklara klustrens statusprickar"
                aria-expanded={isLegendOpen}
              >
                ?
              </button>

              {isLegendOpen ? (
                <div
                  className="map-legend-panel"
                  role="dialog"
                  aria-label="Förklaring av klustrens statusprickar"
                >
                  <h2>Statusprickar på kluster</h2>
                  <ul>
                    <li>
                      <span className="map-legend-swatch map-legend-swatch-green" />
                      Tillåten match finns
                    </li>
                    <li>
                      <span className="map-legend-swatch map-legend-swatch-amber" />
                      Varning eller villkor finns
                    </li>
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}

          <button
            className="fishing-button"
            onClick={() => setIsFishingOpen(true)}
          >
            {fishingSelectionSummary}
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell">
      {pageContent}
      <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />
      {fishingSheet}
    </div>
  );
}

export default HomePage;
