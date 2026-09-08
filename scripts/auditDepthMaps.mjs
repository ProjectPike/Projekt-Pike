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
const georeferenced = available.filter((row) =>
  ["affine-shoreline-fit", "polynomial", "thin-plate-spline", "segmented"].includes(
    row.bathymetry?.georeferencingStatus,
  ),
);
const verified = available.filter(
  (row) => row.bathymetry?.qualityStatus === "verified",
);
const published = available.filter((row) => row.depthMap);

published.forEach((row) => {
  const assetPath = join(
    process.cwd(),
    "public",
    row.depthMap.dataUrl.replace(/^\//, ""),
  );

  if (!existsSync(assetPath)) {
    throw new Error(`${row.lake}: djupkartans bildfil saknas (${assetPath}).`);
  }
});

console.log(
  `Djupkartor: ${available.length}/${rows.length} källor, ${georeferenced.length} georefererade, ${verified.length} verifierade, ${published.length} publicerade.`,
);
console.log("\nPublicerade vektorlager:");
published.forEach((row) => {
  console.log(
    `- ${row.lake}: ${row.bathymetry.sourceMapNumber}, ${row.bathymetry.georeferencingStatus}, verifierad ${row.bathymetry.verifiedAt}`,
  );
});
console.log("\nKällor som behöver fortsatt bearbetning:");
available
  .filter((row) => !row.depthMap)
  .forEach((row) =>
    console.log(
      `- ${row.lake}: ${row.bathymetry?.qualityStatus ?? "needs-review"} · ${row.bathymetry?.reviewNote ?? "Manuell kontroll krävs."}`,
    ),
  );
console.log("\nSaknas i kontrollerad källa:");
rows
  .filter((row) => row.status === "not-found")
  .forEach((row) => console.log(`- ${row.lake}: ${row.note}`));
