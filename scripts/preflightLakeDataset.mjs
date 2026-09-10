import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakes } from "../src/data/lakes.js";
import {
  buildLakeDatasetDryRun,
  loadPublishedDocuments,
} from "./buildLakeDataset.mjs";
import {
  createProductionDatasetPreflight,
  fingerprintPublishedDocuments,
  formatProductionDatasetPreflight,
  productionDatasetFiles,
} from "./productionDatasetPreflight.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

export async function createRepositoryPreflight(root = repositoryRoot) {
  const publishedDocuments = await loadPublishedDocuments(join(root, "data", "published"));
  const buildResult = buildLakeDatasetDryRun({
    productionLakes: lakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    publishedDocuments,
  });
  const currentFiles = Object.fromEntries(await Promise.all(
    Object.values(productionDatasetFiles).map(async (path) => [
      path,
      await readFile(join(root, path), "utf8"),
    ]),
  ));
  const preflight = await createProductionDatasetPreflight({
    buildResult,
    productionLakes: lakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    lakePointsByLakeId,
    currentFiles,
    publishedInputFingerprint: fingerprintPublishedDocuments(publishedDocuments),
  });
  return preflight;
}

export async function run(args = process.argv.slice(2), output = console.log) {
  if (args.length !== 0) {
    throw new Error("Usage: node scripts/preflightLakeDataset.mjs (preflight only; no options)");
  }

  const preflight = await createRepositoryPreflight();
  output(formatProductionDatasetPreflight(preflight).trimEnd());
  return preflight;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await run();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
