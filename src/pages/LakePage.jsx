import { useState } from "react";
import InformationCard from "../components/lake/InformationCard";
import LakeHero from "../components/lake/LakeHero";
import LakeMap from "../components/map/LakeMap";
import { getLakeFishingStatus } from "../services/lakeService";

const SOURCE_TYPE_LABELS = {
  authority: "Myndighet",
  municipality: "Kommun",
  "fvo-club": "Fiskevårdsområde",
  "commercial-aggregator": "Extern fiskekortstjänst",
  "open-data": "Öppna data",
  other: "Källa",
};

const STATE_LABELS = {
  required: "Krävs",
  "not-required": "Krävs inte",
  allowed: "Tillåtet",
  prohibited: "Förbjudet",
  restricted: "Särskilda regler",
  present: "Finns",
  absent: "Saknas",
  "calendar-year": "Kalenderår",
  unknown: "Ingen verifierad uppgift",
};

const ACCESS_LABELS = {
  permitRequirement: "Fiskekort",
  permitCost: "Kostnad",
  permitPrice: "Kostnad",
  youthRules: "Barn och unga",
  validity: "Giltighet",
  permitProducts: "Korttyper",
  purchaseChannels: "Köp",
  familyCoverage: "Familj",
  purchase: "Köp",
};

const METHOD_LABELS = {
  bait: "Mete",
  spin: "Spinn",
  fly: "Flugfiske",
  ice: "Isfiske",
  trolling: "Trolling",
  crayfishFishing: "Kräftfiske",
  nets: "Nät",
  fixedGear: "Fasta redskap",
};

const WATERCRAFT_LABELS = {
  boat: "Båt",
  kayak: "Kajak",
  floatTube: "Flytring",
};

const BOAT_LABELS = {
  electricMotor: "Elmotor",
  combustionMotor: "Bensinmotor",
  speedLimits: "Hastighetsgräns",
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFactObject(value) {
  return isPlainObject(value) && ("value" in value || "note" in value || "ruleType" in value);
}

function getConditionText(conditions) {
  if (!isPlainObject(conditions)) {
    return null;
  }

  const dateText = getDateRangeText(conditions.dateFrom, conditions.dateTo);
  const timeText = getTimeRangeText(conditions.timeFrom, conditions.timeTo);

  if (dateText && timeText) {
    return `${dateText} · ${timeText}`;
  }

  return dateText || timeText || null;
}

function getDateRangeText(dateFrom, dateTo) {
  if (!dateFrom && !dateTo) {
    return null;
  }

  const from = formatMonthDay(dateFrom);
  const to = formatMonthDay(dateTo);

  if (from && to) {
    return `${from}–${to}`;
  }

  return from || to || null;
}

function getTimeRangeText(timeFrom, timeTo) {
  if (!timeFrom && !timeTo) {
    return null;
  }

  if (timeFrom && timeTo) {
    return `${timeFrom}–${timeTo}`;
  }

  return timeFrom || timeTo || null;
}

function formatMonthDay(value) {
  if (typeof value !== "string") {
    return null;
  }

  const [monthString, dayString] = value.split("-");
  const month = Number(monthString);
  const day = Number(dayString);

  if (!Number.isInteger(month) || !Number.isInteger(day)) {
    return value;
  }

  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "maj",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "dec",
  ];

  return `${day} ${months[month - 1] ?? ""}`.trim();
}

function getTone(ruleType) {
  if (ruleType === "advisory") {
    return "advisory";
  }

  if (ruleType === "recommendation") {
    return "recommendation";
  }

  return "rule";
}

function getToneLabel(ruleType) {
  if (ruleType === "advisory") {
    return "Viktigt";
  }

  if (ruleType === "recommendation") {
    return "Rekommendation";
  }

  return null;
}

