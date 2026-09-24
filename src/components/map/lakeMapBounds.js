const RETRIEVED_AT = "2026-09-24";

export const LAKE_MAP_FRAMING_BY_ID = Object.freeze({
  bolmen: {
    bounds: [
      [13.5648438, 56.7612877],
      [13.8538054, 57.0789265],
    ],
    osmObjectType: "relation",
    osmObjectId: 7130,
  },
  sommen: {
    bounds: [
      [14.9675472, 57.8840369],
      [15.3858738, 58.1469856],
    ],
    osmObjectType: "relation",
    osmObjectId: 254688,
  },
  vattern: {
    bounds: [
      [14.1098639, 57.7822047],
      [15.0264668, 58.8632464],
    ],
    osmObjectType: "relation",
    osmObjectId: 253599,
  },
  munksjon: {
    bounds: [
      [14.153787, 57.7647535],
      [14.1753089, 57.7816459],
    ],
    osmObjectType: "way",
    osmObjectId: 15749182,
  },
  rocksjon: {
    bounds: [
      [14.1821631, 57.7690127],
      [14.1964855, 57.7783211],
    ],
    osmObjectType: "relation",
    osmObjectId: 9893021,
  },
  landsjon: {
    bounds: [
      [14.2846377, 57.8554603],
      [14.3423901, 57.8818649],
    ],
    osmObjectType: "relation",
    osmObjectId: 15776409,
  },
  ulvstorpasjon: {
    bounds: [
      [14.0893048, 57.7557063],
      [14.0968151, 57.7583418],
    ],
    osmObjectType: "way",
    osmObjectId: 23543708,
  },
  tenhultasjon: {
    bounds: [
      [14.3287494, 57.6761721],
      [14.3560741, 57.7088484],
    ],
    osmObjectType: "way",
    osmObjectId: 23212660,
  },
  straken: {
    bounds: [
      [13.8143861, 57.7712287],
      [13.8721758, 57.9943653],
    ],
    osmObjectType: "relation",
    osmObjectId: 8027895,
  },
  spexhultasjon: {
    bounds: [
      [14.6595541, 57.592885],
      [14.6859365, 57.6302023],
    ],
    osmObjectType: "relation",
    osmObjectId: 2402331,
  },
  ryssbysjon: {
    bounds: [
      [14.6223303, 57.6917468],
      [14.6526886, 57.7148292],
    ],
    osmObjectType: "relation",
    osmObjectId: 2381619,
  },
  nommen: {
    bounds: [
      [14.8186634, 57.4995404],
      [14.8803286, 57.5806612],
    ],
    osmObjectType: "relation",
    osmObjectId: 9452,
  },
  risbrodammen: {
    bounds: [
      [13.99575, 57.81],
      [14.032, 57.8538431],
    ],
    osmObjectType: "relation",
    osmObjectId: 10523512,
  },
  mullsjon: {
    bounds: [
      [13.8694902, 57.9045523],
      [13.8887857, 57.9146398],
    ],
    osmObjectType: "relation",
    osmObjectId: 8027934,
  },
  gravsjon: {
    bounds: [
      [13.8835, 57.967881],
      [13.8915523, 57.9734393],
    ],
    osmObjectType: "way",
    osmObjectId: 43674265,
  },
  sandhemssjon: {
    bounds: [
      [13.77521, 57.987649],
      [13.79799, 58.01194],
    ],
    osmObjectType: "relation",
    osmObjectId: 123702,
  },
  knipesjon: {
    bounds: [
      [13.88825, 57.9327358],
      [13.9135, 57.9456324],
    ],
    osmObjectType: "relation",
    osmObjectId: 8150669,
  },
  hokesjon: {
    bounds: [
      [13.9694593, 57.8940874],
      [13.985839, 57.9052403],
    ],
    osmObjectType: "relation",
    osmObjectId: 8150509,
  },
  attarpsdammen: {
    bounds: [
      [14.1137453, 57.8551397],
      [14.1181126, 57.8610373],
    ],
    osmObjectType: "relation",
    osmObjectId: 8035331,
  },
  klappasjon: {
    bounds: [
      [14.5116542, 57.5480669],
      [14.5241688, 57.5594014],
    ],
    osmObjectType: "relation",
    osmObjectId: 1428762,
  },
  svansjon: {
    bounds: [
      [13.7754382, 57.80111],
      [13.7933189, 57.8144979],
    ],
    osmObjectType: "relation",
    osmObjectId: 2719114,
  },
  "mogolen-hedenstorp": {
    bounds: [
      [14.0915097, 57.7633466],
      [14.0926994, 57.7642342],
    ],
    osmObjectType: "way",
    osmObjectId: 23543551,
  },
});

export const LAKE_MAP_BOUNDS_BY_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(LAKE_MAP_FRAMING_BY_ID).map(([lakeId, framing]) => [
      lakeId,
      framing.bounds,
    ]),
  ),
);

export const LAKE_MAP_BOUNDS_PROVENANCE_BY_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(LAKE_MAP_FRAMING_BY_ID).map(([lakeId, framing]) => [
      lakeId,
      {
        osmObjectType: framing.osmObjectType,
        osmObjectId: framing.osmObjectId,
        sourceUrl: `https://www.openstreetmap.org/${framing.osmObjectType}/${framing.osmObjectId}`,
        retrievedAt: RETRIEVED_AT,
      },
    ]),
  ),
);
