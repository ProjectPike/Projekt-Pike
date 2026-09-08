const SMHI_DOWNLOAD_ROOT = "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap";

function available(smhiLakeId, maps, details = {}) {
  return {
    status: "available",
    checkedAt: "2026-09-08",
    provider: "SMHI Damm- och sjöregister",
    smhiLakeId,
    sourceUrl: `${SMHI_DOWNLOAD_ROOT}/${smhiLakeId}`,
    maps,
    ...details,
  };
}

function notFound(smhiLakeId, note) {
  return {
    status: "not-found",
    checkedAt: "2026-09-08",
    provider: "SMHI Damm- och sjöregister",
    smhiLakeId,
    maps: [],
    note,
  };
}

// Research ledger, not runtime fishing data. Every lake must have an entry so
// validate:lakes forces a depth-map check when a new lake is added.
export const lakeDepthMapResearch = {
  bolmen: available("629511-136866", [
    { mapNumber: "2-0178", formats: ["tiff"], source: "Karl Sidenvall" },
    { mapNumber: "0-0065", formats: ["tiff"], source: "Västra Bolmens båtklubb / Inge Palm" },
  ], { maxDepthMeters: 37, meanDepthMeters: 5.4 }),
  bunn: available("642633-142169", [
    { mapNumber: "1-0286", formats: ["tiff"], source: null },
  ], { surveyYear: 1975, maxDepthMeters: 20, meanDepthMeters: 6.4 }),
  sommen: available("644727-145497", [
    { mapNumber: "0-0060", formats: ["tiff"], source: "Sven Björnsson / K-konsult" },
  ], { surveyYear: 1981, maxDepthMeters: 53, meanDepthMeters: 16.7 }),
  vattern: available("649029-145550", [
    { mapNumber: "3-0736", formats: ["tiff"], source: null },
    { mapNumber: "3-3649", formats: ["tiff"], source: "SMHI" },
    { mapNumber: "3-6516", formats: ["tiff"], source: "MYRICA" },
  ], { maxDepthMeters: 120, meanDepthMeters: 40.8 }),
  munksjon: available("640746-140268", [
    { mapNumber: "3-6432", formats: ["tiff"], source: "MYRICA" },
  ], { surveyYear: 2002, maxDepthMeters: 20.4, meanDepthMeters: 9 }),
  rocksjon: available("640627-140342", [
    { mapNumber: "2-0136", formats: ["tiff"], source: "Jönköpings stads byggnadskontor" },
  ], { maxDepthMeters: 11.3 }),
  landsjon: available("641691-140988", [
    { mapNumber: "3-0726", formats: ["tiff"], source: "Jönköpings läns Hushållningssällskap" },
  ], { surveyYear: 1919, maxDepthMeters: 11.2, meanDepthMeters: 6.6 }),
  ulvstorpasjon: notFound(
    "640478-139829",
    "Rätt sjö hittades i SMHI-registret men saknar publicerad djupkarta.",
  ),
  tenhultasjon: available("639911-141350", [
    { mapNumber: "3-0742", formats: ["tiff"], source: null },
    { mapNumber: "3-1829", formats: ["tiff"], source: null },
  ], { surveyYear: 1920, maxDepthMeters: 30, meanDepthMeters: 10.9 }),
  straken: available("642933-138293", [
    { mapNumber: "2-0212", formats: ["tiff"], source: "T. Freidenfelt" },
  ], { surveyYear: 2008, maxDepthMeters: 38, meanDepthMeters: 9.1 }),
  spexhultasjon: available("638925-143297", [
    { mapNumber: "3-2540", formats: ["tiff"], source: null },
  ], { surveyYear: 1994, maxDepthMeters: 4.5, meanDepthMeters: 2.3 }),
  ryssbysjon: notFound(
    "639905-143013",
    "Rätt Ryssbysjön hittades men saknar karta; kartan för den namnlika sjön på annan ort är exkluderad.",
  ),
  nommen: available("638280-144298", [
    { mapNumber: "3-1812", formats: ["tiff"], source: null },
  ], { surveyYear: 1995 }),
  risbrodammen: notFound(
    null,
    "Ingen säker träff eller publicerad djupkarta hittades i SMHI-registret.",
  ),
  mullsjon: available("642253-138558", [
    { mapNumber: "3-0727", formats: ["tiff"], source: "T. Freidenfelt" },
    { mapNumber: "0-0160", formats: ["tiff"], source: null },
  ], { surveyYear: 1922, maxDepthMeters: 18 }),
  gravsjon: notFound(
    "642881-138626",
    "Rätt Gravsjön hittades men saknar karta; en karta för en namnlika sjö på annan ort är exkluderad.",
  ),
  sandhemssjon: available("643143-138037", [
    { mapNumber: "3-1465", formats: ["tiff"], source: "T. Freidenfelt" },
  ], { surveyYear: 1920, maxDepthMeters: 10.7 }),
  knipesjon: available("642528-138795", [
    { mapNumber: "3-0724", formats: ["tiff"], source: null },
    { mapNumber: "3-2580", formats: ["tiff"], source: null },
    { mapNumber: "5-0026", formats: ["pdf"], source: null },
  ], { surveyYear: 1922, maxDepthMeters: 4.2, meanDepthMeters: 1.4 }),
  hokesjon: available("642099-139212", [
    { mapNumber: "5-0025", formats: ["pdf"], source: "Länsstyrelsen / Cybera" },
  ], { surveyYear: 2010, maxDepthMeters: 5.6, meanDepthMeters: 2.9 }),
  attarpsdammen: notFound(
    null,
    "Ingen säker träff eller publicerad djupkarta hittades i SMHI-registret.",
  ),
  klappasjon: available("638147-142329", [
    { mapNumber: "3-3402", formats: ["tiff"], source: "Nässjö kommun" },
  ], { surveyYear: 1986, maxDepthMeters: 11, meanDepthMeters: 3.8 }),
  svansjon: available("641175-137986", [
    { mapNumber: "3-5723", formats: ["tiff"], source: "S. Simmeborn / P. Johansson" },
  ], { surveyYear: 1993, maxDepthMeters: 5.5, meanDepthMeters: 2.5 }),
};
