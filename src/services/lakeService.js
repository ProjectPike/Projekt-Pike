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

function hasConditions(fact) {
  if (!isPlainObject(fact?.conditions)) {
    return false;
  }

  return Object.values(fact.conditions).some(Boolean);
}

function isRestriction(fact) {
  if (!isVerifiedFact(fact)) {
    return false;
  }

  return (
    fact.value === "restricted" ||
    fact.value === "prohibited" ||
    fact.ruleType === "advisory" ||
    fact.ruleType === "recommendation" ||
    hasConditions(fact)
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

function getPlaceMatch(details, place) {
  const watercraftKey = PLACE_FACT_KEYS[place];

  if (!watercraftKey) {
    return { supported: false, warning: false };
  }

  const fact = details?.watercraft?.[watercraftKey];

  if (isVerifiedFact(fact)) {
    return {
      supported: fact.value === "allowed" || fact.value === "restricted",
      warning: isRestriction(fact),
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
        warning: key === "speedLimits" || isRestriction(factValue),
      };
    }
  }

  return { supported: false, warning: false };
}

function getMethodMatch(details, method) {
  const keys = METHOD_FACT_KEYS[method] ?? [];
  const facts = keys
    .flatMap((key) => [details?.methods?.[key], details?.boat?.[key]])
    .filter(isVerifiedFact);

  if (facts.length === 0) {
    return { supported: false, warning: false };
  }

  const generalMethodRules = Object.entries(details?.methods ?? {})
    .filter(([, fact]) => isVerifiedFact(fact))
    .filter(([key]) => getMethodChoiceForKey(key) === undefined);
  const selectedBoatMethodRules = Object.entries(details?.boat ?? {})
    .filter(([, fact]) => isVerifiedFact(fact))
    .filter(([key]) => getMethodChoiceForKey(key) === method);
  const hasSelectedBoatRestriction = selectedBoatMethodRules.some(
    ([key, fact]) => !keys.includes(key) || isRestriction(fact),
  );

  return {
    supported: facts.some((fact) => fact.value === "allowed" || fact.value === "restricted"),
    warning:
      facts.some(isRestriction) ||
      generalMethodRules.length > 0 ||
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

function getSpeciesMatch(details, species) {
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
    warning: restrictionFacts.length > 0,
  };
}

/**
 * Matchar användarens plats, metod och art mot verifierad sjödata.
 * "allowed" betyder att alla tre valen uttryckligen stöds – aldrig att allt fiske är fritt.
 */
export function getLakeFishingStatus(lake, fishingChoices = {}) {
  const details = lake?.details;

  if (!details) {
    return "unknown";
  }

  const matches = [
    getPlaceMatch(details, fishingChoices.place),
    getMethodMatch(details, fishingChoices.method),
    getSpeciesMatch(details, fishingChoices.species),
  ];

  if (matches.some((match) => !match.supported)) {
    return "unknown";
  }

  return matches.some((match) => match.warning) ? "warning" : "allowed";
}
