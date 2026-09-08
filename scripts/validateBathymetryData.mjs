import { readFileSync } from "node:fs";
import { join } from "node:path";
import { lakes } from "../src/data/lakes.js";
import { getLakeDepthMap } from "../src/data/lakeDepthMaps.js";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";

const validProcessingStates = new Set([
  "raw",
  "georeferenced",
  "verified",
  "published",
  "needs-review",
]);
const errors = [];
let publishedCount = 0;
let contourCount = 0;

for (const lakeId of Object.keys(lakes)) {
  const research = lakeDepthMapResearch[lakeId];

  if (!research) {
    errors.push(`${lakeId}: inventeringspost saknas.`);
    continue;
  }

  if (research.status !== "available") {
    continue;
  }

  const bathymetry = research.bathymetry;

  if (!bathymetry || !validProcessingStates.has(bathymetry.processingState)) {
    errors.push(`${lakeId}: ogiltigt eller saknat processingState.`);
    continue;
  }

  const runtimeMap = getLakeDepthMap(lakeId);

  if (!bathymetry.published) {
    if (runtimeMap) {
      errors.push(`${lakeId}: opublicerad data exponeras av runtime-katalogen.`);
    }
    continue;
  }

  publishedCount += 1;

  if (
    bathymetry.processingState !== "published" ||
    bathymetry.qualityStatus !== "verified" ||
    !bathymetry.verifiedAt ||
    !bathymetry.sourceMapNumber ||
    !runtimeMap
  ) {
    errors.push(`${lakeId}: publiceringsgrinden är ofullständig.`);
    continue;
  }

  const filePath = join(
    process.cwd(),
    "public",
    runtimeMap.dataUrl.replace(/^\//, ""),
  );

  let data;

  try {
    data = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${lakeId}: kan inte läsa ${filePath} (${error.message}).`);
    continue;
  }

  if (
    data.type !== "FeatureCollection" ||
    data.metadata?.lakeId !== lakeId ||
    data.metadata?.units !== "metres" ||
    data.metadata?.qualityStatus !== "verified" ||
    !String(data.metadata?.clippedTo).includes("OpenStreetMap")
  ) {
    errors.push(`${lakeId}: GeoJSON-metadata eller clipping-proveniens är ofullständig.`);
  }

  for (const feature of data.features ?? []) {
    const depth = feature.properties?.depth;
    const coordinates = feature.geometry?.coordinates;

    if (
      feature.geometry?.type !== "LineString" ||
      feature.properties?.kind !== "contour" ||
      !Number.isFinite(depth) ||
      depth <= 0 ||
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      coordinates.some(
        ([longitude, latitude]) =>
          !Number.isFinite(longitude) ||
          !Number.isFinite(latitude) ||
          longitude < -180 ||
          longitude > 180 ||
          latitude < -90 ||
          latitude > 90,
      )
    ) {
      errors.push(`${lakeId}: ogiltig djupkurva i ${filePath}.`);
      break;
    }

    contourCount += 1;
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Bathymetry validation passed: ${publishedCount} published lakes, ${contourCount} clipped contour segments.`,
  );
}
