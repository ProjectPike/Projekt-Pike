import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import {
  applyProductionDataset,
  formatProductionApply,
} from "./applyProductionDataset.mjs";
import { createRepositoryPreflight } from "./preflightLakeDataset.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

export async function run(args = process.argv.slice(2), output = console.log) {
  if (args.length !== 0) {
    throw new Error("Usage: node scripts/applyLakeDataset.mjs (explicit safe apply; no options)");
  }

  const preflight = await createRepositoryPreflight(repositoryRoot);
  const result = await applyProductionDataset({
    preflight,
    repositoryRoot,
    lakePointsByLakeId,
    recomputePreflight: () => createRepositoryPreflight(repositoryRoot),
  });
  output(formatProductionApply(result).trimEnd());
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await run();
    if (!["success", "noop"].includes(result.status)) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
