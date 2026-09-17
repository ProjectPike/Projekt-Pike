import { canonicalJson } from './publishCandidateLake.mjs';
import { sha256 } from './productionDatasetPreflight.mjs';
import { validateLakeDataState } from './lakeDataValidation.mjs';
import { validateUpdateReview } from './publishLakeUpdate.mjs';
import { evaluatePublishedLakeUpdates } from './evaluatePublishedLakeUpdates.mjs';
import { buildLakeDatasetDryRun } from './buildLakeDataset.mjs';
import { applyReviewedProposedValues } from './evaluateLakeUpdates.mjs';

export const replacementFiles = Object.freeze({
  lakes: 'src/data/lakes.js',
  lakeDepthMapResearch: 'src/data/lakeDepthMapResearch.js',
  lakePointsByLakeId: 'src/data/lakePoints.js',
});
export const replacementHash = value => sha256(canonicalJson(value));
const same = (a, b) => canonicalJson(a) === canonicalJson(b);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && !['constructor', 'prototype', '__proto__'].includes(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const exactKeys = (value, keys) => object(value) && same(Object.keys(value).sort(), [...keys].sort());
const fail = message => { throw new Error(message); };

export function validateReplacementManifest(m) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  if (!exactKeys(m, ['schemaVersion', 'replacementId', 'migrationType', 'source', 'replacements', 'expectedCountBefore', 'expectedCountAfter', 'reason', 'sources'])) return ['manifest: unsupported or missing fields'];
  check(m.schemaVersion === 1, 'schemaVersion must be 1');
  check(slug(m.replacementId), 'replacementId must be a safe slug');
  check(m.migrationType === 'one-to-many', 'migrationType must be one-to-many');
  check(text(m.reason), 'reason is required');
  check(Number.isSafeInteger(m.expectedCountBefore) && m.expectedCountBefore > 0, 'expectedCountBefore must be positive');
  check(Array.isArray(m.sources) && m.sources.length > 0, 'sources are required');
  const sourceIds = new Set();
  for (const s of Array.isArray(m.sources) ? m.sources : []) {
    check(exactKeys(s, ['id', 'type', 'title', 'url', 'checkedAt']) && slug(s.id) && text(s.title) &&
      ['authority', 'municipality', 'fvo-club', 'open-data', 'commercial-aggregator', 'other'].includes(s.type) &&
      /^https?:\/\//.test(s.url ?? '') && URL.canParse(s.url) && date(s.checkedAt), 'invalid provenance source');
    check(!sourceIds.has(s?.id), 'duplicate provenance source');
    sourceIds.add(s?.id);
  }
  if (!exactKeys(m.source, ['id', 'lakeFingerprint', 'lake', 'depth', 'points'])) errors.push('source: complete before-state required');
  else {
    check(slug(m.source.id) && m.source.lake?.id === m.source.id, 'source identity mismatch');
    check(object(m.source.lake) && m.source.lakeFingerprint === replacementHash(m.source.lake), 'source lake fingerprint mismatch');
    check(object(m.source.depth), 'source depth before-state required');
    // null means the key is ABSENT, [] means a present empty point set.
    check(m.source.points === null || Array.isArray(m.source.points), 'source points must be array or explicit null (absent)');
  }
  check(Array.isArray(m.replacements) && m.replacements.length >= 2, 'at least two replacements required');
  const ids = new Set();
  for (const r of Array.isArray(m.replacements) ? m.replacements : []) {
    check(exactKeys(r, ['id', 'lake', 'depth', 'points']), 'replacement must explicitly contain id, lake, depth, points');
    check(slug(r?.id) && r.id !== m.source?.id && r.lake?.id === r.id, 'replacement identity mismatch');
    check(!ids.has(r?.id), 'duplicate replacement ID');
    ids.add(r?.id);
    check(object(r?.lake) && object(r?.depth) && Array.isArray(r?.points), 'complete replacement records required; points may be []');
    // Published overlays have additional runtime ID bindings outside this v1 transaction.
    check(r?.depth?.bathymetry?.published !== true, 'published overlay migration is outside replacement v1');
    if (r?.depth?.status === 'available') check(
      ['raw', 'georeferenced', 'verified', 'needs-review'].includes(r.depth.bathymetry?.processingState) && r.depth.bathymetry?.published === false,
      'available replacement depth must explicitly remain unpublished with a valid processing state');
  }
  check(m.source?.depth?.bathymetry?.published !== true, 'cannot retire an entity with a published overlay in v1');
  check(m.expectedCountAfter === m.expectedCountBefore - 1 + ids.size, 'production count transition mismatch');
  if (!errors.length) {
    const state = { lakes: {}, lakeDepthMapResearch: {}, lakePointsByLakeId: {} };
    for (const r of m.replacements) {
      state.lakes[r.id] = r.lake; state.lakeDepthMapResearch[r.id] = r.depth; state.lakePointsByLakeId[r.id] = r.points;
    }
    try { errors.push(...validateLakeDataState({ ...state, expectedLakeCount: ids.size }).errors); }
    catch (error) { errors.push(`malformed replacement data: ${error.message}`); }
  }
  return errors;
}

export function prepareReplacementPublication(manifest, review) {
  const errors = validateReplacementManifest(manifest);
  if (errors.length) fail(errors.join('; '));
  // Reuse the established review schema; proposalId is the replacement ID,
  // targetLakeId is the retired source. No automatic human decision is made.
  const reviewErrors = validateUpdateReview(review);
  if (reviewErrors.length) fail(reviewErrors.join('; '));
  if (review.decision !== 'approved' || review.proposalId !== manifest.replacementId ||
      review.targetLakeId !== manifest.source.id || review.proposalHash !== replacementHash(manifest)) fail('replacement review binding invalid');
  return JSON.parse(canonicalJson({ schemaVersion: 1, manifest, review, reviewHash: replacementHash(review) }));
}

export function validateReplacementPublication(p) {
  if (!exactKeys(p, ['schemaVersion', 'manifest', 'review', 'reviewHash'])) fail('invalid replacement wrapper');
  if (!same(p, prepareReplacementPublication(p.manifest, p.review))) fail('published replacement/review hash mismatch');
}

export async function parseReplacementFiles(files) {
  const state = {};
  for (const [name, path] of Object.entries(replacementFiles)) {
    const content = files[path];
    if (typeof content !== 'string' || content.includes('\0')) fail(`invalid production text: ${path}`);
    const module = await import(`data:text/javascript;base64,${Buffer.from(content).toString('base64')}#${sha256(content)}`);
    if (!object(module[name])) fail(`missing ${name} export`);
    state[name] = structuredClone(module[name]);
  }
  return state;
}

// The existing modules have a column-zero closing }; for the exported record.
// Preserve prefix/suffix (including point helpers), then verify parsed semantics.
export function serializeReplacementRecord(source, name, record) {
  const marker = `export const ${name} = {`;
  const start = source.indexOf(marker);
  const empty = source.startsWith(marker + '};', start);
  const end = empty ? start + marker.length : source.indexOf('\n};', start);
  if (start < 0 || end < 0 || source.indexOf(marker, start + marker.length) >= 0) fail(`unsupported module structure: ${name}`);
  return source.slice(0, start) + `export const ${name} = ${JSON.stringify(record, null, 2)};` + source.slice(end + (empty ? 2 : 3));
}

export function replacementAliases(publications) {
  return Object.fromEntries(publications.map(p => {
    validateReplacementPublication(p);
    return [p.manifest.source.id, p.manifest.replacements.map(r => r.id)];
  }));
}

function assertSource(m, state) {
  const id = m.source.id;
  if (!Object.hasOwn(state.lakes, id)) fail('source missing without applied receipt');
  if (!same(state.lakes[id], m.source.lake)) fail('stale source lake');
  if (!same(state.lakeDepthMapResearch[id], m.source.depth)) fail('stale source depth');
  if (!same(Object.hasOwn(state.lakePointsByLakeId, id) ? state.lakePointsByLakeId[id] : null, m.source.points)) fail('stale source lakePoints');
  for (const r of m.replacements) for (const record of Object.values(state)) {
    if (Object.hasOwn(record, r.id)) fail(`replacement ID already exists: ${r.id}`);
  }
  if (Object.keys(state.lakes).length !== m.expectedCountBefore) fail('unexpected before count');
}

export function createReplacementReceipt(publication, preflight, appliedAt) {
  if (!Number.isFinite(Date.parse(appliedAt)) || new Date(appliedAt).toISOString() !== appliedAt) fail('appliedAt must be ISO timestamp');
  const body = {
    schemaVersion: 1, replacementId: publication.manifest.replacementId,
    sourceId: publication.manifest.source.id,
    replacementIds: publication.manifest.replacements.map(r => r.id),
    manifestHash: replacementHash(publication.manifest), reviewHash: publication.reviewHash,
    preflightFingerprint: preflight.fingerprint, before: preflight.beforeHashes,
    after: preflight.afterHashes, appliedAt,
  };
  return { ...body, receiptHash: replacementHash(body) };
}

function verifyHistory(p, receipt, state, updates) {
  const m = p.manifest;
  if (!exactKeys(receipt, ['schemaVersion', 'replacementId', 'sourceId', 'replacementIds', 'manifestHash', 'reviewHash', 'preflightFingerprint', 'before', 'after', 'appliedAt', 'receiptHash'])) fail('invalid replacement receipt');
  const { receiptHash, ...body } = receipt;
  if (receiptHash !== replacementHash(body) || receipt.schemaVersion !== 1 || receipt.replacementId !== m.replacementId ||
      receipt.sourceId !== m.source.id || !same(receipt.replacementIds, m.replacements.map(r => r.id)) ||
      receipt.manifestHash !== replacementHash(m) || receipt.reviewHash !== p.reviewHash ||
      !Number.isFinite(Date.parse(receipt.appliedAt)) || new Date(receipt.appliedAt).toISOString() !== receipt.appliedAt ||
      !/^[a-f0-9]{64}$/.test(receipt.preflightFingerprint)) fail('replacement receipt integrity mismatch');
  for (const hashes of [receipt.before, receipt.after]) {
    if (!exactKeys(hashes, Object.values(replacementFiles)) || Object.values(hashes).some(v => !/^[a-f0-9]{64}$/.test(v))) fail('invalid receipt file hashes');
  }
  for (const record of Object.values(state)) if (Object.hasOwn(record, m.source.id)) fail('retired source reappeared');
  for (const r of m.replacements) {
    let expected = structuredClone(r.lake);
    // Only intact, applied update publications explain evolution. Enforce each
    // before-state fingerprint in a unique chain rather than accepting drift.
    const remaining = updates.alreadyApplied.filter(u => u.targetLakeId === r.id);
    while (remaining.length) {
      const candidates = remaining.filter(u => u.proposal.targetLakeFingerprint === replacementHash(expected));
      if (candidates.length !== 1) fail(`unexplained/ambiguous update lineage: ${r.id}`);
      const next = candidates[0];
      for (const change of next.proposal.changes) {
        let current = expected;
        const parts = change.path.split('.');
        for (const part of parts.slice(0, -1)) current = current?.[part];
        const present = object(current) && Object.hasOwn(current, parts.at(-1));
        if (change.expected.mode === 'absent' ? present : !present || !same(current[parts.at(-1)], change.expected.value)) fail('historical update before-state mismatch');
      }
      expected = applyReviewedProposedValues(expected, next.proposal.changes);
      remaining.splice(remaining.indexOf(next), 1);
    }
    if (!same(state.lakes[r.id], expected) || !same(state.lakeDepthMapResearch[r.id], r.depth) || !same(state.lakePointsByLakeId[r.id], r.points)) fail(`replacement drift: ${r.id}`);
  }
}

export async function preflightEntityReplacements({ currentFiles, publications = [], receipts = [], updateDocuments = [], newLakeDocuments = [] }) {
  const blockers = [];
  const validationErrors = [];
  const pending = []; const alreadyApplied = [];
  const beforeHashes = Object.fromEntries(Object.entries(currentFiles).map(([p, s]) => [p, sha256(s)]));
  let proposed; let state; let serializedFiles = { ...currentFiles };
  try {
    if (!exactKeys(currentFiles, Object.values(replacementFiles))) fail('exactly three managed production files required');
    state = await parseReplacementFiles(currentFiles);
    proposed = structuredClone(state);
    const baseline = validateLakeDataState({ ...state, expectedLakeCount: Object.keys(state.lakes).length });
    if (baseline.errors.length) fail(baseline.errors.join('; '));
    const updates = evaluatePublishedLakeUpdates({ productionLakes: state.lakes, productionDepthMapResearch: state.lakeDepthMapResearch, lakePointsByLakeId: state.lakePointsByLakeId, publishedDocuments: updateDocuments });
    const hasPendingReplacement = publications.some(p => !receipts.some(r => r.replacementId === p.manifest?.replacementId));
    if (publications.length && (updates.blocked.length || (hasPendingReplacement && updates.pending.length))) fail('ordinary update lifecycle must be satisfied before replacement');
    const newLakes = buildLakeDatasetDryRun({ productionLakes: state.lakes, productionDepthMapResearch: state.lakeDepthMapResearch,
      publishedDocuments: newLakeDocuments, appliedUpdateHistory: updates.alreadyApplied });
    if (publications.length && (newLakes.blocked.length || newLakes.productionErrors.length || (hasPendingReplacement && newLakes.additions.length))) fail('new-lake lifecycle must be satisfied before replacement');
    updates.alreadyApplied = updates.alreadyApplied.map(u => ({ ...u, proposal: JSON.parse(updateDocuments.find(d => d.file === u.file).content).proposal }));
    const touched = new Set(); const publicationIds = new Set();
    for (const p of publications) {
      validateReplacementPublication(p);
      const m = p.manifest;
      if (publicationIds.has(m.replacementId)) fail('duplicate replacement publication');
      publicationIds.add(m.replacementId);
      for (const id of [m.source.id, ...m.replacements.map(r => r.id)]) {
        if (touched.has(id)) fail(`conflicting replacements: ${id}`);
        touched.add(id);
      }
      const history = receipts.filter(r => r.replacementId === m.replacementId);
      if (history.length > 1) fail('duplicate applied receipts');
      if (history.length) {
        verifyHistory(p, history[0], state, updates);
        alreadyApplied.push(m.replacementId);
      } else {
        // v1 retires legacy identities only. Retiring an identity owned by
        // another ingest/update lifecycle needs an explicit retirement bridge.
        if (updates.alreadyApplied.some(u => u.targetLakeId === m.source.id) || newLakeDocuments.some(d => {
          const p = JSON.parse(d.content); return p.candidate?.id === m.source.id;
        })) fail('source has existing lifecycle provenance; retirement bridge required');
        assertSource(m, state);
        pending.push(m.replacementId);
        for (const record of Object.values(proposed)) delete record[m.source.id];
        for (const r of m.replacements) {
          proposed.lakes[r.id] = structuredClone(r.lake);
          proposed.lakeDepthMapResearch[r.id] = structuredClone(r.depth);
          proposed.lakePointsByLakeId[r.id] = structuredClone(r.points);
        }
      }
    }
    if (receipts.some(r => !publicationIds.has(r.replacementId))) fail('orphan replacement receipt');
    // One explicit migration per transaction; no implicit batch sequencing.
    if (pending.length > 1) fail('multiple pending replacements require explicit sequencing');
    if (pending.length) {
      const m = publications.find(p => p.manifest.replacementId === pending[0]).manifest;
      validationErrors.push(...validateLakeDataState({ ...proposed, expectedLakeCount: m.expectedCountAfter }).errors);
      for (const [name, path] of Object.entries(replacementFiles)) serializedFiles[path] = serializeReplacementRecord(currentFiles[path], name, proposed[name]);
      const parsed = await parseReplacementFiles(serializedFiles);
      if (!same(parsed, proposed)) fail('serialized output differs from approved state');
    }
  } catch (error) { blockers.push(error.message); }
  const afterHashes = Object.fromEntries(Object.entries(serializedFiles).map(([p, s]) => [p, sha256(s)]));
  const fingerprint = replacementHash({ beforeHashes, afterHashes, publications, receipts, updateDocuments, newLakeDocuments });
  return { eligible: !blockers.length && !validationErrors.length, pending, alreadyApplied, blockers, validationErrors,
    fingerprint, beforeHashes, afterHashes, serializedFiles, proposedDataset: proposed,
    productionLakeCount: state ? Object.keys(state.lakes).length : null,
    proposedLakeCount: proposed ? Object.keys(proposed.lakes).length : null,
    filesToChange: Object.keys(serializedFiles).filter(p => beforeHashes[p] !== afterHashes[p]).sort(), productionModified: false };
}
