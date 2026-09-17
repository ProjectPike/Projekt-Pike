import { readFile, writeFile, rename, unlink, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { canonicalJson } from './publishCandidateLake.mjs';
import { sha256 } from './productionDatasetPreflight.mjs';
import { createReplacementReceipt, parseReplacementFiles, replacementFiles } from './entityReplacement.mjs';
import { validateLakeDataState } from './lakeDataValidation.mjs';
import { replacementRepositoryInput, repositoryReplacementPreflight, safeRepositoryPath, replacementAreas } from './entityReplacementRepository.mjs';

const LOCK = 'data/replacement-history/.pike-replacement-lock';
const exists = async path => { try { await lstat(path); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; } };
const decode = b => new TextDecoder('utf-8', { fatal: true }).decode(b);
const json = value => canonicalJson(value) + '\n';
const exec = promisify(execFile);

export async function runReplacementValidators(root) {
  for (const script of ['validateLakeData.mjs', 'validateCandidateLakes.mjs', 'validateBathymetryData.mjs']) {
    await exec(process.execPath, [join(root, 'scripts', script)], { cwd: root });
  }
}

// Separate writer: the existing add/update writer's fixed allowlist is unchanged.
// A persisted lock journal deliberately survives process death for manual recovery.
export async function applyEntityReplacement({ root, expectedFingerprint, now = () => new Date().toISOString(), checkpoint = async () => {}, validate = runReplacementValidators }) {
  let lock; let entries = []; let mutationStarted = false; let preflight;
  const owned = [];
  try {
    lock = await safeRepositoryPath(root, LOCK, true);
    await writeFile(lock, json({ state: 'preparing' }), { flag: 'wx' });
    owned.push(lock);
    preflight = await repositoryReplacementPreflight(root);
    if (!preflight.eligible || !expectedFingerprint || expectedFingerprint !== preflight.fingerprint) throw new Error('ineligible or stale replacement preflight');
    if (!preflight.pending.length) {
      await unlink(lock);
      return { status: 'noop', productionModified: false, rollbackRequired: false };
    }
    const input = await replacementRepositoryInput(root);
    const publication = input.publications.find(p => p.manifest.replacementId === preflight.pending[0]);
    const historyPath = `${replacementAreas.history}/${publication.manifest.replacementId}.json`;
    const receipt = createReplacementReceipt(publication, preflight, now());
    const output = { ...preflight.serializedFiles, [historyPath]: json(receipt) };
    const paths = [...preflight.filesToChange, historyPath];
    const token = preflight.fingerprint.slice(0, 16);
    entries = await Promise.all(paths.map(async path => ({ path,
      destination: await safeRepositoryPath(root, path, path === historyPath),
      staging: await safeRepositoryPath(root, `${path}.pike-${token}.next`, true),
      backup: await safeRepositoryPath(root, `${path}.pike-${token}.backup`, true),
      before: input.currentFiles[path] ?? null, after: output[path] })));
    if (await exists(entries.at(-1).destination)) throw new Error('receipt already exists');
    for (const e of entries) {
      await writeFile(e.staging, e.after, { encoding: 'utf8', flag: 'wx' }); owned.push(e.staging);
      await checkpoint('after-stage', e);
      if (sha256(await readFile(e.staging)) !== sha256(e.after)) throw new Error('staging hash mismatch');
      if (e.before !== null) {
        await writeFile(e.backup, e.before, { encoding: 'utf8', flag: 'wx' }); owned.push(e.backup);
        if (sha256(await readFile(e.backup)) !== sha256(e.before)) throw new Error('backup hash mismatch');
      }
    }
    const staged = { ...input.currentFiles };
    for (const e of entries.filter(e => e.before !== null)) staged[e.path] = decode(await readFile(e.staging));
    const parsed = await parseReplacementFiles(staged);
    const errors = validateLakeDataState({ ...parsed, expectedLakeCount: preflight.proposedLakeCount }).errors;
    if (errors.length || canonicalJson(parsed) !== canonicalJson(preflight.proposedDataset)) throw new Error('staged dataset mismatch');
    await checkpoint('before-recheck');
    const fresh = await repositoryReplacementPreflight(root);
    if (!fresh.eligible || fresh.fingerprint !== expectedFingerprint) throw new Error('production or publication changed before replacement');
    // Recovery journal binds every backup and final output, including receipt.
    await writeFile(lock, json({ state: 'ready', fingerprint: expectedFingerprint, entries: entries.map(e => ({ path: e.path,
      staging: e.staging, backup: e.backup, beforeHash: e.before === null ? null : sha256(e.before), afterHash: sha256(e.after) })) }));
    for (const e of entries) {
      await checkpoint('before-replace', e);
      mutationStarted = true;
      await rename(e.staging, e.destination);
      await checkpoint('after-replace', e);
    }
    for (const e of entries) if (sha256(await readFile(e.destination)) !== sha256(e.after)) throw new Error('final output mismatch');
    const final = await repositoryReplacementPreflight(root);
    if (!final.eligible || final.pending.length || !final.alreadyApplied.includes(publication.manifest.replacementId)) throw new Error('final lifecycle validation failed');
    await validate(root);
    await checkpoint('after-validation');
    const cleanupErrors = [];
    for (const file of owned.slice().reverse()) {
      try { if (await exists(file)) await unlink(file); } catch (e) { cleanupErrors.push(e.message); }
    }
    return { cleanupErrors, status: 'success', filesChanged: paths, productionModified: true, rollbackRequired: false };
  } catch (error) {
    if (mutationStarted) {
      const errors = [];
      for (const e of entries) {
        try {
          if (e.before === null) { if (await exists(e.destination)) await unlink(e.destination); }
          else {
            const backup = await readFile(e.backup);
            if (sha256(backup) !== sha256(e.before)) throw new Error('invalid backup');
            const restore = `${e.backup}.restore`;
            await writeFile(restore, backup, { flag: 'wx' }); owned.push(restore);
            await rename(restore, e.destination);
          }
        } catch (e) { errors.push(e.message); }
      }
      for (const e of entries) {
        try {
          if (e.before === null ? await exists(e.destination) : sha256(await readFile(e.destination)) !== sha256(e.before)) errors.push(`rollback mismatch: ${e.path}`);
        } catch (e) { errors.push(e.message); }
      }
      if (errors.length) return { status: 'critical', productionModified: null, rollbackRequired: true, error: error.message, recoveryErrors: errors, journal: LOCK };
    }
    // Never remove pre-existing artifacts or another process's lock.
    for (const file of owned.slice().reverse()) {
      try { if (await exists(file)) await unlink(file); } catch { /* retained lock/artifacts require manual inspection */ }
    }
    return { status: mutationStarted ? 'rolled-back' : 'blocked', productionModified: false, rollbackRequired: mutationStarted, error: error.message };
  }
}
