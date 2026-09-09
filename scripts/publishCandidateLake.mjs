import { createHash } from "node:crypto";
import { lstat, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { validateCandidate } from "./validateCandidateLakes.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const slug = (value) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const nonempty = (value) => typeof value === "string" && value.trim().length > 0;

// JSON semantics only: sort object keys, preserve arrays, strings and values.
// No trimming, domain normalization, permission inference or date generation.
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function candidateHash(candidate) {
  return createHash("sha256").update(canonicalJson(candidate), "utf8").digest("hex");
}

export function validateReview(review) {
  if (!review || typeof review !== "object" || Array.isArray(review)) return ["review: expected object"];
  const errors = [];
  const required = ["schemaVersion", "candidateId", "decision", "reviewer", "reviewedAt", "hashStrategy", "candidateHash"];
  for (const field of required) if (!Object.hasOwn(review, field)) errors.push(`review.${field}: required`);
  for (const field of Object.keys(review)) if (![...required, "note"].includes(field)) errors.push(`review.${field}: unsupported field`);
  if (review.schemaVersion !== 1) errors.push("review.schemaVersion: expected 1");
  if (!slug(review.candidateId)) errors.push("review.candidateId: expected lake slug");
  if (!["approved", "rejected"].includes(review.decision)) errors.push("review.decision: expected approved or rejected");
  if (!nonempty(review.reviewer)) errors.push("review.reviewer: required non-empty identity");
  if (typeof review.reviewedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt)
    || !Number.isFinite(Date.parse(review.reviewedAt)) || new Date(review.reviewedAt).toISOString().slice(0, 10) !== review.reviewedAt) {
    errors.push("review.reviewedAt: expected real YYYY-MM-DD date");
  }
  if (review.hashStrategy !== "sha256-canonical-json-v1") errors.push("review.hashStrategy: unsupported strategy");
  if (typeof review.candidateHash !== "string" || !/^[a-f0-9]{64}$/.test(review.candidateHash)) errors.push("review.candidateHash: expected SHA-256 hex");
  if ("note" in review && !nonempty(review.note)) errors.push("review.note: omit missing note or provide text");
  return errors;
}

export function preparePublication(candidate, review) {
  const errors = validateCandidate(candidate);
  if (errors.length) throw new Error(`Candidate invalid:\n${errors.join("\n")}`);
  if (review === undefined) throw new Error("Review missing: explicit human approval required");
  const reviewErrors = validateReview(review);
  if (reviewErrors.length) throw new Error(`Review malformed:\n${reviewErrors.join("\n")}`);
  if (review.candidateId !== candidate.id) throw new Error("Review candidate identity mismatch");
  if (review.decision !== "approved") throw new Error("Review rejected: publication blocked");
  if (review.candidateHash !== candidateHash(candidate)) throw new Error("Candidate changed after approval: new human review required");
  // Snapshot is serializable and independent of later caller mutation.
  return JSON.parse(canonicalJson({ schemaVersion: 1, candidate, review }));
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
  try { return JSON.parse(await readFile(path, "utf8")); }
  catch (error) { throw new Error(`${path}: invalid/unreadable JSON (${error.message})`); }
}

async function loadCandidate(id, repositoryRoot) {
  if (!slug(id)) throw new Error("Candidate ID must be a lowercase lake slug, not a path");
  const candidate = await readJson(join(await area(repositoryRoot, "candidates"), `${id}.json`));
  const errors = validateCandidate(candidate);
  if (errors.length) throw new Error(`Candidate ${id} invalid:\n${errors.join("\n")}`);
  if (candidate.id !== id) throw new Error("Candidate identity does not match filename");
  return candidate;
}

// repositoryRoot is injected by tests; CLI always uses this repository, no output override.
export async function publishCandidate(id, repositoryRoot = root) {
  const candidate = await loadCandidate(id, repositoryRoot);
  const reviewPath = join(await area(repositoryRoot, "reviews"), `${id}.json`);
  let review;
  try { review = await readJson(reviewPath); }
  catch (error) {
    if (error.code === "ENOENT") throw new Error(`Review missing: ${reviewPath}`);
    throw error;
  }
  const output = canonicalJson(preparePublication(candidate, review)) + "\n";
  const destination = join(await area(repositoryRoot, "published"), `${id}.json`);
  try {
    // Exclusive creation prevents replacing a file or following a destination symlink.
    await writeFile(destination, output, { encoding: "utf8", flag: "wx" });
    return "published";
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    let existing;
    try { existing = await readJson(destination); }
    catch { throw new Error(`Destination conflict: unsafe or malformed existing file ${destination}`); }
    if (canonicalJson(existing) + "\n" === output) return "unchanged";
    throw new Error(`Destination conflict: refusing to replace ${destination}`);
  }
}

export async function run(args = process.argv.slice(2)) {
  try {
    if (args.length !== 2 || !["hash", "publish"].includes(args[0])) throw new Error("Usage: node scripts/publishCandidateLake.mjs <hash|publish> <lake-id>");
    const [command, id] = args;
    if (command === "hash") console.log(candidateHash(await loadCandidate(id, root)));
    else console.log(`${id}: ${await publishCandidate(id)} (isolated data/published; not app data)`);
    return 0;
  } catch (error) { console.error(error.message); return 1; }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await run();
