const legacyBunnId = "bunn";
const bunnReplacementIds = ["bunn-norra-mellersta", "bunn-sodra"];
const bunnFamilyIds = new Set([legacyBunnId, ...bunnReplacementIds]);

function isBunnReplacementLive(lakes) {
  return (
    lakes &&
    typeof lakes === "object" &&
    !Object.hasOwn(lakes, legacyBunnId) &&
    bunnReplacementIds.every((lakeId) => Object.hasOwn(lakes, lakeId))
  );
}

export function migrateFavoriteLakeIds(favoriteIds, lakes) {
  if (
    !Array.isArray(favoriteIds) ||
    !favoriteIds.includes(legacyBunnId) ||
    !isBunnReplacementLive(lakes)
  ) {
    return favoriteIds;
  }

  const migratedIds = [];
  let insertedReplacements = false;

  for (const lakeId of favoriteIds) {
    if (bunnFamilyIds.has(lakeId)) {
      if (!insertedReplacements) {
        migratedIds.push(...bunnReplacementIds);
        insertedReplacements = true;
      }
      continue;
    }

    migratedIds.push(lakeId);
  }

  return migratedIds;
}
