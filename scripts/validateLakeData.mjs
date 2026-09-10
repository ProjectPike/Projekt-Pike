import { lakes } from "../src/data/lakes.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import {
  formatLakeDataValidation,
  validateLakeDataState,
} from "./lakeDataValidation.mjs";

const result = validateLakeDataState({
  lakes,
  lakeDepthMapResearch,
  lakePointsByLakeId,
  expectedLakeCount: 22,
});

if (result.errors.length > 0) {
  console.error(formatLakeDataValidation(result));
  process.exitCode = 1;
} else {
  console.log(formatLakeDataValidation(result));
}
