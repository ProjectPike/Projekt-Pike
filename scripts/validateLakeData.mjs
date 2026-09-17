import { lakes } from "../src/data/lakes.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import {
  formatLakeDataValidation,
  validateLakeDataState,
} from "./lakeDataValidation.mjs";

// Replacement history changes the expected count only after a valid applied
// receipt and exact lineage validation. Ordinary additions retain their own gate.
import { replacementRepositoryInput } from './entityReplacementRepository.mjs';
import { preflightEntityReplacements } from './entityReplacement.mjs';
const replacementInput = await replacementRepositoryInput();
const replacementState = await preflightEntityReplacements(replacementInput);
const appliedIds = new Set(replacementState.alreadyApplied);
const replacementDelta = replacementInput.publications
  .filter(p => appliedIds.has(p.manifest.replacementId))
  .reduce((sum, p) => sum + p.manifest.replacements.length - 1, 0);
const result = validateLakeDataState({
  lakes,
  lakeDepthMapResearch,
  lakePointsByLakeId,
  expectedLakeCount: 23 + replacementDelta,
});

result.errors.push(...replacementState.blockers, ...replacementState.validationErrors);

if (result.errors.length > 0) {
  console.error(formatLakeDataValidation(result));
  process.exitCode = 1;
} else {
  console.log(formatLakeDataValidation(result));
}
