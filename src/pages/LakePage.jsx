import { useRef, useState } from "react";
import InformationCard from "../components/lake/InformationCard";
import LakeHero from "../components/lake/LakeHero";
import LakeMap from "../components/map/LakeMap";
import { getLakePoints, getPointTypes } from "../data/lakePoints";
import { getLakeFishingSelectionDetails } from "../services/lakeService";

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
  free: "Gratis",
  caution: "Var försiktig",
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
  handGearOnly: "Tillåtna redskap",
  openWaterMaxLuresPerPerson: "Beten på öppet vatten",
  iceMaxLuresPerPerson: "Beten vid isfiske",
  maxRodsPerPermit: "Spön per fiskekort",
  fishingSeason: "Fiskesäsong",
  fishingHoursInSeason: "Fisketider",
  outsideSeasonFishing: "Utanför säsong",
  augustSportFishingHours: "Fisketider 1–15 augusti",
  winterIceFishingAnnualPermit: "Vinterfiske med årskort",
  iceMaxAngeldonPerAngler: "Angeldon vid isfiske",
  angeldonContinuousSupervision: "Angeldon under uppsikt",
  angeldonOnlyIceCoveredWater: "Angeldon endast på islagt vatten",
  augustFishingHours: "Fisketider i augusti",
  dragFromBoatWinterIceFree: "Dragfiske från båt vintertid",
  dragRowingMaxAnglers: "Fiskande vid dragrodd",
  familyPermitMaxLinesPerAngler: "Spön per fiskare med familjekort",
  iceMaxAngeldonPerAngelkort: "Angeldon per angelkort",
  iceMaxAngeldonPerPermit: "Angeldon per fiskekort",
  iceMaxBaitsPerAngler: "Beten vid isfiske",
  lureFishing: "Kastfiske",
  maxFishingDepthMeters: "Största fiskedjup",
  maxHooksPerPerson: "Krokar per person",
  maxLinesPerFishingCard: "Spön per fiskekort",
  maxLinesPerFishingPermit: "Spön per fiskekort",
  publicFishing: "Allmänt fiske",
  summerFishing: "Sommarfiske",
  weekdayClosures: "Stängda veckodagar",
  winterFishing: "Vinterfiske",
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
  singleHookRecommendation: "Enkelkrok",
  trolling: "Trolling från båt",
  trollingMaxBaitsPerBoat: "Beten per båt vid trolling",
  trollingParticipantsNeedCard: "Fiskekort vid trolling",
  trollingPermitRequirement: "Trollingkort",
  trollingTechniquesProhibited: "Förbjudna trollingmetoder",
};

const PRACTICAL_LABELS = {
  accessibility: "Tillgänglighet",
  boatRamp: "Båtramp",
  fishingPierAtBathingArea: "Fiskebrygga",
  maxRodsPerPersonFromBoat: "Spön från båt",
  parkingAtBoatStations: "Parkering vid båtstationer",
  parkingAtLaunch: "Parkering vid iläggning",
  piers: "Bryggor",
  ramp: "Båtramp",
  ramps: "Båtramper",
  rampsAvailable: "Båtramper",
  rentalAgeRule: "Åldersregel för hyrbåt",
  rentalStations: "Båtstation",
  visitorFacilities: "Service vid sjön",
};

const GEOGRAPHY_LABELS = {
  fishingProhibitionAreas: "Fiskeförbud",
  protectedAreas: "Skyddsområde",
  seasonalAreas: "Säsongsområde",
  tributaries: "Tillrinnande vatten",
};

const SAFETY_LABELS = {
  consumptionAdvisories: "Kostråd",
  invasiveSpeciesHygiene: "Hindra smittspridning",
  navigationNotes: "På sjön",
};

const WATER_ACCESS_PRACTICAL_KEYS = new Set([
  "boatRamp",
  "parkingAtLaunch",
  "ramp",
  "ramps",
  "rampsAvailable",
]);

const BOAT_ONLY_PRACTICAL_KEYS = new Set([
  "maxRodsPerPersonFromBoat",
  "parkingAtBoatStations",
  "rentalAgeRule",
  "rentalStations",
]);

const LAND_ONLY_PRACTICAL_KEYS = new Set([
  "fishingPierAtBathingArea",
  "piers",
]);

const PLACE_WATERCRAFT_KEYS = {
  Båt: "boat",
  Kajak: "kayak",
  Flytring: "floatTube",
};

