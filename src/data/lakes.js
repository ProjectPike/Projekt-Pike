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
      ruleProfile: {
        prototype: true,
        note: "Prototyp-data endast, inte juridiskt korrekt.",
        conditions: [
          {
            field: "place",
            allowedValues: ["Båt"],
            status: "supported",
            note: "Prototyp: endast båt är explicit stödjer för detta vatten.",
          },
          {
            field: "method",
            allowedValues: ["Spinn"],
            status: "supported",
            note: "Prototyp: endast spinn är explicit stödjer för detta vatten.",
          },
          {
            field: "species",
            allowedValues: ["Gädda"],
            status: "supported",
            note: "Prototyp: endast gädda är explicit stödjer för detta vatten.",
          },
        ],
      },
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
      ruleProfile: {
        prototype: true,
        note: "Prototyp-data endast, inte juridiskt korrekt.",
        conditions: [
          {
            field: "place",
            allowedValues: ["Land", "Båt"],
            status: "supported",
            note: "Prototyp: detta vatten har ett villkor för landfiske och ett prototype-exempel för båt.",
          },
          {
            field: "method",
            allowedValues: ["Mete", "Flugfiske", "Spinn"],
            status: "supported",
            note: "Prototyp: endast mete, flugfiske eller spinn är explicit stödjer för detta vatten.",
          },
          {
            field: "species",
            allowedValues: ["Gädda"],
            status: "warning",
            note: "Prototyp: endast ett varnings-exempel för gädda; inte juridiskt korrekt.",
          },
        ],
      },
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
      ruleProfile: {
        prototype: true,
        note: "Prototyp-data endast, inte juridiskt korrekt.",
        conditions: [
          {
            field: "place",
            allowedValues: ["Kajak", "Flytring"],
            status: "supported",
            note: "Prototyp: endast kajak eller flytring är explicit stödjer för detta vatten.",
          },
          {
            field: "species",
            allowedValues: ["Öring"],
            status: "supported",
            note: "Prototyp: endast öring är explicit stödjer för detta vatten.",
          },
        ],
      },
    },
    practical: {
      parking: { status: "unknown", label: "Uppgift saknas", locations: [] },
      ramps: [],
      piers: [],
      trails: [],
    },
  },
};
