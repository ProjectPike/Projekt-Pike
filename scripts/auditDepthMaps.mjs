import { lakes } from "../src/data/lakes.js";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";

const rows = Object.keys(lakes).map((lakeId) => ({
  lake: lakes[lakeId].name,
  ...lakeDepthMapResearch[lakeId],
}));
const available = rows.filter((row) => row.status === "available");
const published = available.filter((row) => row.publishedInApp);

console.log(`Djupkartor: ${available.length}/${rows.length} hittade hos SMHI, ${published.length} publicerad i Pike.`);
console.log("\nHittade, ännu inte bearbetade:");
available
  .filter((row) => !row.publishedInApp)
  .forEach((row) => console.log(`- ${row.lake}: ${row.maps.map((map) => map.mapNumber).join(", ")}`));
console.log("\nSaknas i kontrollerad källa:");
rows
  .filter((row) => row.status === "not-found")
  .forEach((row) => console.log(`- ${row.lake}: ${row.note}`));
