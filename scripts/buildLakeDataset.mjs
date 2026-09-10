import { lstat, readFile, readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { lakes } from "../src/data/lakes.js";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import {
  assessPublishedLakeCompatibility,
  mapPublishedLakeCompatibleFields,
} from "./publishedLakeCompatibility.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const defaultPublishedDirectory = join(repositoryRoot, "data", "published");
const compareText = (left, right) => left < right ? -1 : left > right ? 1 : 0;

function cloneSortedRecord(record) {
  return Object.fromEntries(
    Object.keys(record).sort(compareText).map((key) => [key, structuredClone(record[key])]),
  );
}

function reason(code, path, message) {
  return { code, path, message };
}

function sortedReasons(reasons) {
  return [...reasons].sort((left, right) =>
    compareText(left.code, right.code) ||
    compareText(left.path, right.path) ||
    compareText(left.message, right.message));
}

function parsePublishedDocument(document) {
  if (document.readError) {
    return {
      ...document,
      publication: null,
      parseReasons: [reason("unreadable-publication", "$", document.readError)],
    };
  }

  try {
    return { ...document, publication: JSON.parse(document.content), parseReasons: [] };
  } catch {
    return {
      ...document,
      publication: null,
      parseReasons: [reason("invalid-json", "$", "published document is not valid JSON")],
    };
  }
}

function productionIdentityErrors(productionLakes) {
  const errors = [];
  const ids = new Map();

  for (const key of Object.keys(productionLakes).sort(compareText)) {
    const id = productionLakes[key]?.id;
    if (id !== key) {
      errors.push(reason(
        "production-identity-mismatch",
        `production.${key}.id`,
        `production key ${key} does not match lake id ${String(id)}`,
      ));
    }
    if (typeof id === "string" && ids.has(id)) {
      errors.push(reason(
        "duplicate-production-id",
        `production.${key}.id`,
        `lake id ${id} is also used by production key ${ids.get(id)}`,
      ));
    } else if (typeof id === "string") {
      ids.set(id, key);
    }
  }

  return errors;
}

export function buildLakeDatasetDryRun({
  productionLakes,
  productionDepthMapResearch,
  publishedDocuments,
}) {
  const proposedLakes = cloneSortedRecord(productionLakes);
  const proposedDepthMapResearch = cloneSortedRecord(productionDepthMapResearch);
  const productionErrors = productionIdentityErrors(productionLakes);
  const parsed = [...publishedDocuments]
    .sort((left, right) => compareText(left.file, right.file))
    .map(parsePublishedDocument);
  const publishedIdCounts = new Map();

  for (const document of parsed) {
    const id = document.publication?.candidate?.id;
    if (typeof id === "string") {
      publishedIdCounts.set(id, (publishedIdCounts.get(id) ?? 0) + 1);
    }
  }

  const additions = [];
  const blocked = [];

  for (const document of parsed) {
    const publication = document.publication;
    const id = typeof publication?.candidate?.id === "string"
      ? publication.candidate.id
      : null;
    const reasons = [...document.parseReasons];

    if (publication) {
      const assessment = assessPublishedLakeCompatibility(publication);
      reasons.push(...assessment.blockers);

      if (id && basename(document.file, ".json") !== id) {
        reasons.push(reason(
          "published-identity-mismatch",
          "$.candidate.id",
          `candidate id ${id} does not match published filename ${document.file}`,
        ));
      }
      if (id && publishedIdCounts.get(id) > 1) {
        reasons.push(reason(
          "duplicate-published-id",
          "$.candidate.id",
          `published lake id ${id} occurs more than once`,
        ));
      }
      if (id && Object.hasOwn(productionLakes, id)) {
        reasons.push(reason(
          "production-id-conflict",
          "$.candidate.id",
          `published lake id ${id} already exists in production`,
        ));
      }
      if (productionErrors.length > 0) {
        reasons.push(reason(
          "invalid-production-identity",
          "production",
          "production identity errors must be resolved before proposing additions",
        ));
      }
    }

    if (reasons.length > 0) {
      blocked.push({ file: document.file, id, reasons: sortedReasons(reasons) });
      continue;
    }

    try {
      const mapped = mapPublishedLakeCompatibleFields(publication);
      const { lakeDepthMapResearch: depthMapResearch, ...lake } = mapped;
      proposedLakes[id] = lake;
      proposedDepthMapResearch[id] = depthMapResearch;
      additions.push({ file: document.file, id, lake: structuredClone(lake) });
    } catch (error) {
      blocked.push({
        file: document.file,
        id,
        reasons: [reason("transformation-error", "$", error.message)],
      });
    }
  }

  const orderedAdditions = additions.sort((left, right) => compareText(left.id, right.id));
  const orderedBlocked = blocked.sort((left, right) =>
    compareText(left.id ?? "", right.id ?? "") || compareText(left.file, right.file));
  const orderedProposedLakes = cloneSortedRecord(proposedLakes);
  const orderedProposedDepthMapResearch = cloneSortedRecord(proposedDepthMapResearch);
  const conflictCodes = new Set([
    "production-id-conflict",
    "duplicate-published-id",
    "published-identity-mismatch",
  ]);
  const errorReasons = orderedBlocked.flatMap((entry) => entry.reasons)
    .filter(({ code }) => !conflictCodes.has(code));

  return {
    proposedDataset: {
      lakes: orderedProposedLakes,
      lakeDepthMapResearch: orderedProposedDepthMapResearch,
    },
    additions: orderedAdditions,
    blocked: orderedBlocked,
    productionErrors,
    summary: {
      productionLakeCount: Object.keys(productionLakes).length,
      publishedLakeCount: parsed.length,
      compatibleAdditionCount: orderedAdditions.length,
      blockedPublishedLakeCount: orderedBlocked.length,
      idConflictCount: orderedBlocked.filter((entry) =>
        entry.reasons.some(({ code }) => conflictCodes.has(code))).length,
      compatibilityOrTransformationErrorCount: errorReasons.length,
      proposedLakeCount: Object.keys(orderedProposedLakes).length,
    },
  };
}

export function formatLakeDatasetDryRunReport(result) {
  const { summary } = result;
  const lines = [
    "Pike lake dataset dry run",
    `Production lakes: ${summary.productionLakeCount}`,
    `Published lakes: ${summary.publishedLakeCount}`,
    `Compatible proposed additions: ${summary.compatibleAdditionCount}`,
    `Blocked published lakes: ${summary.blockedPublishedLakeCount}`,
    `ID conflicts: ${summary.idConflictCount}`,
    `Compatibility/transformation errors: ${summary.compatibilityOrTransformationErrorCount}`,
    `Proposed final lake count: ${summary.proposedLakeCount}`,
    "Production files modified: NO",
  ];

  if (result.productionErrors.length > 0) {
    lines.push("", "Production identity errors:");
    for (const entry of sortedReasons(result.productionErrors)) {
      lines.push(`- [${entry.code}] ${entry.path}: ${entry.message}`);
    }
  }

  if (result.additions.length > 0) {
    lines.push("", "Proposed additions:");
    for (const addition of result.additions) lines.push(`- ${addition.id} (${addition.file})`);
  }

  if (result.blocked.length > 0) {
    lines.push("", "Blocked published lakes:");
    for (const entry of result.blocked) {
      lines.push(`- ${entry.id ?? "unknown id"} (${entry.file})`);
      for (const blocker of entry.reasons) {
        lines.push(`  - [${blocker.code}] ${blocker.path}: ${blocker.message}`);
      }
    }
  }

  return `${lines.join("\n")}\n`;
}

export async function loadPublishedDocuments(directory = defaultPublishedDirectory) {
  const directoryStat = await lstat(directory);
  if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) {
    throw new Error(`Unsafe published path (expected regular directory): ${directory}`);
  }

  const entries = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.name.endsWith(".json"))
    .sort((left, right) => compareText(left.name, right.name));

  return Promise.all(entries.map(async (entry) => {
    if (!entry.isFile()) {
      return { file: entry.name, readError: "published JSON entry is not a regular file" };
    }
    return { file: entry.name, content: await readFile(join(directory, entry.name), "utf8") };
  }));
}

export async function run(args = process.argv.slice(2), output = console.log) {
  if (args.length !== 0) {
    throw new Error("Usage: node scripts/buildLakeDataset.mjs (dry run only; no options)");
  }

  const publishedDocuments = await loadPublishedDocuments();
  const result = buildLakeDatasetDryRun({
    productionLakes: lakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    publishedDocuments,
  });
  output(formatLakeDatasetDryRunReport(result).trimEnd());
  return result;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await run();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