function getStateLabel(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return STATE_LABELS[value] ?? value;
  }

  if (typeof value === "number") {
    return `${value}`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatToken(String(item))).join(", ");
  }

  if (isPlainObject(value)) {
    const min = value.minSizeCm;
    const max = value.maxSizeCm;

    if (typeof min === "number" && typeof max === "number") {
      return `${min}–${max} cm`;
    }

    if (typeof min === "number") {
      return `min ${min} cm`;
    }

    if (typeof max === "number") {
      return `max ${max} cm`;
    }

    if (typeof value.maxRetainedPerPersonPerDay === "number") {
      return `max ${value.maxRetainedPerPersonPerDay}/dygn`;
    }

    if (typeof value.maxRetainedPerPermitPerDay === "number") {
      return `max ${value.maxRetainedPerPermitPerDay}/dygn`;
    }

    if (typeof value.maxRetainedOver50cmCombinedPerPersonPerDay === "number") {
      return `max ${value.maxRetainedOver50cmCombinedPerPersonPerDay}/dygn`;
    }
  }

  return null;
}

function formatToken(value) {
  const token = String(value);
  const mapping = {
    day: "Dagskort",
    week: "Veckokort",
    month: "Månadskort",
    year: "Årskort",
    family: "Familjekort",
    "angel-ice": "Angel/isfiskekort",
    "adult-day": "Dagskort vuxen",
    "youth-day-10-17": "Ungdomskort 10-17 år",
    digital: "Digitalt",
    "physical-resellers": "Återförsäljare",
    gadda: "Gädda",
    gos: "Gös",
    abborre: "Abborre",
    al: "Ål",
    oring: "Öring",
    "insjööoring": "Insjööring",
    sik: "Sik",
    lake: "Lake",
    sutare: "Sutare",
    braxen: "Braxen",
    mort: "Mört",
    regnbage: "Regnbåge",
  };

  return mapping[token] ?? token;
}

function getAccessRows(detailsAccess) {
  if (!isPlainObject(detailsAccess)) {
    return [];
  }

  return Object.entries(detailsAccess)
    .filter(([, fact]) => isFactObject(fact))
    .map(([key, fact]) => {
      const label = ACCESS_LABELS[key] ?? "Fiskekort";
      const valueLabel =
        key === "permitCost" && typeof fact.value === "number"
          ? fact.value === 0
            ? "Gratis"
            : `${fact.value} kr`
          : key === "permitRequirement" && fact.value === "required" && detailsAccess.permitCost?.value === 0
            ? "Gratis fiskekort krävs"
            : getStateLabel(fact.value);

      const conditionText = getConditionText(fact.conditions);

      if (!valueLabel && !fact.note && !conditionText) {
        return null;
      }

      if (fact.value === "unknown") {
        return null;
      }

      return {
        label,
        value: valueLabel,
        note: fact.note,
        conditions: conditionText,
        tone: getTone(fact.ruleType),
        toneLabel: getToneLabel(fact.ruleType),
      };
    })
    .filter(Boolean);
}

function getMethodRows(detailsMethods) {
  if (!isPlainObject(detailsMethods)) {
    return [];
  }

  return Object.entries(detailsMethods)
    .filter(([, fact]) => isFactObject(fact))
    .map(([key, fact]) => {
      if (fact.value === "unknown") {
        return null;
      }

      const label = METHOD_LABELS[key] ?? prettifyKey(key);
      const valueLabel = getStateLabel(fact.value);
      const conditionText = getConditionText(fact.conditions);

      if (!valueLabel && !fact.note && !conditionText) {
        return null;
      }

      return {
        label,
        value: valueLabel,
        note: fact.note,
        conditions: conditionText,
        tone: getTone(fact.ruleType),
        toneLabel: getToneLabel(fact.ruleType),
      };
    })
    .filter(Boolean);
}

