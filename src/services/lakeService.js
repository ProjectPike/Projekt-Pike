import { lakes } from "../data/lakes.js";

/**
 * Returnerar alla sjöar som en array.
 */
export function getAllLakes() {
  return Object.values(lakes);
}

/**
 * Hämtar en sjö via id.
 */
export function getLakeById(id) {
  return lakes[id] ?? null;
}

/**
 * Söker bland namn, region och län.
 */
export function searchLakes(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return getAllLakes();
  }

  return getAllLakes().filter((lake) => {
    const searchText = [
      lake.name,
      lake.type,
      lake.region,
      ...lake.counties,
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(normalizedQuery);
  });
}

/**
 * Returnerar favoritvatten utifrån en lista med id:n.
 */
export function getFavoriteLakes(ids) {
  return ids
    .map((id) => getLakeById(id))
    .filter(Boolean);
}

const PLACE_FACT_KEYS = {
  Båt: "boat",
  Kajak: "kayak",
  Flytring: "floatTube",
};

const METHOD_FACT_KEYS = {
  Spinn: ["spin", "lureFishing"],
  Mete: ["bait"],
  Flugfiske: ["fly"],
  Trolling: ["trolling"],
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isVerifiedFact(fact) {
  return isPlainObject(fact) && fact.status === "verified" && fact.value !== "unknown";
}

function isDateInRange(date, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) {
    return true;
  }

  const isAbsoluteDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");

  if (isAbsoluteDate(dateFrom) || isAbsoluteDate(dateTo)) {
    const currentDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    const currentYear = String(date.getFullYear());
    const absoluteFrom = dateFrom
      ? isAbsoluteDate(dateFrom)
        ? dateFrom
        : `${currentYear}-${dateFrom}`
      : null;
    const absoluteTo = dateTo
      ? isAbsoluteDate(dateTo)
        ? dateTo
        : `${currentYear}-${dateTo}`
      : null;

    return (!absoluteFrom || currentDate >= absoluteFrom) &&
      (!absoluteTo || currentDate <= absoluteTo);
  }

  const currentDate = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

  if (!dateFrom) {
    return currentDate <= dateTo;
  }

  if (!dateTo) {
    return currentDate >= dateFrom;
  }

  if (dateFrom <= dateTo) {
    return currentDate >= dateFrom && currentDate <= dateTo;
  }

  return currentDate >= dateFrom || currentDate <= dateTo;
}

