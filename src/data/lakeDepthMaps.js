const lakeDepthMaps = {
  klappasjon: {
    id: "klappasjon-smhi-1986",
    label: "Djupkarta",
    year: 1986,
    imageUrl: "/depth-maps/klappasjon-smhi-1986.png",
    coordinates: [
      [14.51102695463256, 57.55953047371568],
      [14.52448931511576, 57.55953047371568],
      [14.52448931511576, 57.54787169041902],
      [14.51102695463256, 57.54787169041902],
    ],
    sourceLabel: "SMHI · uppgiftskälla Nässjö kommun",
    sourceUrl:
      "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/638147-142329",
    licenseLabel: "CC BY 4.0",
    licenseUrl:
      "https://www.smhi.se/data/om-smhis-data/villkor-for-anvandning",
    note: "Historisk djupkarta från 1986. Georefereringen är ungefärlig och underlaget ska inte användas för navigering.",
  },
};

export function getLakeDepthMap(lakeId) {
  return lakeDepthMaps[lakeId] ?? null;
}
