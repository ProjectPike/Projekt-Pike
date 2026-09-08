import { lakeDepthMapResearch } from "./lakeDepthMapResearch.js";

const LICENSE_URL =
  "https://www.smhi.se/data/om-smhis-data/villkor-for-anvandning";

// Image corners follow the modern OSM water geometry used when the transparent
// overlays were generated. SMHI contributes the historic depth observations;
// current shorelines and islands always define the visible mask.
function imageCorners(west, north, east, south) {
  return [[west, north], [east, north], [east, south], [west, south]];
}

const lakeDepthMapGeometry = {
  bolmen: imageCorners(13.55761976, 57.08686747, 13.86102944, 56.75334673),
  bunn: imageCorners(14.47370528, 58.015105945, 14.54363612, 57.922359655),
  sommen: imageCorners(14.957089035, 58.1535593175, 15.396331965, 57.8774631825),
  vattern: imageCorners(14.0869488275, 58.8902724425, 15.0493818725, 57.7551786575),
  munksjon: imageCorners(14.1532489525, 57.78206821, 14.1758469475, 57.76433119),
  rocksjon: imageCorners(14.18180504, 57.77855381, 14.19684356, 57.76877999),
  landsjon: imageCorners(14.28319389, 57.882525015, 14.34383391, 57.854800185),
  tenhultasjon: imageCorners(14.3280662825, 57.7096653075, 14.3567572175, 57.6753551925),
  straken: imageCorners(13.8129413575, 57.999943715, 13.8736205425, 57.765650285),
  spexhultasjon: imageCorners(14.65889454, 57.6311352325, 14.68659606, 57.5919520675),
  nommen: imageCorners(14.81712177, 57.58268922, 14.88187023, 57.49751238),
  mullsjon: imageCorners(13.8690078125, 57.9148919875, 13.8892680875, 57.9043001125),
  sandhemssjon: imageCorners(13.7746405, 58.012547275, 13.7985595, 57.987041725),
  knipesjon: imageCorners(13.88761875, 57.945954815, 13.91413125, 57.932413385),
  hokesjon: imageCorners(13.9690498075, 57.9055191225, 13.9862484925, 57.8938085775),
  klappasjon: imageCorners(14.5113391131, 57.5596848494, 14.5244800597, 57.5477843785),
  svansjon: imageCorners(13.7749911825, 57.8148325975, 13.7937659175, 57.8007753025),
};

function getSourceLabel(research) {
  const creditedSource = research.maps.find((map) => map.source)?.source;
  return creditedSource
    ? `SMHI · uppgiftskälla ${creditedSource}`
    : "SMHI:s Damm- och sjöregister";
}

export function getLakeDepthMap(lakeId) {
  const coordinates = lakeDepthMapGeometry[lakeId];
  const research = lakeDepthMapResearch[lakeId];

  if (!coordinates || research?.status !== "available") {
    return null;
  }

  const year = research.surveyYear ?? "historiskt";

  return {
    id: `${lakeId}-smhi-depth-map`,
    label: "Djupkarta",
    year,
    presentation: "map-overlay",
    imageUrl: `/depth-maps/${lakeId}-depth-overlay.png`,
    coordinates,
    sourceLabel: getSourceLabel(research),
    sourceUrl: research.sourceUrl,
    licenseLabel: "CC BY 4.0",
    licenseUrl: LICENSE_URL,
    note: `SMHI:s djupunderlag${typeof year === "number" ? ` från ${year}` : ""}, bearbetat och klippt mot modern strandlinje. Historiskt och ungefärligt underlag som inte ska användas för navigering.`,
  };
}
