import { existsSync } from "node:fs";
import { join } from "node:path";
import { lakes } from "../src/data/lakes.js";
import { getLakeDepthMap } from "../src/data/lakeDepthMaps.js";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";

const rows = Object.keys(lakes).map((lakeId) => ({
  lakeId,
  lake: lakes[lakeId].name,
  depthMap: getLakeDepthMap(lakeId),
  ...lakeDepthMapResearch[lakeId],
}));
const available = rows.filter((row) => row.status === "available");
const published = available.filter((row) => row.depthMap);

published.forEach((row) => {
  const assetPath = join(
    process.cwd(),
    "public",
    row.depthMap.imageUrl.replace(/^\//, ""),
  );

  if (!existsSync(assetPath)) {
    throw new Error(`${row.lake}: djupkartans bildfil saknas (${assetPath}).`);
  }
});

console.log(`Djupkartor: ${available.length}/${rows.length} hittade hos SMHI, ${published.length} publicerade i Pike.`);
console.log("\nHittade, ännu inte bearbetade:");
available
  .filter((row) => !row.depthMap)
  .forEach((row) => console.log(`- ${row.lake}: ${row.maps.map((map) => map.mapNumber).join(", ")}`));
console.log("\nSaknas i kontrollerad källa:");
rows
  .filter((row) => row.status === "not-found")
  .forEach((row) => console.log(`- ${row.lake}: ${row.note}`));