function isTimeInRange(date, timeFrom, timeTo) {
  if (!timeFrom && !timeTo) {
    return true;
  }

  const currentTime = `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;

  if (!timeFrom) {
    return currentTime <= timeTo;
  }

  if (!timeTo) {
    return currentTime >= timeFrom;
  }

  if (timeFrom <= timeTo) {
    return currentTime >= timeFrom && currentTime <= timeTo;
  }

  return currentTime >= timeFrom || currentTime <= timeTo;
}

function isDateConditionActive(fact, now) {
  const conditions = fact?.conditions;

  if (!isPlainObject(conditions)) {
    return true;
  }

  return isDateInRange(now, conditions.dateFrom, conditions.dateTo);
}

function isConditionActive(fact, now) {
  const conditions = fact?.conditions;

  return (
    isDateConditionActive(fact, now) &&
    (!isPlainObject(conditions) ||
      isTimeInRange(now, conditions.timeFrom, conditions.timeTo))
  );
}

function isLimitedHoursRuleActive(fact, now) {
  const conditions = fact?.conditions;

  return (
    isVerifiedFact(fact) &&
    fact.value === "allowed" &&
    isPlainObject(conditions) &&
    Boolean(conditions.timeFrom || conditions.timeTo) &&
    isDateConditionActive(fact, now)
  );
}

function isRestriction(fact, now) {
  if (!isVerifiedFact(fact)) {
    return false;
  }

  return (
    isConditionActive(fact, now) &&
    (fact.value === "restricted" ||
      fact.value === "prohibited" ||
      fact.ruleType === "advisory" ||
      fact.ruleType === "recommendation")
  );
}

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

function getPlaceMatch(details, place, now) {
  if (place === "Land") {
    return { supported: true, warning: false };
  }

  const watercraftKey = PLACE_FACT_KEYS[place];

  if (!watercraftKey) {
    return { supported: false, warning: false };
  }

  const fact = details?.watercraft?.[watercraftKey];

  if (isVerifiedFact(fact)) {
    return {
      supported: true,
      warning: isRestriction(fact, now),
    };
  }

  // A verified boat-specific rule is explicit evidence that boat fishing is supported,
  // even when the source never states the generic sentence "boat is allowed".
  if (place === "Båt") {
    const boatEvidence = [
      ["trolling", details?.methods?.trolling],
      ["boatRentalAvailable", details?.boat?.boatRentalAvailable],
      ["speedLimits", details?.boat?.speedLimits],
    ].find(([, factValue]) => isVerifiedFact(factValue));

    if (boatEvidence) {
      const [key, factValue] = boatEvidence;
      return {
        supported: true,
        warning: key === "speedLimits" || isRestriction(factValue, now),
      };
    }
  }

  return { supported: false, warning: false };
}

function getMethodMatch(details, method, now) {
  const keys = METHOD_FACT_KEYS[method] ?? [];
  const facts = keys
    .flatMap((key) => [details?.methods?.[key], details?.boat?.[key]])
    .filter(isVerifiedFact);

  const handGearOnly = details?.methods?.handGearOnly;
  const isCoveredByHandGearRule =
    ["Spinn", "Mete", "Flugfiske"].includes(method) &&
    isVerifiedFact(handGearOnly) &&
    handGearOnly.value !== "prohibited";

  if (facts.length === 0 && !isCoveredByHandGearRule) {
    return { supported: false, warning: false };
  }

  const generalMethodRules = Object.entries(details?.methods ?? {})
    .filter(([, fact]) => isVerifiedFact(fact))
    .filter(([key]) => getMethodChoiceForKey(key) === undefined);
  const selectedBoatMethodRules = Object.entries(details?.boat ?? {})
    .filter(([, fact]) => isVerifiedFact(fact))
    .filter(([key]) => getMethodChoiceForKey(key) === method);
  const hasSelectedBoatRestriction = selectedBoatMethodRules.some(
    ([key, fact]) =>
      isConditionActive(fact, now) && (!keys.includes(key) || isRestriction(fact, now)),
  );

  return {
    supported: isCoveredByHandGearRule || facts.length > 0,
    warning:
      facts.some((fact) => isRestriction(fact, now)) ||
      generalMethodRules.some(
        ([, fact]) => isRestriction(fact, now) || isLimitedHoursRuleActive(fact, now),
      ) ||
      hasSelectedBoatRestriction,
  };
}

function matchesSpecies(value, species) {
  if (!species || value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some((item) => matchesSpecies(item, species));
  }

  const normalize = (item) =>
    String(item)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const selectedToken = normalize(species);

  return normalize(value)
    .split("+")
    .some(
      (token) =>
        token === "all" ||
        token === selectedToken ||
        token.endsWith(selectedToken) ||
        (token === "laxartad" && selectedToken === "oring"),
    );
}

function getSpeciesMatch(details, species, now) {
  const speciesDetails = details?.species;

  if (!isPlainObject(speciesDetails)) {
    return { supported: false, warning: false };
  }

  const presenceFacts = [speciesDetails.knownSpecies, speciesDetails.stockedSportFish]
    .filter(isVerifiedFact)
    .filter((fact) => matchesSpecies(fact.value, species));

  const restrictionFacts = Object.values(speciesDetails)
    .filter(Array.isArray)
    .flat()
    .filter(
      (entry) =>
        isVerifiedFact(entry) &&
        matchesSpecies(entry.species ?? entry.speciesGroup, species),
    );

  const facts = [...presenceFacts, ...restrictionFacts];

  return {
    supported: facts.length > 0,
    warning: restrictionFacts.some((fact) => isConditionActive(fact, now)),
  };
}

const FISHING_CHOICE_CATEGORIES = ["place", "method", "species"];

function getSelectedChoices(selections, category) {
  const value = selections?.[category];

  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

function getChoiceMatch(details, category, choice, now) {
  if (category === "place") {
    return getPlaceMatch(details, choice, now);
  }

  if (category === "method") {
    return getMethodMatch(details, choice, now);
  }

  return getSpeciesMatch(details, choice, now);
}

function getChoiceResult(details, category, choice, now) {
  const match = getChoiceMatch(details, category, choice, now);

  return {
    choice,
    status: !match.supported ? "unknown" : match.warning ? "warning" : "allowed",
    missing: match.supported ? [] : [category],
  };
}

/**
 * Utvärderar oberoende, valfria fiskeval med OR inom kategori och AND mellan kategorier.
 */
export function getLakeFishingSelectionDetails(lake, selections = {}, now = new Date()) {
  const details = lake?.details;

  if (!details) {
    const categories = Object.fromEntries(
      FISHING_CHOICE_CATEGORIES.map((category) => [
        category,
        getSelectedChoices(selections, category).map((choice) => ({
          choice,
          status: "unknown",
          missing: [category],
        })),
      ]),
    );

    return {
      status: Object.values(categories).some((choices) => choices.length > 0)
        ? "unknown"
        : null,
      hasUnknownSelections: Object.values(categories).some((choices) => choices.length > 0),
      categories,
    };
  }

  const categories = Object.fromEntries(
    FISHING_CHOICE_CATEGORIES.map((category) => [
      category,
      getSelectedChoices(selections, category).map((choice) =>
        getChoiceResult(details, category, choice, now),
      ),
    ]),
  );
  const selectedCategories = Object.values(categories).filter(
    (choices) => choices.length > 0,
  );
  const hasWarning = selectedCategories.flat().some((choice) => choice.status === "warning");
  const hasUnknownSelections = selectedCategories.flat().some(
    (choice) => choice.status === "unknown",
  );
  const hasMissingCategory = selectedCategories.some((choices) =>
    choices.every((choice) => choice.status === "unknown"),
  );

  return {
    status: selectedCategories.length === 0
      ? null
      : hasWarning
        ? "warning"
        : hasMissingCategory
          ? "unknown"
          : "allowed",
    hasUnknownSelections,
    categories,
  };
}

/**
 * Returnerar matchstatus och saknade verifierade dimensioner för ett fiskeval.
 */
export function getLakeFishingStatusDetails(lake, fishingChoices = {}, now = new Date()) {
  const selections = Object.fromEntries(
    FISHING_CHOICE_CATEGORIES.map((category) => [category, fishingChoices[category]]),
  );
  const result = getLakeFishingSelectionDetails(lake, selections, now);
  const missing = Object.values(result.categories)
    .flat()
    .flatMap((choice) => choice.missing);

  return {
    status: result.status ?? "unknown",
    missing: result.status === "warning" ? [] : [...new Set(missing)],
  };
}

/**
 * Matchar användarens plats, metod och art mot verifierad sjödata.
 * "allowed" betyder att alla tre valen uttryckligen stöds – aldrig att allt fiske är fritt.
 */
export function getLakeFishingStatus(lake, fishingChoices = {}, now = new Date()) {
  return getLakeFishingStatusDetails(lake, fishingChoices, now).status;
}
