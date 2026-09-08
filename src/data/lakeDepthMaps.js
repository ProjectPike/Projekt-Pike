const lakeDepthMaps = {
  klappasjon: {
    id: "klappasjon-smhi-1986",
    label: "Djupkarta",
    year: 1986,
    presentation: "standalone",
    imageUrl: "/depth-maps/klappasjon-pike-1986.png",
    sourceLabel: "SMHI · uppgiftskälla Nässjö kommun",
    sourceUrl:
      "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/638147-142329",
    licenseLabel: "CC BY 4.0",
    licenseUrl:
      "https://www.smhi.se/data/om-smhis-data/villkor-for-anvandning",
    note: "Historisk djupkarta från 1986, bearbetad som en fristående Pike-karta. Underlaget ska inte användas för navigering.",
  },
};

export function getLakeDepthMap(lakeId) {
  return lakeDepthMaps[lakeId] ?? null;
}
