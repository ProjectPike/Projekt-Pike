import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { replacementHash } from './entityReplacement.mjs';
import { loadReplacementManifest, publishEntityReplacement, repositoryReplacementPreflight, repositoryRoot } from './entityReplacementRepository.mjs';
import { applyEntityReplacement } from './applyEntityReplacement.mjs';

export async function run(args = process.argv.slice(2)) {
  const [command, value] = args;
  if (command === 'hash' && args.length === 2) return replacementHash(await loadReplacementManifest(value));
  if (command === 'publish' && args.length === 2) return publishEntityReplacement(value);
  if (command === 'preflight' && args.length === 1) {
    const p = await repositoryReplacementPreflight();
    const { serializedFiles, proposedDataset, ...report } = p;
    if (!p.eligible) process.exitCode = 1;
    return report;
  }
  if (command === 'apply' && args.length === 2) {
    const result = await applyEntityReplacement({ root: repositoryRoot, expectedFingerprint: value });
    if (!['success', 'noop'].includes(result.status)) process.exitCode = 1;
    return result;
  }
  throw new Error('Usage: entityReplacementCli.mjs hash <id> | publish <id> | preflight | apply <exact-preflight-fingerprint>');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await run(), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
