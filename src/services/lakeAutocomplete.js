const maximumSuggestions = 6;

function compareLakeNames(first, second) {
  return first.name.localeCompare(second.name, "sv-SE");
}

export function getLakeAutocompleteSuggestions(lakes, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase("sv-SE");

  if (!normalizedQuery) {
    return [];
  }

  const lakeList = Object.values(lakes);
  const prefixMatches = lakeList
    .filter((lake) => lake.name.toLocaleLowerCase("sv-SE").startsWith(normalizedQuery))
    .sort(compareLakeNames);

  if (prefixMatches.length > 0) {
    return prefixMatches.slice(0, maximumSuggestions);
  }

  return lakeList
    .map((lake) => {
      if (lake.name.toLocaleLowerCase("sv-SE").includes(normalizedQuery)) {
        return { lake, rank: 0 };
      }

      const locationMatches = [lake.region, ...lake.counties].some((location) =>
        location?.toLocaleLowerCase("sv-SE").includes(normalizedQuery),
      );

      return locationMatches ? { lake, rank: 1 } : null;
    })
    .filter(Boolean)
    .sort(
      (first, second) => first.rank - second.rank || compareLakeNames(first.lake, second.lake),
    )
    .slice(0, maximumSuggestions)
    .map(({ lake }) => lake);
}