function getMethodChoiceForKey(key) {
  const normalizedKey = key.toLowerCase();

  if (normalizedKey.includes("trolling") || normalizedKey.includes("dragrowing")) {
    return "Trolling";
  }

  if (normalizedKey === "spin" || normalizedKey.includes("lurefishing")) {
    return "Spinn";
  }

  if (normalizedKey === "bait") {
    return "Mete";
  }

  if (normalizedKey === "fly") {
    return "Flugfiske";
  }

  if (
    normalizedKey === "ice" ||
    normalizedKey.includes("ice") ||
    normalizedKey.includes("angeldon") ||
    normalizedKey.includes("crayfish") ||
    normalizedKey === "nets" ||
    normalizedKey === "fixedgear"
  ) {
    return null;
  }

  return undefined;
}

function isRelevantMethodKey(key, selectedMethods) {
  if (selectedMethods.length === 0) {
    return true;
  }

  const methodChoice = getMethodChoiceForKey(key);
  return (
    methodChoice === undefined ||
    selectedMethods.includes(methodChoice)
  );
}

function matchesSelectedSpecies(value, selectedSpecies) {
  if (value === null || value === undefined) {
    return false;
  }

  if (selectedSpecies.length === 0) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => matchesSelectedSpecies(item, selectedSpecies));
  }

  const normalize = (item) =>
    formatToken(item)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("sv");
  return selectedSpecies.some((selectedSpeciesValue) => {
    const selectedToken = normalize(selectedSpeciesValue);

    return normalize(value)
      .split("+")
      .some(
        (token) =>
          token === "all" ||
          token === selectedToken ||
          token.endsWith(selectedToken) ||
          (token === "laxartad" && selectedToken === "oring"),
      );
  });
}

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

  const parts = value.split("-");
  const hasYear = parts.length === 3;
  const [yearString, monthString, dayString] = hasYear
    ? parts
    : [null, ...parts];
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

  return `${day} ${months[month - 1] ?? ""}${hasYear ? ` ${yearString}` : ""}`.trim();
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

    if (typeof value.maxPerFishingCardPerDay === "number") {
      return `max ${value.maxPerFishingCardPerDay}/dygn`;
    }

    if (typeof value.maxPerPersonPerDay === "number") {
      const charLimit = value.maxRodingPerPersonPerDay;
      return typeof charLimit === "number"
        ? `max ${value.maxPerPersonPerDay}/dygn · högst ${charLimit} rödingar`
        : `max ${value.maxPerPersonPerDay}/dygn`;
    }
  }

  return null;
}

