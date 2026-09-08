const SMHI_DOWNLOAD_ROOT = "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap";

function available(smhiLakeId, maps, details = {}) {
  return {
    status: "available",
    checkedAt: "2026-09-08",
    importedAt: "2026-09-08",
    provider: "SMHI Damm- och sjöregister",
    smhiLakeId,
    sourceUrl: `${SMHI_DOWNLOAD_ROOT}/${smhiLakeId}`,
    maps,
    bathymetry: {
      sourceType: "scanned source map",
      processingState: "needs-review",
      georeferencingStatus: "unverified",
      qualityStatus: "needs-review",
      published: false,
      reviewNote: "Källan är inventerad men har inte passerat Pikes georefererings- och vektorkontroll.",
    },
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
  ], { maxDepthMeters: 37, meanDepthMeters: 5.4, bathymetry: { sourceType: "historical multi-sheet TIFF scans", processingState: "needs-review", georeferencingStatus: "rejected-bounding-box", qualityStatus: "failed", published: false, reviewNote: "Översiktsblad och detaljblad måste georefereras var för sig. Tidigare bounding-box-passning är underkänd." } }),
  bunn: available("642633-142169", [
    { mapNumber: "1-0286", formats: ["tiff"], source: null },
  ], { surveyYear: 1975, maxDepthMeters: 20, meanDepthMeters: 6.4, bathymetry: { sourceType: "historical multi-sheet TIFF scans", processingState: "needs-review", georeferencingStatus: "unverified", qualityStatus: "needs-review", published: false, reviewNote: "Flera kartblad med bakgrundskarta, text och lodningar kräver bladvis kontroll." } }),
  sommen: available("644727-145497", [
    { mapNumber: "0-0060", formats: ["tiff"], source: "Sven Björnsson / K-konsult" },
  ], { surveyYear: 1981, maxDepthMeters: 53, meanDepthMeters: 16.7, bathymetry: { sourceType: "historical overview TIFF scans", processingState: "needs-review", georeferencingStatus: "unverified", qualityStatus: "needs-review", published: false, reviewNote: "Översiktsbladens kurvor och etiketter måste separeras från kartgrafiken." } }),
  vattern: available("649029-145550", [
    { mapNumber: "3-0736", formats: ["tiff"], source: null },
    { mapNumber: "3-3649", formats: ["tiff"], source: "SMHI" },
    { mapNumber: "3-6516", formats: ["tiff"], source: "MYRICA" },
  ], { maxDepthMeters: 120, meanDepthMeters: 40.8, bathymetry: { sourceType: "mixed TIFF/JPEG historical maps", processingState: "needs-review", georeferencingStatus: "unverified", qualityStatus: "needs-review", published: false, reviewNote: "Källpaketet blandar översikt, profil och delkartor; heltäckande verifierad konturgeometri saknas ännu." } }),
  munksjon: available("640746-140268", [
    { mapNumber: "3-6432", formats: ["jpeg", "tiff"], source: "MYRICA" },
  ], { surveyYear: 2002, maxDepthMeters: 20.4, meanDepthMeters: 9, bathymetry: { sourceType: "modern color JPEG with two-metre contours", sourceMapNumber: "3-6432", processingState: "published", georeferencingStatus: "affine-shoreline-fit", qualityStatus: "verified", published: true, verifiedAt: "2026-09-08", dataUrl: "/bathymetry/munksjon.geojson", controlPointCount: 800, shorelineMeanResidualMeters: 26.1, shorelineP90ResidualMeters: 71.3, preclipOutsidePercent: 12.06, postclipLandPointCount: 0, postclipSampleCount: 40684, reviewNote: "Tvåmeterszonerna 2–18 m är vektoriserade från MYRICA-kartan. Robust passning låter moderna urbana strandändringar vara lokala avvikelser i stället för att förvränga djupstrukturen." } }),
  rocksjon: available("640627-140342", [
    { mapNumber: "2-0136", formats: ["tiff"], source: "Jönköpings stads byggnadskontor" },
  ], { maxDepthMeters: 11.3, bathymetry: { sourceType: "historical TIFF with sounding grid", processingState: "needs-review", georeferencingStatus: "unverified", qualityStatus: "needs-review", published: false, reviewNote: "Rutnät och omgivande stadskarta kan inte automatiskt tolkas som djupkurvor." } }),
  landsjon: available("641691-140988", [
    { mapNumber: "3-0726", formats: ["tiff"], source: "Jönköpings läns Hushållningssällskap" },
  ], { surveyYear: 1919, maxDepthMeters: 11.2, meanDepthMeters: 6.6, bathymetry: { sourceType: "historical TIFF sounding transects", processingState: "needs-review", georeferencingStatus: "unverified", qualityStatus: "limited-source", published: false, reviewNote: "Underlaget visar främst mätlinjer och stödjer inte ett komplett konturlager." } }),
  ulvstorpasjon: notFound(
    "640478-139829",
    "Rätt sjö hittades i SMHI-registret men saknar publicerad djupkarta.",
  ),
  tenhultasjon: available("639911-141350", [
    { mapNumber: "3-0742", formats: ["tiff"], source: null },
    { mapNumber: "3-1829", formats: ["tiff"], source: null },
  ], { surveyYear: 1920, maxDepthMeters: 30, meanDepthMeters: 10.9, bathymetry: { sourceType: "historical TIFF sounding and contour maps", sourceMapNumber: "3-1829", processingState: "needs-review", georeferencingStatus: "affine-shoreline-fit", qualityStatus: "needs-review", published: false, controlPointCount: 800, shorelineMeanResidualMeters: 32.2, shorelineP90ResidualMeters: 79.1, postclipLandPointCount: null, postclipSampleCount: 0, reviewNote: "3-0742 visar endast lodlinjer. 3-1829 har bättre strandform och kurvor, men lodsiffror skär kurvorna och kartan anger inte kurvornas djupvärden entydigt. Georefereringen håller; konturgeometrin publiceras inte förrän linjer och värden kan separeras utan antaganden." } }),
  straken: available("642933-138293", [
    { mapNumber: "2-0212", formats: ["tiff"], source: "T. Freidenfelt" },
  ], { surveyYear: 2008, maxDepthMeters: 38, meanDepthMeters: 9.1, bathymetry: { sourceType: "scanned elongated contour map", processingState: "needs-review", georeferencingStatus: "unverified", qualityStatus: "needs-review", published: false, reviewNote: "Det smala underlaget behöver sektionsvis kontroll för att undvika längdledsförvrängning." } }),
  spexhultasjon: available("638925-143297", [
    { mapNumber: "3-2540", formats: ["tiff"], source: null },
  ], { surveyYear: 1994, maxDepthMeters: 4.5, meanDepthMeters: 2.3, bathymetry: { sourceType: "historical TIFF contour map covering two lakes", processingState: "needs-review", georeferencingStatus: "unverified", qualityStatus: "needs-review", published: false, reviewNote: "Rätt sjö måste separeras från Bäckafallasjön före georeferering." } }),
  ryssbysjon: notFound(
    "639905-143013",
    "Rätt Ryssbysjön hittades men saknar karta; kartan för den namnlika sjön på annan ort är exkluderad.",
  ),
  nommen: available("638280-144298", [
    { mapNumber: "3-1812", formats: ["tiff"], source: null },
  ], { surveyYear: 1995, bathymetry: { sourceType: "historical TIFF with dense soundings", processingState: "needs-review", georeferencingStatus: "unverified", qualityStatus: "needs-review", published: false, reviewNote: "Täta lodningar och bakgrundstext kräver säker punkt- och värdeextraktion." } }),
  risbrodammen: notFound(
    null,
    "Ingen säker träff eller publicerad djupkarta hittades i SMHI-registret.",
  ),
  mullsjon: available("642253-138558", [
    { mapNumber: "3-0727", formats: ["tiff"], source: "T. Freidenfelt" },
    { mapNumber: "0-0160", formats: ["tiff"], source: null },
  ], { surveyYear: 1922, maxDepthMeters: 18, bathymetry: { sourceType: "composite historical JPEG/TIFF survey", processingState: "needs-review", georeferencingStatus: "unverified", qualityStatus: "needs-review", published: false, reviewNote: "Överlappande rutnät, skanningsskarvar och karttext måste separeras från djupinformationen." } }),
  gravsjon: notFound(
    "642881-138626",
    "Rätt Gravsjön hittades men saknar karta; en karta för en namnlika sjö på annan ort är exkluderad.",
  ),
  sandhemssjon: available("643143-138037", [
    { mapNumber: "3-1465", formats: ["tiff"], source: "T. Freidenfelt" },
  ], { surveyYear: 1920, maxDepthMeters: 10.7, bathymetry: { sourceType: "historical TIFF sounding transects", processingState: "needs-review", georeferencingStatus: "unverified", qualityStatus: "limited-source", published: false, reviewNote: "Underlaget består främst av tvärsektioner och tabeller, inte verifierade djupkurvor." } }),
  knipesjon: available("642528-138795", [
    { mapNumber: "3-0724", formats: ["tiff"], source: null },
    { mapNumber: "3-2580", formats: ["tiff"], source: null },
    { mapNumber: "5-0026", formats: ["pdf"], source: null },
  ], { surveyYear: 2010, maxDepthMeters: 4.2, meanDepthMeters: 1.4, bathymetry: { sourceType: "modern raster PDF with one-metre color bands", sourceMapNumber: "5-0026", processingState: "published", georeferencingStatus: "affine-shoreline-fit", qualityStatus: "verified", published: true, verifiedAt: "2026-09-08", dataUrl: "/bathymetry/knipesjon.geojson", shorelineMeanResidualMeters: 37.9, shorelineP90ResidualMeters: 116.7, reviewNote: "Färgzonerna 1–4 m är vektoriserade; den grunda östra bassängen saknar påhittade extrakurvor." } }),
  hokesjon: available("642099-139212", [
    { mapNumber: "5-0025", formats: ["pdf"], source: "Länsstyrelsen / Cybera" },
  ], { surveyYear: 2010, maxDepthMeters: 5.6, meanDepthMeters: 2.9, bathymetry: { sourceType: "modern raster PDF with one-metre color bands", sourceMapNumber: "5-0025", processingState: "published", georeferencingStatus: "affine-shoreline-fit", qualityStatus: "verified", published: true, verifiedAt: "2026-09-08", dataUrl: "/bathymetry/hokesjon.geojson", shorelineMeanResidualMeters: 18.7, shorelineP90ResidualMeters: 47.1, reviewNote: "Färgzonerna 2–5 m är vektoriserade och visuellt kontrollerade mot modern strandlinje och öar." } }),
  attarpsdammen: notFound(
    null,
    "Ingen säker träff eller publicerad djupkarta hittades i SMHI-registret.",
  ),
  klappasjon: available("638147-142329", [
    { mapNumber: "3-3402", formats: ["tiff"], source: "Nässjö kommun" },
  ], { surveyYear: 1986, maxDepthMeters: 11, meanDepthMeters: 3.8, bathymetry: { sourceType: "historical TIFF contour map", processingState: "needs-review", georeferencingStatus: "rejected-bounding-box", qualityStatus: "failed", published: false, reviewNote: "Tidigare rektangulär passning är underkänd; kurvorna behöver riktiga kontrollpunkter runt öar, sund och uddar." } }),
  svansjon: available("641175-137986", [
    { mapNumber: "3-5723", formats: ["tiff"], source: "S. Simmeborn / P. Johansson" },
  ], { surveyYear: 1993, maxDepthMeters: 5.5, meanDepthMeters: 2.5, bathymetry: { sourceType: "historical TIFF with labelled contour regions", sourceMapNumber: "3-5723", processingState: "published", georeferencingStatus: "affine-shoreline-fit", qualityStatus: "verified", published: true, verifiedAt: "2026-09-08", dataUrl: "/bathymetry/svansjon.geojson", controlPointCount: 800, shorelineMeanResidualMeters: 23.9, shorelineP90ResidualMeters: 91, preclipOutsidePercent: 0.96, postclipLandPointCount: 0, postclipSampleCount: 10282, reviewNote: "Fyra uttryckligen märkta 1-, 2- och 4-metersregioner är vektoriserade. Lodpunkten 5,5 m och övrig kartgrafik är avsiktligt utelämnade; konturerna är klippta runt den moderna ön." } }),
};
