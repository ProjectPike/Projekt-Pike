import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import {
  applyProductionDataset,
  formatProductionApply,
} from "./applyProductionDataset.mjs";
import { createRepositoryLakeUpdatePreflight } from "./preflightLakeUpdates.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

export function formatLakeUpdateApply(result, preflight) {
  const base = formatProductionApply(result).trimEnd().split("\n");
  base.splice(1, 1, `Reviewed pending updates: ${preflight.pendingUpdates.length}`);
  if (preflight.pendingUpdates.length > 0) {
    base.push("", "Update IDs:", ...preflight.pendingUpdates.map(({ id }) => `- ${id}`));
  }
  return `${base.join("\n")}\n`;
}

export async function run(args = process.argv.slice(2), output = console.log) {
  if (args.length !== 0) {
    throw new Error("Usage: node scripts/applyLakeUpdates.mjs (explicit safe update apply; no options)");
  }
  const preflight = await createRepositoryLakeUpdatePreflight(repositoryRoot);
  const result = await applyProductionDataset({
    preflight,
    repositoryRoot,
    lakePointsByLakeId,
    recomputePreflight: () => createRepositoryLakeUpdatePreflight(repositoryRoot),
  });
  output(formatLakeUpdateApply(result, preflight).trimEnd());
  return { ...result, pendingUpdates: preflight.pendingUpdates.map(({ id }) => id) };
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
