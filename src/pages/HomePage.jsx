import { useEffect, useMemo, useRef, useState } from "react";
import BottomNavigation from "../components/layout/BottomNavigation";
import SearchBar from "../components/layout/SearchBar";
import MapView from "../components/map/MapView";
import FishingSheet from "../components/fishing/FishingSheet";
import LakePage from "./LakePage";
import SavedPage from "./SavedPage";
import PlaceholderTabPage from "./PlaceholderTabPage";
import { lakes } from "../data/lakes";
import useLocalStorage from "../hooks/useLocalStorage";
import { getLakeFishingStatus } from "../services/lakeService";

const defaultFishingChoices = {
  place: "Båt",
  method: "Spinn",
  species: "Gädda",
};

function normalizeFishingChoices(choices = {}) {
  return {
    place: choices.place ?? defaultFishingChoices.place,
    method: choices.method ?? defaultFishingChoices.method,
    species: choices.species ?? defaultFishingChoices.species,
  };
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
  const [fishingChoices, setFishingChoices] = useLocalStorage(
    "project-pike-fishing-choices",
    defaultFishingChoices,
  );
  const normalizedFishingChoices = normalizeFishingChoices(fishingChoices);

  function updateFishingChoice(category, value) {
    setFishingChoices((currentChoices) => {
      const normalizedCurrentChoices = normalizeFishingChoices(currentChoices);

      return normalizeFishingChoices({
        ...normalizedCurrentChoices,
        [category]: value,
      });
    });
  }

  function resetFishingChoices() {
    setFishingChoices(normalizeFishingChoices(defaultFishingChoices));
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

  const lakeStatuses = useMemo(() => {
    return Object.values(lakes).reduce((statuses, lake) => {
      statuses[lake.id] = getLakeFishingStatus(lake, normalizedFishingChoices);
      return statuses;
    }, {});
  }, [normalizedFishingChoices]);

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
      fishingChoices={normalizedFishingChoices}
      onChange={updateFishingChoice}
      onReset={resetFishingChoices}
      onClose={() => setIsFishingOpen(false)}
    />
  ) : null;

  if (selectedLake) {
    return (
      <LakePage
        lake={selectedLake}
        fishingChoices={normalizedFishingChoices}
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
      <PlaceholderTabPage
        title="Mer"
        text="Inställningar, information och framtida funktioner får sitt hem här."
      />
    );
  } else {
    pageContent = (
      <main className="home-page">
        <MapView
          lakes={lakes}
          lakeStatuses={lakeStatuses}
          matchingLakeIds={matchingLakeIds}
          hasSearch={searchQuery.trim().length > 0}
          onSelectLake={(lakeId) => openLake(lakes[lakeId])}
          userPosition={userPosition}
        />

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUseLocation={useCurrentLocation}
        />

        <div className="map-overlay-controls" ref={legendContainerRef}>
          <button
            type="button"
            className="map-help-button"
            onClick={() => setIsLegendOpen((current) => !current)}
            aria-label="Förklara färgerna på kartan"
            aria-expanded={isLegendOpen}
          >
            ?
          </button>

          {isLegendOpen ? (
            <div className="map-legend-panel" role="dialog" aria-label="Förklaring av kartfärger">
              <h2>Vad betyder färgerna?</h2>
              <ul>
                <li>
                  <span className="map-legend-swatch map-legend-swatch-green" />
                  Matchar ditt fiske
                </li>
                <li>
                  <span className="map-legend-swatch map-legend-swatch-amber" />
                  Villkor finns – läs reglerna
                </li>
                <li>
                  <span className="map-legend-swatch map-legend-swatch-gray" />
                  Pike saknar tillräcklig information
                </li>
              </ul>
            </div>
          ) : null}

          <button
            className="fishing-button"
            onClick={() => setIsFishingOpen(true)}
          >
            {normalizedFishingChoices.place} · {normalizedFishingChoices.method} ·{" "}
            {normalizedFishingChoices.species}
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
