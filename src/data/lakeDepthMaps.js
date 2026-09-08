import { lakeDepthMapResearch } from "./lakeDepthMapResearch.js";

const LICENSE_URL =
  "https://www.smhi.se/data/om-smhis-data/villkor-for-anvandning";

function getSourceLabel(research) {
  const creditedSource = research.maps.find((map) => map.source)?.source;
  return creditedSource
    ? `SMHI · uppgiftskälla ${creditedSource}`
    : "SMHI:s Damm- och sjöregister";
}

function isPublishedBathymetry(bathymetry) {
  return (
    bathymetry?.published === true &&
    bathymetry.processingState === "published" &&
    bathymetry.qualityStatus === "verified" &&
    Boolean(bathymetry.dataUrl)
  );
}

export function getLakeBathymetryStatus(lakeId) {
  const research = lakeDepthMapResearch[lakeId];

  if (!research || research.status !== "available") {
    return {
      state: "unavailable",
      message: "Djupkarta saknas för detta vatten.",
    };
  }

  if (!isPublishedBathymetry(research.bathymetry)) {
    return {
      state: "needs-review",
      message: "Djupdata finns men granskas fortfarande.",
      note: research.bathymetry?.reviewNote,
    };
  }

  return {
    state: "published",
    message: "Verifierad djupkarta finns.",
  };
}

export function getLakeDepthMap(lakeId) {
  const research = lakeDepthMapResearch[lakeId];
  const bathymetry = research?.bathymetry;

  if (research?.status !== "available" || !isPublishedBathymetry(bathymetry)) {
    return null;
  }

  return {
    id: `${lakeId}-smhi-bathymetry`,
    label: "Djupkarta",
    year: research.surveyYear ?? "historiskt underlag",
    presentation: "geojson-contours",
    dataUrl: bathymetry.dataUrl,
    sourceLabel: getSourceLabel(research),
    sourceMapNumber: bathymetry.sourceMapNumber,
    sourceUrl: research.sourceUrl,
    licenseLabel: "CC BY 4.0",
    licenseUrl: LICENSE_URL,
    verifiedAt: bathymetry.verifiedAt,
    note: "Djupdata från SMHI, georefererad och vektoriserad för Pike. Historiskt eller generaliserat underlag som inte ska användas för navigering.",
  };
}
