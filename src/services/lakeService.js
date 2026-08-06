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