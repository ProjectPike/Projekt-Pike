export const lakePointsByLakeId = {
  bolmen: [
    {
      id: "bolmen-boat-ramp-bolmen-samhalle",
      type: "boat-ramp",
      name: "Bolmen samhälle",
      coordinates: [13.69894, 56.816084],
      source: "https://bolmensweden.com/sjosatt-din-bat/",
      verifiedAt: "2026-08-08",
    },
    {
      id: "bolmen-boat-ramp-bolmstad-hamn",
      type: "boat-ramp",
      name: "Bolmstad hamn",
      coordinates: [13.772792, 56.890308],
      source: "https://bolmensweden.com/sjosatt-din-bat/",
      verifiedAt: "2026-08-08",
    },
    {
      id: "bolmen-boat-ramp-tannaker-brofaste",
      type: "boat-ramp",
      name: "Tannåker brofästet",
      coordinates: [13.760251, 56.951978],
      source: "https://bolmensweden.com/sjosatt-din-bat/",
      verifiedAt: "2026-08-08",
    },
    {
      id: "bolmen-boat-ramp-gavlo-badplats",
      type: "boat-ramp",
      name: "Gavlö badplats",
      coordinates: [13.837797, 57.024477],
      source: "https://bolmensweden.com/sjosatt-din-bat/",
      verifiedAt: "2026-08-08",
    },
    {
      id: "bolmen-boat-ramp-karehamn",
      type: "boat-ramp",
      name: "Kårehamn",
      coordinates: [13.704451, 57.017305],
      source: "https://bolmensweden.com/sjosatt-din-bat/",
      verifiedAt: "2026-08-08",
    },
    {
      id: "bolmen-boat-ramp-bolmso-farjelage",
      type: "boat-ramp",
      name: "Bolmsö färjeläge",
      coordinates: [13.7177, 57.006647],
      source: "https://bolmensweden.com/sjosatt-din-bat/",
      verifiedAt: "2026-08-08",
    },
    {
      id: "bolmen-boat-ramp-odensjo",
      type: "boat-ramp",
      name: "Odensjö",
      coordinates: [13.617365, 56.86371],
      source: "https://bolmensweden.com/sjosatt-din-bat/",
      verifiedAt: "2026-08-08",
    },
    {
      id: "bolmen-parking-mjalen",
      type: "parking",
      name: "Mjälen",
      coordinates: [13.7782, 56.9015],
      source:
        "https://www.ljungby.se/uppleva-och-gora/idrott-motion-och-friluftsliv/bad/badplatser",
      coordinateSource: "https://www.koordinater.se/intressepunkt.aspx?poiid=31110",
      verifiedAt: "2026-08-08",
    },
    {
      id: "bolmen-parking-tannaker",
      type: "parking",
      name: "Tannåker",
      coordinates: [13.7729, 56.9545],
      source:
        "https://www.ljungby.se/uppleva-och-gora/idrott-motion-och-friluftsliv/bad/badplatser",
      coordinateSource: "https://www.koordinater.se/intressepunkt.aspx?poiid=31113",
      verifiedAt: "2026-08-08",
    },
    {
      id: "bolmen-parking-odensjo-badplats",
      type: "parking",
      name: "Odensjö badplats",
      coordinates: [13.6187, 56.8652],
      source:
        "https://www.ljungby.se/uppleva-och-gora/idrott-motion-och-friluftsliv/bad/badplatser",
      coordinateSource: "https://www.koordinater.se/intressepunkt.aspx?poiid=31111",
      verifiedAt: "2026-08-08",
    },
  ],
  bunn: [],
  sommen: [],
};

const layerDefinitions = {
  "boat-ramp": {
    id: "boat-ramp",
    label: "Båtramper",
  },
  parking: {
    id: "parking",
    label: "Parkering",
  },
  "shore-access": {
    id: "shore-access",
    label: "Åtkomst från land",
  },
};

export function getLakePointLayers(lakeId) {
  const points = lakePointsByLakeId[lakeId] ?? [];

  return Object.values(layerDefinitions)
    .map((definition) => {
      const matchingPoints = points.filter((point) => point.type === definition.id);

      if (matchingPoints.length === 0) {
        return null;
      }

      return {
        ...definition,
        points: matchingPoints,
      };
    })
    .filter(Boolean);
}

export function getPointTypeLabel(type) {
  return layerDefinitions[type]?.label ?? "Punkt";
}
