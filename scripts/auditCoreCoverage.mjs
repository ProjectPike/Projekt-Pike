import { fishingChoices } from "../src/data/fishingChoices.js";
import {
  getAllLakes,
  getLakeFishingStatusDetails,
} from "../src/services/lakeService.js";

const referenceDate = new Date(2026, 8, 7, 12, 0);
const referenceDateTime = "2026-09-07 12:00";
const coreChoices = { place: "Land", method: "Spinn" };
const coreSpecies = fishingChoices.species;

function createStatusTotals() {
  return { allowed: 0, warning: 0, unknown: 0 };
}

function incrementCount(counts, key) {
  counts[key] += 1;
}

function percentage(value, total) {
  return total === 0 ? "0.0" : ((value / total) * 100).toFixed(1);
}

function getCoverage(status) {
  if (status === "allowed") {
    return "confirmed";
  }

  return status === "unknown" ? "missing" : "indeterminate";
}

function evaluateChoices(lakes, choicesByLake) {
  const totals = createStatusTotals();
  let total = 0;

  for (const lake of lakes) {
    for (const choices of choicesByLake(lake)) {
      incrementCount(totals, getLakeFishingStatusDetails(lake, choices, referenceDate).status);
      total += 1;
    }
  }

  return { total, ...totals };
}

const lakes = getAllLakes();
const report = {
  referenceDateTime,
  lakeCount: lakes.length,
  totalCoreCombinations: lakes.length * coreSpecies.length,
  totals: createStatusTotals(),
  strictCoverage: { confirmed: 0, missing: 0, indeterminate: 0 },
  perSpecies: Object.fromEntries(
    coreSpecies.map((species) => [species, createStatusTotals()]),
  ),
  lakes: [],
};

for (const lake of lakes) {
  const lakeReport = {
    id: lake.id,
    name: lake.name,
    totals: createStatusTotals(),
    strictCoverage: { confirmed: 0, missing: 0, indeterminate: 0 },
    combinations: [],
  };

  for (const species of coreSpecies) {
    const choices = { ...coreChoices, species };
    const result = getLakeFishingStatusDetails(lake, choices, referenceDate);
    const coverage = getCoverage(result.status);

    incrementCount(report.totals, result.status);
    incrementCount(report.perSpecies[species], result.status);
    incrementCount(report.strictCoverage, coverage);
    incrementCount(lakeReport.totals, result.status);
    incrementCount(lakeReport.strictCoverage, coverage);
    lakeReport.combinations.push({ choices, ...result, coverage });
  }

  report.lakes.push(lakeReport);
}

report.lakes.sort(
  (first, second) =>
    second.totals.unknown - first.totals.unknown || first.name.localeCompare(second.name),
);

const placeOverrides = fishingChoices.places.filter((place) => place !== coreChoices.place);
const methodOverrides = fishingChoices.methods.filter((method) => method !== coreChoices.method);

report.overrideSnapshot = {
  place: Object.fromEntries(
    placeOverrides.map((place) => [
      place,
      evaluateChoices(lakes, () =>
        coreSpecies.map((species) => ({ place, method: coreChoices.method, species })),
      ),
    ]),
  ),
  method: Object.fromEntries(
    methodOverrides.map((method) => [
      method,
      evaluateChoices(lakes, () =>
        coreSpecies.map((species) => ({ place: coreChoices.place, method, species })),
      ),
    ]),
  ),
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log("PIKE CORE COVERAGE");
console.log(`Reference datetime: ${report.referenceDateTime}`);
console.log(`Lake count: ${report.lakeCount}`);
console.log(`Core combinations: ${report.lakeCount} lakes × ${coreSpecies.length} species = ${report.totalCoreCombinations}`);
console.log("\nUser results:");
for (const status of ["allowed", "warning", "unknown"]) {
  console.log(`${status}: ${report.totals[status]} (${percentage(report.totals[status], report.totalCoreCombinations)}%)`);
}
console.log("\nStrict coverage:");
console.log(`confirmed: ${report.strictCoverage.confirmed}`);
console.log(`missing: ${report.strictCoverage.missing}`);
console.log(`indeterminate: ${report.strictCoverage.indeterminate}`);
console.log("Warning results are not claimed as strictly complete because the current API omits missing dimensions when an actionable warning exists.");
console.log("\nBy species:");
for (const species of coreSpecies) {
  const totals = report.perSpecies[species];
  console.log(`${species}: allowed ${totals.allowed}, warning ${totals.warning}, unknown ${totals.unknown}`);
}
console.log("\nLakes by unknown core combinations:");
for (const lake of report.lakes) {
  const { allowed, warning, unknown } = lake.totals;
  console.log(`${lake.name}: allowed ${allowed}, warning ${warning}, unknown ${unknown} / ${coreSpecies.length}`);
}
console.log("\nOverride snapshot: unknown user results");
for (const [place, totals] of Object.entries(report.overrideSnapshot.place)) {
  console.log(`Place ${place}: ${totals.unknown} / ${totals.total} (${percentage(totals.unknown, totals.total)}%)`);
}
for (const [method, totals] of Object.entries(report.overrideSnapshot.method)) {
  console.log(`Method ${method}: ${totals.unknown} / ${totals.total} (${percentage(totals.unknown, totals.total)}%)`);
}
console.log("\nCore = Land + Spinn. Warning means Pike has actionable verified restriction/condition data. Warning does not necessarily mean every other data dimension is complete.");