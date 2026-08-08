import { lakes } from "../data/lakes";

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

/**
 * Returnerar en enkel prototyp-status för ett vattens regelmatchning.
 * Statusar:
 * - allowed: valen är explicit stödjer av prototyp-regeln
 * - warning: det finns en relevant villkor eller restriktion att läsa
 * - unknown: saknad, ofullständig eller otestad data, eller val som inte täcks av prototypen
 */
export function getLakeFishingStatus(lake, fishingChoices = {}) {
  const profile = lake?.fishing?.ruleProfile;

  if (!profile?.prototype || !Array.isArray(profile.conditions) || profile.conditions.length === 0) {
    return "unknown";
  }

  const normalizedChoices = {
    place: fishingChoices.place ?? "",
    method: fishingChoices.method ?? "",
    species: fishingChoices.species ?? "",
  };

  const selectedFields = Object.keys(normalizedChoices).filter((field) => Boolean(normalizedChoices[field]));

  if (selectedFields.length === 0) {
    return "unknown";
  }

  const matchedConditions = profile.conditions.filter((condition) => {
    const value = normalizedChoices[condition.field];
    return Boolean(value) && Array.isArray(condition.allowedValues) && condition.allowedValues.includes(value);
  });

  if (matchedConditions.length === 0) {
    return "unknown";
  }

  const coveredFields = new Set(matchedConditions.map((condition) => condition.field));
  const uncoveredFields = selectedFields.filter((field) => !coveredFields.has(field));

  if (uncoveredFields.length > 0) {
    return "unknown";
  }

  const warningConditions = matchedConditions.filter((condition) => condition.status === "warning");

  if (warningConditions.length > 0) {
    return "warning";
  }

  return "allowed";
}