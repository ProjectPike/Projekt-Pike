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
      types: ["parking", "bathing-area"],
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
      types: ["parking", "bathing-area"],
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
      types: ["parking", "bathing-area"],
      name: "Odensjö badplats",
      coordinates: [13.6187, 56.8652],
      source:
        "https://www.ljungby.se/uppleva-och-gora/idrott-motion-och-friluftsliv/bad/badplatser",
      coordinateSource: "https://www.koordinater.se/intressepunkt.aspx?poiid=31111",
      verifiedAt: "2026-08-08",
    },
  ],
  bunn: [
    {
      id: "bunn-boat-ramp-rotabron",
      type: "boat-ramp",
      types: ["boat-ramp", "parking"],
      name: "Rotabron",
      coordinates: [14.516454, 57.975362],
      source: "https://bunnfiske.se/item/hitta-hit.html",
      coordinateSource: "https://www.naturkartan.se/sv/jonkopings-lan/batramp-bunn",
      verifiedAt: "2026-09-07",
      note: "Betongramp. Parkering för bil och trailer finns cirka 100 meter bort. Giltigt fiskekort för Norra Bunn krävs och rampen är sommarstängd under angiven period.",
    },
  ],
  sommen: [],
  risbrodammen: [
    {
      id: "risbrodammen-boat-rental-risbro",
      type: "boat-rental",
      types: ["boat-rental", "parking"],
      name: "Risbro båtstation",
      coordinates: [14.016333, 57.852639],
      source: "https://risbrodammen-fiske.se/",
      verifiedAt: "2026-09-07",
      note: "Fem uthyrningsbåtar och parkering. Camping är inte tillåten.",
    },
    {
      id: "risbrodammen-boat-rental-midsommarangen",
      type: "boat-rental",
      types: ["boat-rental", "parking"],
      name: "Midsommarängen båtstation",
      coordinates: [14.011361, 57.834167],
      source: "https://risbrodammen-fiske.se/",
      verifiedAt: "2026-09-07",
      note: "Fem uthyrningsbåtar och parkering. Camping är inte tillåten.",
    },
  ],
  mullsjon: [
    {
      id: "mullsjon-municipality-map-point",
      type: "shore-access",
      name: "Mullsjön – kommunens kartpunkt",
      coordinates: [13.88144, 57.911189],
      source: "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
      verifiedAt: "2026-09-07",
      note: "Kommunens anvisade kartpunkt för sjön. Båtuthyrning finns via Landhs Konditori; kontrollera utlämningsplats vid bokning.",
    },
  ],
  gravsjon: [
    {
      id: "gravsjon-municipality-map-point",
      type: "shore-access",
      name: "Gravsjön – kommunens kartpunkt",
      coordinates: [13.890796, 57.970893],
      source: "https://www.mullsjo.se/visit-mullsjo/se--gora/friluftsliv/fiska",
      verifiedAt: "2026-09-07",
      note: "Kommunens anvisade kartpunkt för sjön. Båtuthyrning finns, men utlämningsplatsen bör kontrolleras vid bokning.",
    },
  ],
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
  "bathing-area": {
    id: "bathing-area",
    label: "Badplatser",
  },
  "shore-access": {
    id: "shore-access",
    label: "Åtkomst från land",
  },
  "boat-rental": {
    id: "boat-rental",
    label: "Hyrbåtar",
  },
};

export function getLakePoints(lakeId) {
  return lakePointsByLakeId[lakeId] ?? [];
}

export function getPointTypes(point) {
  return point.types ?? [point.type];
}

export function getLakePointLayers(lakeId) {
  const points = getLakePoints(lakeId);

  return Object.values(layerDefinitions)
    .map((definition) => {
      const matchingPoints = points.filter((point) =>
        getPointTypes(point).includes(definition.id),
      );

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
