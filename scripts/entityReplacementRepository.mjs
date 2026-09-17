import { lstat, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalJson } from './publishCandidateLake.mjs';
import { replacementFiles, preflightEntityReplacements, prepareReplacementPublication, validateReplacementManifest } from './entityReplacement.mjs';

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
export const replacementAreas = Object.freeze({ manifests: 'data/replacements', reviews: 'data/replacement-reviews', published: 'data/published-replacements', history: 'data/replacement-history' });
export function requireReplacementId(id) {
  if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error('expected replacement slug, not a path');
}
export async function safeRepositoryPath(root, path, allowMissingLeaf = false) {
  const full = resolve(root, path);
  const rel = relative(resolve(root), full);
  if (rel.startsWith('..') || !rel || rel.split(sep).includes('..')) throw new Error('unsafe repository path');
  let current = resolve(root);
  const parts = rel.split(sep);
  for (let i = 0; i < parts.length; i++) {
    current = join(current, parts[i]);
    let stat;
    try { stat = await lstat(current); } catch (error) {
      if (allowMissingLeaf && i === parts.length - 1 && error.code === 'ENOENT') return full;
      throw error;
    }
    if (stat.isSymbolicLink() || (i < parts.length - 1 && !stat.isDirectory())) throw new Error(`unsafe filesystem entry: ${path}`);
  }
  return full;
}
export async function readText(root, path) {
  const file = await safeRepositoryPath(root, path);
  if (!(await lstat(file)).isFile()) throw new Error(`expected regular file: ${path}`);
  return new TextDecoder('utf-8', { fatal: true }).decode(await readFile(file));
}
export async function readDocuments(root, directory) {
  const full = await safeRepositoryPath(root, directory);
  const files = (await readdir(full)).filter(f => f.endsWith('.json')).sort();
  return Promise.all(files.map(async file => ({ file, content: await readText(root, `${directory}/${file}`) })));
}
export async function replacementRepositoryInput(root = repositoryRoot) {
  const currentFiles = Object.fromEntries(await Promise.all(Object.values(replacementFiles).map(async path => [path, await readText(root, path)])));
  const parse = async (area, idKey) => (await readDocuments(root, area)).map(d => {
    const value = JSON.parse(d.content);
    const id = idKey === 'manifest' ? value.manifest?.replacementId : value.replacementId;
    if (`${id}.json` !== d.file) throw new Error('replacement artifact filename/identity mismatch');
    return value;
  });
  return { currentFiles, publications: await parse(replacementAreas.published, 'manifest'), receipts: await parse(replacementAreas.history, 'receipt'),
    updateDocuments: await readDocuments(root, 'data/published-updates'), newLakeDocuments: await readDocuments(root, 'data/published') };
}
export async function repositoryReplacementPreflight(root = repositoryRoot) {
  return preflightEntityReplacements(await replacementRepositoryInput(root));
}
export async function loadReplacementManifest(id, root = repositoryRoot) {
  requireReplacementId(id);
  const manifest = JSON.parse(await readText(root, `${replacementAreas.manifests}/${id}.json`));
  const errors = validateReplacementManifest(manifest);
  if (manifest.replacementId !== id || errors.length) throw new Error(`invalid replacement manifest: ${errors.join('; ')}`);
  return manifest;
}
export async function publishEntityReplacement(id, root = repositoryRoot) {
  const manifest = await loadReplacementManifest(id, root);
  const review = JSON.parse(await readText(root, `${replacementAreas.reviews}/${id}.json`));
  const publication = prepareReplacementPublication(manifest, review);
  const path = `${replacementAreas.published}/${id}.json`;
  const destination = await safeRepositoryPath(root, path, true);
  const input = await replacementRepositoryInput(root);
  const existing = input.publications.find(p => p.manifest.replacementId === id);
  if (existing && canonicalJson(existing) !== canonicalJson(publication)) throw new Error('immutable publication conflict');
  if (!existing) input.publications.push(publication);
  const preflight = await preflightEntityReplacements(input);
  if (!preflight.eligible) throw new Error([...preflight.blockers, ...preflight.validationErrors].join('; '));
  if (existing) return 'unchanged';
  await writeFile(destination, canonicalJson(publication) + '\n', { encoding: 'utf8', flag: 'wx' });
  return 'published';
}