function formatToken(value) {
  const token = String(value);
  if (token.includes("+")) {
    return token
      .split("+")
      .map((part) => formatToken(part))
      .join(" + ");
  }

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
    all: "Alla arter",
    "bäckröding": "Bäckröding",
    gers: "Gärs",
    gädda: "Gädda",
    gärs: "Gärs",
    gös: "Gös",
    harr: "Harr",
    lax: "Lax",
    laxartad: "Laxartad fisk",
    mört: "Mört",
    nors: "Nors",
    ruda: "Ruda",
    röding: "Röding",
    sarv: "Sarv",
    signalkräfta: "Signalkräfta",
    siklöja: "Siklöja",
    ål: "Ål",
    öring: "Öring",
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

function getMethodRows(detailsMethods, selectedMethods, showAll) {
  if (!isPlainObject(detailsMethods)) {
    return [];
  }

  return Object.entries(detailsMethods)
    .filter(([, fact]) => isFactObject(fact))
    .filter(([key]) => showAll || isRelevantMethodKey(key, selectedMethods))
    .map(([key, fact]) => {
      if (fact.value === "unknown") {
        return null;
      }

      const label = METHOD_LABELS[key] ?? prettifyKey(key);
      const valueLabel =
        key === "maxFishingDepthMeters" && typeof fact.value === "number"
          ? `${fact.value} m`
          : getStateLabel(fact.value);
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

function getSpeciesRows(detailsSpecies, selectedSpecies, showAll) {
  if (!isPlainObject(detailsSpecies)) {
    return [];
  }

  const rows = [];

  if (isFactObject(detailsSpecies.knownSpecies) && Array.isArray(detailsSpecies.knownSpecies.value)) {
    const visibleSpecies = showAll
      ? detailsSpecies.knownSpecies.value
      : detailsSpecies.knownSpecies.value.filter((species) =>
          matchesSelectedSpecies(species, selectedSpecies),
        );

    if (visibleSpecies.length > 0) {
      rows.push({
        label: showAll ? "Arter" : "Vald art",
        value: visibleSpecies.map((species) => formatToken(species)).join(", "),
        note: showAll ? detailsSpecies.knownSpecies.note : null,
        conditions: getConditionText(detailsSpecies.knownSpecies.conditions),
        tone: getTone(detailsSpecies.knownSpecies.ruleType),
        toneLabel: getToneLabel(detailsSpecies.knownSpecies.ruleType),
      });
    }
  }

  if (isFactObject(detailsSpecies.stockedSportFish) && Array.isArray(detailsSpecies.stockedSportFish.value)) {
    const visibleSpecies = showAll
      ? detailsSpecies.stockedSportFish.value
      : detailsSpecies.stockedSportFish.value.filter((species) =>
          matchesSelectedSpecies(species, selectedSpecies),
        );

    if (visibleSpecies.length > 0) {
      rows.push({
        label: "Inplanterade arter",
        value: visibleSpecies.map((species) => formatToken(species)).join(", "),
        note: detailsSpecies.stockedSportFish.note,
        conditions: getConditionText(detailsSpecies.stockedSportFish.conditions),
        tone: getTone(detailsSpecies.stockedSportFish.ruleType),
        toneLabel: getToneLabel(detailsSpecies.stockedSportFish.ruleType),
      });
    }
  }

  if (Array.isArray(detailsSpecies.sizeLimits)) {
    detailsSpecies.sizeLimits
      .filter((entry) => showAll || matchesSelectedSpecies(entry.species, selectedSpecies))
      .forEach((entry) => {
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
    detailsSpecies.bagLimits
      .filter(
        (entry) =>
          showAll ||
          matchesSelectedSpecies(entry.species ?? entry.speciesGroup, selectedSpecies),
      )
      .forEach((entry) => {
      const bagText = getStateLabel(entry.value);
      if (!bagText) {
        return;
      }

      rows.push({
        label: `${formatToken(entry.species ?? entry.speciesGroup ?? "Art")} · Fångstgräns`,
        value: bagText,
        note: entry.note,
        conditions: getConditionText(entry.conditions),
        tone: getTone(entry.ruleType),
        toneLabel: getToneLabel(entry.ruleType),
      });
    });
  }

  if (Array.isArray(detailsSpecies.closedSeasons)) {
    detailsSpecies.closedSeasons
      .filter((entry) => showAll || matchesSelectedSpecies(entry.species, selectedSpecies))
      .forEach((entry) => {
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
    detailsSpecies.releaseRequirements
      .filter((entry) => showAll || matchesSelectedSpecies(entry.species, selectedSpecies))
      .forEach((entry) => {
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
    detailsSpecies.releaseRestrictions
      .filter((entry) => showAll || matchesSelectedSpecies(entry.species, selectedSpecies))
      .forEach((entry) => {
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

  const directedFishingRules = [
    ...(Array.isArray(detailsSpecies.directedFishingProhibitions)
      ? detailsSpecies.directedFishingProhibitions
      : []),
    ...(Array.isArray(detailsSpecies.directedFishingRestrictions)
      ? detailsSpecies.directedFishingRestrictions
      : []),
  ];

  if (directedFishingRules.length > 0) {
    directedFishingRules
      .filter((entry) => showAll || matchesSelectedSpecies(entry.species, selectedSpecies))
      .forEach((entry) => {
        rows.push({
          label: `${formatToken(entry.species ?? "Art")} · Riktat fiske`,
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

function getInferredWatercraftEntries(detailsWatercraft) {
  if (!isPlainObject(detailsWatercraft)) {
    return detailsWatercraft;
  }

  const boatFact = detailsWatercraft.boat;
  const canInferKayakOrFloatTube =
    isFactObject(boatFact) &&
    boatFact.value === "allowed" &&
    boatFact.status === "verified";

  if (!canInferKayakOrFloatTube) {
    return detailsWatercraft;
  }

  const inferredEntries = { ...detailsWatercraft };

  ["kayak", "floatTube"].forEach((key) => {
    const fact = inferredEntries[key];
    if (isFactObject(fact) && fact.value !== "unknown") {
      return;
    }

    inferredEntries[key] = {
      value: "allowed",
      status: "inferred",
      ruleType: "advisory",
      verifiedAt: null,
      sources: [],
      note: "Härlett från verifierad uppgift att båt är tillåten.",
      conditions: null,
    };
  });

  return inferredEntries;
}

function getBoatRows(details, selectedPlaces, selectedMethods, showAll) {
  const rows = [];
  const watercraftEntries = getInferredWatercraftEntries(details?.watercraft);
  const selectedWatercraftKeys = selectedPlaces
    .map((place) => PLACE_WATERCRAFT_KEYS[place])
    .filter(Boolean);

  if (isPlainObject(watercraftEntries)) {
    Object.entries(watercraftEntries)
      .filter(([, fact]) => isFactObject(fact))
      .filter(([key]) => showAll || selectedPlaces.length === 0 || selectedWatercraftKeys.includes(key))
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
      .filter(([key]) => key !== "boatRentalAvailable")
      .filter(([key]) => {
        if (showAll) {
          return true;
        }

        if (selectedPlaces.length > 0 && !selectedPlaces.includes("Båt")) {
          return false;
        }

        const methodChoice = getMethodChoiceForKey(key);
        return (
          methodChoice === undefined ||
          selectedMethods.length === 0 ||
          selectedMethods.includes(methodChoice)
        );
      })
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

function getPracticalRows(detailsPractical, detailsBoat, selectedPlaces, showAll) {
  const rows = [];

  if (
    (showAll || selectedPlaces.length === 0 || selectedPlaces.includes("Båt")) &&
    isPlainObject(detailsBoat?.boatRentalAvailable) &&
    detailsBoat.boatRentalAvailable.value !== "unknown"
  ) {
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
    .filter(([key]) => showAll || isRelevantPracticalKey(key, selectedPlaces))
    .forEach(([key, fact]) => {
      if (fact.value === "unknown") {
        return;
      }

      rows.push({
        label: PRACTICAL_LABELS[key] ?? prettifyKey(key),
        value: getStateLabel(fact.value),
        note: fact.note,
        conditions: getConditionText(fact.conditions),
        tone: getTone(fact.ruleType),
        toneLabel: getToneLabel(fact.ruleType),
      });
    });

  Object.entries(detailsPractical)
    .filter(([, value]) => Array.isArray(value))
    .filter(([key]) => showAll || isRelevantPracticalKey(key, selectedPlaces))
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
          label: key === "rentalStations" ? "Hyrbåt" : PRACTICAL_LABELS[key] ?? prettifyKey(key),
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

function isRelevantPracticalKey(key, selectedPlaces) {
  if (selectedPlaces.length === 0) {
    return true;
  }

  if (BOAT_ONLY_PRACTICAL_KEYS.has(key)) {
    return selectedPlaces.includes("Båt");
  }

  if (WATER_ACCESS_PRACTICAL_KEYS.has(key)) {
    return selectedPlaces.some((place) => place !== "Land");
  }

  if (LAND_ONLY_PRACTICAL_KEYS.has(key)) {
    return selectedPlaces.includes("Land");
  }

  return true;
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
        label: GEOGRAPHY_LABELS[key] ?? prettifyKey(key),
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
          label: entry.name ?? GEOGRAPHY_LABELS[key] ?? prettifyKey(key),
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
        label: SAFETY_LABELS[key] ?? prettifyKey(key),
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
              : SAFETY_LABELS[key] ?? prettifyKey(key),
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
            label: getSourceName(source.url),
            typeLabel: SOURCE_TYPE_LABELS[source.type] ?? "Källa",
          });
        }
      });
    }

    Object.values(value).forEach(walk);
  }

  walk(details);

  return Array.from(sourceMap.values());
}

function getSourceName(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    const knownSources = {
      "bolmensweden.com": "Bolmens FVO",
      "bunnfiske.se": "Bunns FVO",
      "hittafiske.se": "Hittafiske",
      "hokesjon.se": "Hökesjöns FVO",
      "ifiske.se": "iFiske",
      "jonkoping.se": "Jönköpings kommun",
      "jsf-fiske.net": "Jönköpings sportfiskeklubb",
      "mullsjo.se": "Mullsjö kommun",
      "mullsjosfk.se": "Mullsjö sportfiskeklubb",
      "nassjo.se": "Nässjö kommun",
      "risbrodammen-fiske.se": "Risbrodammens FVO",
      "sommen.org": "Sommens FVO",
      "spexhultasjon.se": "Spexhultasjöns FVO",
      "vattern.org": "Vätternvårdsförbundet",
      "viss.lansstyrelsen.se": "Länsstyrelsens VISS",
    };

    return knownSources[hostname] ?? hostname;
  } catch {
    return "Källa";
  }
}

function formatSwedishList(values) {
  if (values.length <= 1) {
    return values[0] ?? "";
  }

  return `${values.slice(0, -1).join(", ")} och ${values.at(-1)}`;
}

function getUnknownChoiceLabels(categories) {
  const labels = {
    place: "fiske från",
    method: "metoden",
    species: "arten",
  };

  return Object.entries(categories).flatMap(([category, choices]) =>
    choices
      .filter((choice) => choice.status === "unknown")
      .map((choice) => `${labels[category]} ${choice.choice.toLocaleLowerCase("sv")}`),
  );
}

function getWarningChoiceLabels(categories) {
  return Object.values(categories)
    .flat()
    .filter((choice) => choice.status === "warning")
    .map((choice) => choice.choice);
}

function getChoiceStatusLabel(status) {
  return {
    allowed: "Stöds",
    warning: "Villkor finns",
    unknown: "Uppgift saknas",
  }[status];
}

function getChoiceStatusSymbol(status) {
  return { allowed: "✓", warning: "!", unknown: "?" }[status];
}

function getParkingSummary(lake, lakePoints) {
  const hasParkingPoint = lakePoints.some((point) =>
    getPointTypes(point).includes("parking"),
  );
  const parkingFacts = [
    lake.details?.practical?.parkingAtBoatStations,
    lake.details?.practical?.parkingAtLaunch,
  ];
  const hasVerifiedParking = parkingFacts.some(
    (fact) => fact?.status === "verified" && fact.value === "present",
  );

  if (hasParkingPoint || hasVerifiedParking) {
    return { status: "verified", label: "Finns" };
  }

  return lake.practical.parking;
}

function getProtectedAreaSummary(lake, geographyRows) {
  if (geographyRows.length > 0) {
    return { status: "restricted", label: "Särskilda regler" };
  }

  return lake.fishing.protectedAreas;
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

function isDirectConditionRow(row, section) {
  if (section === "species") {
    return row.label !== "Vald art" && row.label !== "Inplanterade arter";
  }

  return (
    ["Förbjudet", "Särskilda regler", "Krävs", "Var försiktig"].includes(row.value) ||
    Boolean(row.conditions) ||
    row.tone === "advisory" ||
    row.tone === "recommendation"
  );
}

function LakePage({
  lake,
  fishingChoices,
  fishingSelectionSummary,
  isFavorite,
  onToggleFavorite,
  onBack,
  onOpenFishing,
  children,
}) {
  const [showLakeMap, setShowLakeMap] = useState(false);
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [showDirectConditions, setShowDirectConditions] = useState(false);
  const [expandedUnknownChoice, setExpandedUnknownChoice] = useState(null);
  const directConditionsRef = useRef(null);
  const fishingStatusDetails = getLakeFishingSelectionDetails(lake, fishingChoices);
  const fishingStatus = fishingStatusDetails.status;
  const missingChoiceLabels = getUnknownChoiceLabels(fishingStatusDetails.categories);
  const warningChoiceLabels = getWarningChoiceLabels(fishingStatusDetails.categories);
  const hasSelectedChoices = Object.values(fishingChoices).some((choices) => choices.length > 0);

  function openDirectConditions() {
    setShowDirectConditions(true);
    requestAnimationFrame(() => {
      directConditionsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  const statusContent = {
    allowed: {
      heading: "Matchar ditt fiske",
      body: "De val du gjort stöds av informationen vi har för sjön.",
    },
    "allowed-unknown": {
      heading: "Bra match",
      body: "Pike hittade ett användbart verifierat alternativ, men vissa val saknar verifierad information.",
    },
    warning: {
      heading: "Villkor finns",
      body: "Vi hittade regler som berör ditt val. Tryck för att se dem direkt.",
    },
    unknown: {
      heading: "Kan inte bedömas ännu",
      body: missingChoiceLabels.length > 0
        ? `Verifierad information saknas om ${formatSwedishList(missingChoiceLabels)}.`
        : "Pike saknar tillräcklig information för att bedöma ditt val.",
    },
    null: {
      heading: "Välj ditt fiske",
      body: "Välj plats, metod eller art för att se hur sjön matchar.",
    },
  }[fishingStatus === "allowed" && fishingStatusDetails.hasUnknownSelections
    ? "allowed-unknown"
    : fishingStatus];

  if (showLakeMap) {
    return (
      <LakeMap
        key={lake.id}
        lake={lake}
        onBack={() => setShowLakeMap(false)}
      />
    );
  }

  const details = lake.details;
  const hasDetails = Boolean(details);
  const lakePoints = getLakePoints(lake.id);

  const accessRows = hasDetails ? getAccessRows(details.access) : [];
  const methodRows = hasDetails
    ? getMethodRows(details.methods, fishingChoices.method, showAllDetails)
    : [];
  const speciesRows = hasDetails
    ? getSpeciesRows(details.species, fishingChoices.species, showAllDetails)
    : [];
  const boatRows = hasDetails
    ? getBoatRows(details, fishingChoices.place, fishingChoices.method, showAllDetails)
    : [];
  const practicalRows = hasDetails
    ? getPracticalRows(details.practical, details.boat, fishingChoices.place, showAllDetails)
    : [];
  const geographyRows = hasDetails ? getGeographyRows(details.geography) : [];
  const safetyRows = hasDetails ? getSafetyRows(details.safety) : [];
  const directConditionRows = [
    ...methodRows.filter((row) => isDirectConditionRow(row, "method")),
    ...speciesRows.filter((row) => isDirectConditionRow(row, "species")),
    ...boatRows.filter((row) => isDirectConditionRow(row, "boat")),
  ];
  const sourceRows = hasDetails ? collectSourcesFromDetails(details) : [];
  const latestVerified = hasDetails ? formatVerifiedDate(getLatestVerificationDate(details)) : null;
  const allChoiceSpecificRowCount = hasDetails
    ? getMethodRows(details.methods, fishingChoices.method, true).length +
      getSpeciesRows(details.species, fishingChoices.species, true).length +
      getBoatRows(details, fishingChoices.place, fishingChoices.method, true).length +
      getPracticalRows(details.practical, details.boat, fishingChoices.place, true).length
    : 0;
  const visibleChoiceSpecificRowCount =
    methodRows.length + speciesRows.length + boatRows.length + practicalRows.length;
  const hiddenDetailCount = Math.max(
    0,
    allChoiceSpecificRowCount - visibleChoiceSpecificRowCount,
  );
  const summaryCards = hasDetails
    ? [
        ["Parkering", getParkingSummary(lake, lakePoints)],
        ["Områdesregler", getProtectedAreaSummary(lake, geographyRows)],
      ]
    : [
        ["Regler", lake.fishing.rules],
        ["Fiskekort", lake.fishing.permit],
        ["Parkering", lake.practical.parking],
        ["Fredningsområde", lake.fishing.protectedAreas],
      ];

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
          <span>
            <small>Karta</small>
            <strong>
              {lakePoints.length > 0
                ? `${lakePoints.length} verifierade platser`
                : "Öppna sjökartan"}
            </strong>
          </span>
          <strong>›</strong>
        </button>

        <button className="lake-fishing-summary" onClick={onOpenFishing}>
          <span>
            <small>Mitt fiske</small>
            <strong>{fishingSelectionSummary}</strong>
          </span>

          <strong>›</strong>
        </button>

        {hasSelectedChoices ? (
          <section className="lake-choice-status" aria-label="Dina val">
            <h2>Dina val</h2>
            {Object.entries(fishingStatusDetails.categories).map(([category, choices]) =>
              choices.length > 0 ? (
                <div key={category} className="lake-choice-status-category">
                  <h3>{{ place: "Plats", method: "Metod", species: "Art" }[category]}</h3>
                  <ul>
                    {choices.map((choice) => {
                      const choiceKey = `${lake.id}:${category}:${choice.choice}`;
                      const isUnknownExpanded = expandedUnknownChoice === choiceKey;
                      const content = <>
                        <span aria-hidden="true">{getChoiceStatusSymbol(choice.status)}</span>
                        <strong>{choice.choice}</strong>
                        <small>{getChoiceStatusLabel(choice.status)}</small>
                      </>;

                      return (
                        <li key={choice.choice} className={`lake-choice-status-${choice.status}`}>
                          {choice.status === "warning" ? (
                            <button
                              type="button"
                              className="lake-choice-status-action"
                              onClick={openDirectConditions}
                              aria-controls="direct-fishing-conditions"
                              aria-expanded={showDirectConditions}
                            >
                              {content}
                            </button>
                          ) : choice.status === "unknown" ? (
                            <>
                              <button
                                type="button"
                                className="lake-choice-status-action"
                                onClick={() => setExpandedUnknownChoice(
                                  isUnknownExpanded ? null : choiceKey,
                                )}
                                aria-expanded={isUnknownExpanded}
                                aria-controls={`unknown-choice-${lake.id}-${choiceKey}`}
                              >
                                {content}
                              </button>
                              {isUnknownExpanded ? (
                                <p id={`unknown-choice-${lake.id}-${choiceKey}`} className="lake-choice-status-explanation">
                                  Pike saknar verifierad information för det här valet. Det betyder inte att det är förbjudet.
                                </p>
                              ) : null}
                            </>
                          ) : content}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null,
            )}
          </section>
        ) : null}

        {fishingStatus === "warning" ? (
          <>
            <button
              type="button"
              className={`lake-status-message lake-status-message-${fishingStatus} lake-status-message-button`}
              onClick={() => setShowDirectConditions((current) => !current)}
              aria-expanded={showDirectConditions}
              aria-controls="direct-fishing-conditions"
            >
              <span>
                <strong>{statusContent.heading}</strong>
                <p>{statusContent.body}</p>
              </span>
              <strong className="lake-status-chevron" aria-hidden="true">
                {showDirectConditions ? "⌃" : "⌄"}
              </strong>
            </button>

            {showDirectConditions ? (
              <section
                id="direct-fishing-conditions"
                ref={directConditionsRef}
                className="lake-direct-conditions"
                aria-label="Villkor för ditt fiske"
              >
                <header>
                  <span>
                    <small>Villkor berör: {formatSwedishList(warningChoiceLabels)}</small>
                    <strong>
                      {fishingSelectionSummary}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDirectConditions(false)}
                    aria-label="Stäng villkor"
                  >
                    ×
                  </button>
                </header>

                {directConditionRows.length > 0 ? (
                  <ul>{directConditionRows.map(renderRow)}</ul>
                ) : (
                  <p>
                    Ett verifierat villkor berör minst ett av dina val. Se
                    regelinformationen nedanför för fullständig formulering.
                  </p>
                )}
              </section>
            ) : null}
          </>
        ) : (
          <section className={`lake-status-message lake-status-message-${fishingStatus}`}>
            <strong>{statusContent.heading}</strong>
            <p>{statusContent.body}</p>
          </section>
        )}

        <section className="lake-status-grid" aria-label="Snabbinfo">
          {summaryCards.map(([label, information]) => (
            <InformationCard key={label} label={label} information={information} />
          ))}
        </section>

        {hasDetails ? (
          <section className="lake-details" aria-label="Detaljerad information">
            <header className="lake-details-header">
              <div>
                <p className="eyebrow">Sjöinformation</p>
                <h2>Regler &amp; praktiskt</h2>
              </div>

              <div className="lake-details-header-meta">
                {latestVerified ? <small>Verifierat {latestVerified}</small> : null}

                {hasSelectedChoices && (showAllDetails || hiddenDetailCount > 0) ? (
                  <button
                    type="button"
                    className="lake-details-filter-button"
                    onClick={() => setShowAllDetails((current) => !current)}
                  >
                    {showAllDetails
                      ? "Visa bara mitt fiske"
                      : `Visa all info (${hiddenDetailCount})`}
                  </button>
                ) : null}
              </div>
            </header>

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
              <article className="lake-details-section lake-details-sources">
                <h3>Källor</h3>

                <ul className="lake-details-source-list">
                  {sourceRows.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        <span>{source.label}</span>
                        <small>{source.typeLabel}</small>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}
          </section>
        ) : null}

        {!hasDetails ? (
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
          </section>
        ) : (
          <section className="lake-feedback" aria-label="Återkoppling">
            <span>Saknas något eller ser fel ut?</span>
            <a
              className="report-button"
              href={`mailto:projektpike@gmail.com?subject=${encodeURIComponent(`Felaktig sjöinformation: ${lake.name}`)}`}
            >
              Rapportera fel
            </a>
          </section>
        )}
      </section>

      {children}
    </main>
  );
}

export default LakePage;