function getSpeciesRows(detailsSpecies) {
  if (!isPlainObject(detailsSpecies)) {
    return [];
  }

  const rows = [];

  if (isFactObject(detailsSpecies.knownSpecies) && Array.isArray(detailsSpecies.knownSpecies.value)) {
    rows.push({
      label: "Arter",
      value: detailsSpecies.knownSpecies.value.map((species) => formatToken(species)).join(", "),
      note: detailsSpecies.knownSpecies.note,
      conditions: getConditionText(detailsSpecies.knownSpecies.conditions),
      tone: getTone(detailsSpecies.knownSpecies.ruleType),
      toneLabel: getToneLabel(detailsSpecies.knownSpecies.ruleType),
    });
  }

  if (isFactObject(detailsSpecies.stockedSportFish) && Array.isArray(detailsSpecies.stockedSportFish.value)) {
    rows.push({
      label: "Inplanterade arter",
      value: detailsSpecies.stockedSportFish.value.map((species) => formatToken(species)).join(", "),
      note: detailsSpecies.stockedSportFish.note,
      conditions: getConditionText(detailsSpecies.stockedSportFish.conditions),
      tone: getTone(detailsSpecies.stockedSportFish.ruleType),
      toneLabel: getToneLabel(detailsSpecies.stockedSportFish.ruleType),
    });
  }

  if (Array.isArray(detailsSpecies.sizeLimits)) {
    detailsSpecies.sizeLimits.forEach((entry) => {
      const sizeText = getStateLabel(entry.value);
      if (!sizeText) {
        return;
      }

      rows.push({
        label: formatToken(entry.species ?? "Art"),
        value: sizeText,
        note: entry.note,
        conditions: getConditionText(entry.conditions),
        tone: getTone(entry.ruleType),
        toneLabel: getToneLabel(entry.ruleType),
      });
    });
  }

  if (Array.isArray(detailsSpecies.bagLimits)) {
    detailsSpecies.bagLimits.forEach((entry) => {
      const bagText = getStateLabel(entry.value);
      if (!bagText) {
        return;
      }

      rows.push({
        label: `${formatToken(entry.species ?? "Art")} · Fångstgräns`,
        value: bagText,
        note: entry.note,
        conditions: getConditionText(entry.conditions),
        tone: getTone(entry.ruleType),
        toneLabel: getToneLabel(entry.ruleType),
      });
    });
  }

  if (Array.isArray(detailsSpecies.closedSeasons)) {
    detailsSpecies.closedSeasons.forEach((entry) => {
      rows.push({
        label: `${formatToken(entry.species ?? "Art")} · Fredning`,
        value: "Förbjudet",
        note: entry.note,
        conditions: getConditionText(entry.conditions),
        tone: getTone(entry.ruleType),
        toneLabel: getToneLabel(entry.ruleType),
      });
    });
  }

  if (Array.isArray(detailsSpecies.releaseRequirements)) {
    detailsSpecies.releaseRequirements.forEach((entry) => {
      rows.push({
        label: `${formatToken(entry.species ?? "Art")} · Återutsättning`,
        value: "Krävs",
        note: entry.note,
        conditions: getConditionText(entry.conditions),
        tone: getTone(entry.ruleType),
        toneLabel: getToneLabel(entry.ruleType),
      });
    });
  }

  if (Array.isArray(detailsSpecies.releaseRestrictions)) {
    detailsSpecies.releaseRestrictions.forEach((entry) => {
      rows.push({
        label: `${formatToken(entry.species ?? "Art")} · Catch and release`,
        value: "Förbjudet",
        note: entry.note,
        conditions: getConditionText(entry.conditions),
        tone: getTone(entry.ruleType),
        toneLabel: getToneLabel(entry.ruleType),
      });
    });
  }

  return rows;
}

function getBoatRows(details) {
  const rows = [];

  if (isPlainObject(details?.watercraft)) {
    Object.entries(details.watercraft)
      .filter(([, fact]) => isFactObject(fact))
      .forEach(([key, fact]) => {
        const isImportantUnknown = key === "boat" || key === "floatTube" || key === "kayak";
        if (fact.value === "unknown" && !isImportantUnknown) {
          return;
        }

        rows.push({
          label: WATERCRAFT_LABELS[key] ?? prettifyKey(key),
          value: getStateLabel(fact.value),
          note: fact.note,
          conditions: getConditionText(fact.conditions),
          tone: getTone(fact.ruleType),
          toneLabel: getToneLabel(fact.ruleType),
        });
      });
  }

  if (isPlainObject(details?.boat)) {
    Object.entries(details.boat)
      .filter(([, fact]) => isFactObject(fact))
      .forEach(([key, fact]) => {
        const isImportantUnknown = key === "electricMotor" || key === "combustionMotor";
        if (fact.value === "unknown" && !isImportantUnknown) {
          return;
        }

        const value =
          key === "speedLimits" && typeof fact.value === "number"
            ? `${fact.value} ${fact.unit ?? ""}`.trim()
            : getStateLabel(fact.value);

        rows.push({
          label: BOAT_LABELS[key] ?? prettifyKey(key),
          value,
          note: fact.note,
          conditions: getConditionText(fact.conditions),
          tone: getTone(fact.ruleType),
          toneLabel: getToneLabel(fact.ruleType),
        });
      });
  }

  return rows.filter((row) => Boolean(row.value) || Boolean(row.note));
}

