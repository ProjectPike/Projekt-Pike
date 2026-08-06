export const lakes = {
  bolmen: {
    id: "bolmen",
    name: "Bolmen",
    type: "sjö",
    region: "Småland",
    counties: ["Kronoberg", "Jönköping", "Halland"],
    coordinates: [13.68, 56.92],
    distance: { kilometers: 84, travelTime: "1 h 8 min" },
    verification: { status: "unverified", updatedAt: null, sources: [] },
    fishing: {
      permit: { status: "unknown", label: "Uppgift saknas" },
      rules: { status: "unverified", label: "Ej verifierade" },
      protectedAreas: { status: "checking", label: "Kontrolleras" },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  bunn: {
    id: "bunn",
    name: "Bunn",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping"],
    coordinates: [14.48, 57.91],
    distance: { kilometers: 18, travelTime: "21 min" },
    verification: { status: "unverified", updatedAt: null, sources: [] },
    fishing: {
      permit: { status: "unknown", label: "Uppgift saknas" },
      rules: { status: "unverified", label: "Ej verifierade" },
      protectedAreas: { status: "checking", label: "Kontrolleras" },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },

  sommen: {
    id: "sommen",
    name: "Sommen",
    type: "sjö",
    region: "Småland",
    counties: ["Jönköping", "Östergötland"],
    coordinates: [15.27, 58.0],
    distance: { kilometers: 97, travelTime: "1 h 19 min" },
    verification: { status: "unverified", updatedAt: null, sources: [] },
    fishing: {
      permit: { status: "unknown", label: "Uppgift saknas" },
      rules: { status: "unverified", label: "Ej verifierade" },
      protectedAreas: { status: "checking", label: "Kontrolleras" },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },
};
