import { fishingChoices } from "../src/data/fishingChoices.js";
import {
  getAllLakes,
  getLakeFishingStatusDetails,
} from "../src/services/lakeService.js";

const referenceDate = new Date(2026, 8, 7, 12, 0);
const combinationsPerLake =
  fishingChoices.places.length *
  fishingChoices.methods.length *
  fishingChoices.species.length;

function percentage(value, total) {
  return total === 0 ? "0.0" : ((value / total) * 100).toFixed(1);
}

function incrementCount(counts, key) {
  counts[key] = (counts[key] ?? 0) + 1;
}

function createBreakdown(choices) {
  return Object.fromEntries(choices.map((choice) => [choice, 0]));
}

const report = {
  referenceDateTime: "2026-09-07 12:00",
  lakeCount: 0,
  totalCombinations: 0,
  totals: { allowed: 0, warning: 0, unknown: 0 },
  missingDimensions: { place: 0, method: 0, species: 0 },
  unknownByChoice: {
    place: createBreakdown(fishingChoices.places),
    method: createBreakdown(fishingChoices.methods),
    species: createBreakdown(fishingChoices.species),
  },
  lakes: [],
};

for (const lake of getAllLakes()) {
  const lakeReport = {
    id: lake.id,
    name: lake.name,
    totals: { allowed: 0, warning: 0, unknown: 0 },
    missingDimensions: [],
    combinations: [],
  };

  for (const place of fishingChoices.places) {
    for (const method of fishingChoices.methods) {
      for (const species of fishingChoices.species) {
        const choices = { place, method, species };
        const result = getLakeFishingStatusDetails(lake, choices, referenceDate);

        incrementCount(report.totals, result.status);
        incrementCount(lakeReport.totals, result.status);
        report.totalCombinations += 1;

        if (result.status === "unknown") {
          for (const dimension of result.missing) {
            incrementCount(report.missingDimensions, dimension);
            incrementCount(report.unknownByChoice[dimension], choices[dimension]);
          }

          lakeReport.missingDimensions.push(...result.missing);
        }

        lakeReport.combinations.push({ choices, ...result });
      }
    }
  }

  lakeReport.missingDimensions = [...new Set(lakeReport.missingDimensions)];
  report.lakes.push(lakeReport);
}

report.lakeCount = report.lakes.length;
report.lakes.sort(
  (first, second) =>
    second.totals.unknown / combinationsPerLake - first.totals.unknown / combinationsPerLake ||
    first.name.localeCompare(second.name),
);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log(`Reference datetime: ${report.referenceDateTime}`);
console.log(`Lakes: ${report.lakeCount}`);
console.log(`Combinations: ${report.totalCombinations}`);
console.log(
  `Totals: allowed ${report.totals.allowed} (${percentage(report.totals.allowed, report.totalCombinations)}%), ` +
    `warning ${report.totals.warning} (${percentage(report.totals.warning, report.totalCombinations)}%), ` +
    `unknown ${report.totals.unknown} (${percentage(report.totals.unknown, report.totalCombinations)}%)`,
);
console.log("\nLakes by unknown coverage:");
for (const lake of report.lakes) {
  const { allowed, warning, unknown } = lake.totals;
  const missing = lake.missingDimensions.length === 0 ? "none" : lake.missingDimensions.join(", ");
  console.log(
    `${lake.name}: allowed ${allowed}, warning ${warning}, unknown ${unknown} (${percentage(unknown, combinationsPerLake)}%); missing ${missing}`,
  );
}

console.log("\nMissing-dimension counts (one unknown combination can count in multiple dimensions):");
console.log(
  `place ${report.missingDimensions.place}, method ${report.missingDimensions.method}, species ${report.missingDimensions.species}`,
);
for (const dimension of ["place", "method", "species"]) {
  const breakdown = Object.entries(report.unknownByChoice[dimension])
    .map(([choice, count]) => `${choice} ${count}`)
    .join(", ");
  console.log(`${dimension}: ${breakdown}`);
}