function getPracticalRows(detailsPractical, detailsBoat) {
  const rows = [];

  if (isPlainObject(detailsBoat?.boatRentalAvailable) && detailsBoat.boatRentalAvailable.value !== "unknown") {
    rows.push({
      label: "Hyrbåt",
      value: getStateLabel(detailsBoat.boatRentalAvailable.value),
      note: detailsBoat.boatRentalAvailable.note,
      conditions: getConditionText(detailsBoat.boatRentalAvailable.conditions),
      tone: getTone(detailsBoat.boatRentalAvailable.ruleType),
      toneLabel: getToneLabel(detailsBoat.boatRentalAvailable.ruleType),
    });
  }

  if (!isPlainObject(detailsPractical)) {
    return rows;
  }

  Object.entries(detailsPractical)
    .filter(([, value]) => isFactObject(value))
    .forEach(([key, fact]) => {
      if (fact.value === "unknown") {
        return;
      }

      rows.push({
        label: prettifyKey(key),
        value: getStateLabel(fact.value),
        note: fact.note,
        conditions: getConditionText(fact.conditions),
        tone: getTone(fact.ruleType),
        toneLabel: getToneLabel(fact.ruleType),
      });
    });

  Object.entries(detailsPractical)
    .filter(([, value]) => Array.isArray(value))
    .forEach(([key, list]) => {
      list.forEach((entry) => {
        if (!isPlainObject(entry)) {
          return;
        }

        const parts = [];

        if (entry.value && entry.value !== "present") {
          parts.push(getStateLabel(entry.value));
        }

        if (entry.note) {
          parts.push(entry.note);
        }

        rows.push({
          label: key === "rentalStations" ? "Hyrbåt" : prettifyKey(key),
          value: entry.name ?? null,
          note: parts.join(" · ") || null,
          conditions: getConditionText(entry.conditions),
          tone: getTone(entry.ruleType),
          toneLabel: getToneLabel(entry.ruleType),
        });
      });
    });

  return rows;
}

function getGeographyRows(detailsGeography) {
  if (!isPlainObject(detailsGeography)) {
    return [];
  }

  const rows = [];

  Object.entries(detailsGeography)
    .filter(([, value]) => isFactObject(value))
    .forEach(([key, fact]) => {
      if (fact.value === "unknown") {
        return;
      }

      rows.push({
        label: prettifyKey(key),
        value: getStateLabel(fact.value),
        note: fact.note,
        conditions: getConditionText(fact.conditions),
        tone: getTone(fact.ruleType),
        toneLabel: getToneLabel(fact.ruleType),
      });
    });

  Object.entries(detailsGeography)
    .filter(([, value]) => Array.isArray(value))
    .forEach(([key, list]) => {
      list.forEach((entry) => {
        if (!isPlainObject(entry)) {
          return;
        }

        rows.push({
          label: entry.name ?? prettifyKey(key),
          value: getStateLabel(entry.value),
          note: entry.note,
          conditions: getConditionText(entry.conditions),
          tone: getTone(entry.ruleType),
          toneLabel: getToneLabel(entry.ruleType),
        });
      });
    });

  return rows.filter((row) => row.value || row.note || row.conditions);
}

function getSafetyRows(detailsSafety) {
  if (!isPlainObject(detailsSafety)) {
    return [];
  }

  const rows = [];

  Object.entries(detailsSafety)
    .filter(([, value]) => isFactObject(value))
    .forEach(([key, fact]) => {
      if (fact.value === "unknown") {
        return;
      }

      rows.push({
        label: prettifyKey(key),
        value: getStateLabel(fact.value),
        note: fact.note,
        conditions: getConditionText(fact.conditions),
        tone: getTone(fact.ruleType),
        toneLabel: getToneLabel(fact.ruleType),
      });
    });

  Object.entries(detailsSafety)
    .filter(([, value]) => Array.isArray(value))
    .forEach(([key, list]) => {
      list.forEach((entry) => {
        if (!isPlainObject(entry)) {
          return;
        }

        rows.push({
          label:
            key === "consumptionAdvisories"
              ? `Konsumtion${entry.substance ? ` · ${entry.substance}` : ""}`
              : prettifyKey(key),
          value: entry.authority ? entry.authority : getStateLabel(entry.value),
          note: entry.note,
          conditions: getConditionText(entry.conditions),
          tone: getTone(entry.ruleType),
          toneLabel: getToneLabel(entry.ruleType),
        });
      });
    });

  return rows.filter((row) => row.value || row.note || row.conditions);
}

function prettifyKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function collectSourcesFromDetails(details) {
  const sourceMap = new Map();

  function walk(value) {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (!isPlainObject(value)) {
      return;
    }

    if (Array.isArray(value.sources)) {
      value.sources.forEach((source) => {
        if (!source?.url) {
          return;
        }

        if (!sourceMap.has(source.url)) {
          sourceMap.set(source.url, {
            url: source.url,
            label: SOURCE_TYPE_LABELS[source.type] ?? "Källa",
          });
        }
      });
    }

    Object.values(value).forEach(walk);
  }

  walk(details);

  return Array.from(sourceMap.values());
}

function getLatestVerificationDate(details) {
  let latest = null;

  function walk(value) {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (!isPlainObject(value)) {
      return;
    }

    if (typeof value.verifiedAt === "string") {
      const timestamp = Date.parse(value.verifiedAt);
      if (!Number.isNaN(timestamp) && (!latest || timestamp > latest.timestamp)) {
        latest = { timestamp, value: value.verifiedAt };
      }
    }

    Object.values(value).forEach(walk);
  }

  walk(details);

  return latest?.value ?? null;
}

function formatVerifiedDate(dateString) {
  if (typeof dateString !== "string") {
    return null;
  }

  const [yearString, monthString, dayString] = dateString.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return dateString;
  }

  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "maj",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "dec",
  ];

  return `${day} ${months[month - 1] ?? ""} ${year}`.trim();
}

function renderRow(row, index) {
  return (
    <li key={`${row.label}-${index}`} className={`lake-details-row lake-details-row-${row.tone}`}>
      <div className="lake-details-row-main">
        <span className="lake-details-row-label">{row.label}</span>
        {row.value ? <strong className="lake-details-row-value">{row.value}</strong> : null}
      </div>

      {row.toneLabel ? <span className="lake-details-tone">{row.toneLabel}</span> : null}

      {row.conditions ? <p className="lake-details-row-meta">Gäller: {row.conditions}</p> : null}
      {row.note ? <p className="lake-details-row-note">{row.note}</p> : null}
    </li>
  );
}

