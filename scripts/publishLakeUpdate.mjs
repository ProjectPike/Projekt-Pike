import { lstat, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { lakeDepthMapResearch } from "../src/data/lakeDepthMapResearch.js";
import { lakePointsByLakeId } from "../src/data/lakePoints.js";
import { lakes } from "../src/data/lakes.js";
import {
  evaluateLakeUpdateProposal,
  semanticFingerprint,
  validateLakeUpdateProposal,
} from "./evaluateLakeUpdates.mjs";
import { canonicalJson } from "./publishCandidateLake.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HASH_STRATEGY = "sha256-canonical-json-v1";
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;

function realDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function updateProposalHash(proposal) {
  return semanticFingerprint(proposal);
}

export function validateUpdateReview(review) {
  if (!review || typeof review !== "object" || Array.isArray(review)) {
    return ["review: expected object"];
  }
  const errors = [];
  const required = [
    "schemaVersion", "proposalId", "targetLakeId", "decision", "reviewer",
    "reviewedAt", "hashStrategy", "proposalHash",
  ];
  for (const field of required) {
    if (!Object.hasOwn(review, field)) errors.push(`review.${field}: required`);
  }
  for (const field of Object.keys(review)) {
    if (![...required, "note"].includes(field)) errors.push(`review.${field}: unsupported field`);
  }
  if (review.schemaVersion !== 1) errors.push("review.schemaVersion: expected 1");
  if (typeof review.proposalId !== "string" || !SLUG.test(review.proposalId)) {
    errors.push("review.proposalId: expected proposal slug");
  }
  if (typeof review.targetLakeId !== "string" || !SLUG.test(review.targetLakeId)) {
    errors.push("review.targetLakeId: expected lake slug");
  }
  if (!["approved", "rejected"].includes(review.decision)) {
    errors.push("review.decision: expected approved or rejected");
  }
  if (!nonempty(review.reviewer)) errors.push("review.reviewer: required non-empty identity");
  if (!realDate(review.reviewedAt)) {
    errors.push("review.reviewedAt: expected real YYYY-MM-DD date");
  }
  if (review.hashStrategy !== HASH_STRATEGY) {
    errors.push("review.hashStrategy: unsupported strategy");
  }
  if (typeof review.proposalHash !== "string" || !/^[a-f0-9]{64}$/.test(review.proposalHash)) {
    errors.push("review.proposalHash: expected SHA-256 hex");
  }
  if ("note" in review && !nonempty(review.note)) {
    errors.push("review.note: omit missing note or provide text");
  }
  return errors;
}

function eligibilityErrors(result) {
  return [
    ...result.blockers.map(({ code, path, message }) => `[${code}] ${path}: ${message}`),
    ...result.validationErrors.map((error) => `[production-validation] ${error}`),
  ];
}

export function prepareUpdatePublication({
  proposal,
  review,
  productionLakes = lakes,
  productionDepthMapResearch = lakeDepthMapResearch,
  productionLakePointsByLakeId = lakePointsByLakeId,
}) {
  const proposalErrors = validateLakeUpdateProposal(proposal);
  if (proposalErrors.length > 0) {
    throw new Error(`Update proposal invalid:\n${proposalErrors.map(({ code, path, message }) =>
      `[${code}] ${path}: ${message}`).join("\n")}`);
  }
  if (review === undefined) throw new Error("Update review missing: explicit human approval required");
  const reviewErrors = validateUpdateReview(review);
  if (reviewErrors.length > 0) throw new Error(`Update review malformed:\n${reviewErrors.join("\n")}`);
  if (review.proposalId !== proposal.proposalId) {
    throw new Error("Update review proposal identity mismatch");
  }
  if (review.targetLakeId !== proposal.targetLakeId) {
    throw new Error("Update review target lake identity mismatch");
  }
  if (review.decision !== "approved") throw new Error("Update review rejected: publication blocked");
  if (review.proposalHash !== updateProposalHash(proposal)) {
    throw new Error("Update proposal changed after approval: new human review required");
  }

  const evaluation = evaluateLakeUpdateProposal({
    proposal,
    productionLakes,
    productionDepthMapResearch,
    lakePointsByLakeId: productionLakePointsByLakeId,
  });
  if (!evaluation.eligible) {
    throw new Error(`Update proposal is not eligible against current production:\n${eligibilityErrors(evaluation).join("\n")}`);
  }

  return JSON.parse(canonicalJson({ schemaVersion: 1, proposal, review }));
}

async function regular(path, directory = false) {
  const stat = await lstat(path);
  if (stat.isSymbolicLink() || !(directory ? stat.isDirectory() : stat.isFile())) {
    throw new Error(`Unsafe path (expected regular ${directory ? "directory" : "file"}): ${path}`);
  }
}

async function area(repositoryRoot, name) {
  await regular(join(repositoryRoot, "data"), true);
  const path = join(repositoryRoot, "data", name);
  await regular(path, true);
  return path;
}

async function readJson(path) {
  await regular(path);
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${path}: invalid/unreadable JSON (${error.message})`);
  }
}

async function loadProposal(id, repositoryRoot) {
  if (typeof id !== "string" || !SLUG.test(id)) {
    throw new Error("Update proposal ID must be a lowercase slug, not a path");
  }
  const proposal = await readJson(join(await area(repositoryRoot, "updates"), `${id}.json`));
  const errors = validateLakeUpdateProposal(proposal);
  if (errors.length > 0) {
    throw new Error(`Update proposal ${id} invalid:\n${errors.map(({ code, path, message }) =>
      `[${code}] ${path}: ${message}`).join("\n")}`);
  }
  if (proposal.proposalId !== id) throw new Error("Update proposal identity does not match filename");
  return proposal;
}

function defaultProductionState() {
  return {
    productionLakes: lakes,
    productionDepthMapResearch: lakeDepthMapResearch,
    productionLakePointsByLakeId: lakePointsByLakeId,
  };
}

// repositoryRoot and productionState are injectable for isolated tests. The CLI
// always uses this repository and its imported production state.
export async function publishLakeUpdate(id, repositoryRoot = root, productionState = defaultProductionState()) {
  const proposal = await loadProposal(id, repositoryRoot);
  const reviewPath = join(await area(repositoryRoot, "update-reviews"), `${id}.json`);
  let review;
  try {
    review = await readJson(reviewPath);
  } catch (error) {
    if (error.code === "ENOENT") throw new Error(`Update review missing: ${reviewPath}`);
    throw error;
  }
  const output = canonicalJson(prepareUpdatePublication({
    proposal,
    review,
    ...productionState,
  })) + "\n";
  const destination = join(await area(repositoryRoot, "published-updates"), `${id}.json`);
  try {
    await writeFile(destination, output, { encoding: "utf8", flag: "wx" });
    return "published";
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    let existing;
    try {
      existing = await readJson(destination);
    } catch {
      throw new Error(`Update destination conflict: unsafe or malformed existing file ${destination}`);
    }
    if (canonicalJson(existing) + "\n" === output) return "unchanged";
    throw new Error(`Update destination conflict: refusing to replace ${destination}`);
  }
}

export async function run(args = process.argv.slice(2)) {
  try {
    if (args.length !== 2 || !["hash", "publish"].includes(args[0])) {
      throw new Error("Usage: node scripts/publishLakeUpdate.mjs <hash|publish> <proposal-id>");
    }
    const [command, id] = args;
    if (command === "hash") console.log(updateProposalHash(await loadProposal(id, root)));
    else console.log(`${id}: ${await publishLakeUpdate(id)} (isolated data/published-updates; not production)`);
    return 0;
  } catch (error) {
    console.error(error.message);
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await run();
}