function LakePage({
  lake,
  fishingChoices,
  isFavorite,
  onToggleFavorite,
  onBack,
  onOpenFishing,
  children,
}) {
  const [showLakeMap, setShowLakeMap] = useState(false);
  const fishingStatus = getLakeFishingStatus(lake, fishingChoices);

  const statusContent = {
    allowed: {
      heading: "Matchar ditt fiske",
      body: `${fishingChoices.place} · ${fishingChoices.method} · ${fishingChoices.species}`,
    },
    warning: {
      heading: "Villkor finns",
      body: "Relevant information bör kontrolleras innan fisket.",
    },
    unknown: {
      heading: "Otillräcklig information",
      body: "Pike saknar tillräcklig information för att bedöma ditt val.",
    },
  }[fishingStatus] ?? {
    heading: "Otillräcklig information",
    body: "Pike saknar tillräcklig information för att bedöma ditt val.",
  };

  if (showLakeMap) {
    return (
      <LakeMap
        lake={lake}
        fishingChoices={fishingChoices}
        onBack={() => setShowLakeMap(false)}
      />
    );
  }

  const details = lake.details;
  const hasDetails = Boolean(details);

  const accessRows = hasDetails ? getAccessRows(details.access) : [];
  const methodRows = hasDetails ? getMethodRows(details.methods) : [];
  const speciesRows = hasDetails ? getSpeciesRows(details.species) : [];
  const boatRows = hasDetails ? getBoatRows(details) : [];
  const practicalRows = hasDetails ? getPracticalRows(details.practical, details.boat) : [];
  const geographyRows = hasDetails ? getGeographyRows(details.geography) : [];
  const safetyRows = hasDetails ? getSafetyRows(details.safety) : [];
  const sourceRows = hasDetails ? collectSourcesFromDetails(details) : [];
  const latestVerified = hasDetails ? formatVerifiedDate(getLatestVerificationDate(details)) : null;

  return (
    <main className="lake-page lake-page-enter">
      <header className="lake-topbar">
        <button className="round-button" onClick={onBack} aria-label="Tillbaka">
          ←
        </button>

        <strong>{lake.name}</strong>

        <button
          className="round-button favorite-button"
          onClick={onToggleFavorite}
          aria-label={
            isFavorite ? "Ta bort från favoriter" : "Spara som favorit"
          }
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </header>

      <LakeHero lake={lake} />

      <section className="lake-content lake-content-enter">
        <button className="lake-mini-map" onClick={() => setShowLakeMap(true)}>
          <span>Öppna karta</span>
          <strong>›</strong>
        </button>

        <button className="lake-fishing-summary" onClick={onOpenFishing}>
          <span>
            <small>Mitt fiske</small>
            <strong>
              {fishingChoices.place} · {fishingChoices.method} ·{" "}
              {fishingChoices.species}
            </strong>
          </span>

          <strong>›</strong>
        </button>

        <section className={`lake-status-message lake-status-message-${fishingStatus}`}>
          <strong>{statusContent.heading}</strong>
          <p>{statusContent.body}</p>
        </section>

        <section className="lake-status-grid">
          <InformationCard label="Regler" information={lake.fishing.rules} />
          <InformationCard label="Fiskekort" information={lake.fishing.permit} />
          <InformationCard label="Parkering" information={lake.practical.parking} />
          <InformationCard
            label="Fredningsområde"
            information={lake.fishing.protectedAreas}
          />
        </section>

        {hasDetails ? (
          <section className="lake-details" aria-label="Detaljerad information">
            {accessRows.length > 0 ? (
              <article className="lake-details-section">
                <h3>Fiskekort</h3>
                <ul>{accessRows.map(renderRow)}</ul>
              </article>
            ) : null}

            {methodRows.length > 0 ? (
              <article className="lake-details-section">
                <h3>Fiske</h3>
                <ul>{methodRows.map(renderRow)}</ul>
              </article>
            ) : null}

            {speciesRows.length > 0 ? (
              <article className="lake-details-section">
                <h3>Fångstregler</h3>
                <ul>{speciesRows.map(renderRow)}</ul>
              </article>
            ) : null}

            {boatRows.length > 0 ? (
              <article className="lake-details-section">
                <h3>Båt &amp; vatten</h3>
                <ul>{boatRows.map(renderRow)}</ul>
              </article>
            ) : null}

            {practicalRows.length > 0 ? (
              <article className="lake-details-section">
                <h3>Praktiskt</h3>
                <ul>{practicalRows.map(renderRow)}</ul>
              </article>
            ) : null}

            {geographyRows.length > 0 ? (
              <article className="lake-details-section">
                <h3>Områdesregler</h3>
                <ul>{geographyRows.map(renderRow)}</ul>
              </article>
            ) : null}

            {safetyRows.length > 0 ? (
              <article className="lake-details-section lake-details-section-warning">
                <h3>Viktigt</h3>
                <ul>{safetyRows.map(renderRow)}</ul>
              </article>
            ) : null}

            {sourceRows.length > 0 ? (
              <article className="lake-details-section">
                <h3>Källor</h3>

                {latestVerified ? (
                  <p className="lake-details-verified-at">Senast verifierat: {latestVerified}</p>
                ) : null}

                <ul className="lake-details-source-list">
                  {sourceRows.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}
          </section>
        ) : null}

        <section className="lake-information">
          <p className="eyebrow">Information</p>
          <h2>Vi kartlägger fortfarande {lake.name}</h2>

          <p>
            Vi har inte hunnit verifiera regler och praktisk information för
            det här vattnet ännu.
          </p>

          <button className="help-button">
            Hjälp oss förbättra informationen
          </button>

          <button className="report-button">Rapportera fel</button>
        </section>
      </section>

      {children}
    </main>
  );
}

export default LakePage;
