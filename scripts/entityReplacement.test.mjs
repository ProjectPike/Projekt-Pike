import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { replacementHash, replacementFiles, validateReplacementManifest, prepareReplacementPublication, preflightEntityReplacements, parseReplacementFiles, replacementAliases } from './entityReplacement.mjs';
import { repositoryReplacementPreflight, replacementRepositoryInput, publishEntityReplacement } from './entityReplacementRepository.mjs';
import { applyEntityReplacement } from './applyEntityReplacement.mjs';
import { prepareReviewedUpdatePublication } from './publishLakeUpdate.mjs';
import { createProductionDatasetPreflight } from './productionDatasetPreflight.mjs';
import { evaluateLakeUpdateProposal } from './evaluateLakeUpdates.mjs';

const source = { id: 'synthetic-source', name: 'Synthetic source', coordinates: [14, 58], coordinateSource: 'https://example.org/location', details: Object.fromEntries(['access','methods','species','watercraft','boat','practical','geography','safety'].map(s => [s, {}])) };
const depth = { status: 'not-found', checkedAt: '2026-09-17', maps: [] };
const provenance = { id: 'synthetic', type: 'other', title: 'Synthetic fixture', url: 'https://example.org/fixture', checkedAt: '2026-09-17' };
function fixture() {
  const state = { lakes: { [source.id]: structuredClone(source), unrelated: { ...structuredClone(source), id: 'unrelated', name: 'Unrelated' } }, lakeDepthMapResearch: { [source.id]: structuredClone(depth), unrelated: structuredClone(depth) }, lakePointsByLakeId: { [source.id]: [] } };
  const manifest = { schemaVersion: 1, replacementId: 'synthetic-split', migrationType: 'one-to-many',
    source: { id: source.id, lakeFingerprint: replacementHash(source), lake: structuredClone(source), depth: structuredClone(depth), points: [] },
    replacements: ['synthetic-north','synthetic-south'].map(id => ({ id, lake: { ...structuredClone(source), id, name: id }, depth: structuredClone(depth), points: [] })),
    expectedCountBefore: 2, expectedCountAfter: 3, reason: 'Synthetic split test', sources: [provenance] };
  const review = { schemaVersion: 1, proposalId: manifest.replacementId, targetLakeId: source.id, decision: 'approved', reviewer: 'Synthetic test reviewer', reviewedAt: '2026-09-17', hashStrategy: 'sha256-canonical-json-v1', proposalHash: replacementHash(manifest) };
  return { state, manifest, review };
}
const files = state => Object.fromEntries(Object.entries(replacementFiles).map(([name,path]) => [path, `export const ${name} = ${JSON.stringify(state[name], null, 2)};\n${name === 'lakePointsByLakeId' ? 'export function untouchedHelper() { return 42; }\n' : ''}`]));
const input = f => ({ currentFiles: files(f.state), publications: [prepareReplacementPublication(f.manifest,f.review)] });
async function repo(t) {
  const root = await mkdtemp(join(tmpdir(),'pike-replacement-')); t.after(() => rm(root,{recursive:true,force:true}));
  for (const dir of ['src/data','data/replacements','data/replacement-reviews','data/published-replacements','data/replacement-history','data/published-updates','data/published']) await mkdir(join(root,dir),{recursive:true});
  const f=fixture();
  for (const [path,content] of Object.entries(files(f.state))) await writeFile(join(root,path),content);
  await writeFile(join(root,'data/replacements/synthetic-split.json'),JSON.stringify(f.manifest));
  await writeFile(join(root,'data/replacement-reviews/synthetic-split.json'),JSON.stringify(f.review));
  await publishEntityReplacement('synthetic-split',root);
  return {root,...f};
}
const apply = async (root, options={}) => applyEntityReplacement({root,expectedFingerprint:(await repositoryReplacementPreflight(root)).fingerprint,validate:async()=>{},now:()=> '2026-09-17T12:00:00.000Z',...options});
async function residue(root) {
  const list=[];
  for(const dir of ['src/data','data/replacement-history']) for(const file of await readdir(join(root,dir))) if(file.includes('.pike-')) list.push(file);
  return list;
}

test('valid one-to-two manifest and deterministic read-only three-file preflight',async()=>{
 const f=fixture();assert.deepEqual(validateReplacementManifest(f.manifest),[]);
 const i=input(f);const before=structuredClone(i);const p=await preflightEntityReplacements(i);
 assert.equal(p.eligible,true);assert.deepEqual(i,before);assert.equal(p.productionModified,false);
 assert.deepEqual(p.filesToChange,Object.values(replacementFiles).sort());assert.equal(p.proposedLakeCount,3);
 assert.equal(p.proposedDataset.lakes[source.id],undefined);
 assert.deepEqual(p.proposedDataset.lakes.unrelated,f.state.lakes.unrelated);
 assert.deepEqual(await parseReplacementFiles(p.serializedFiles),p.proposedDataset);
 assert.match(p.serializedFiles[replacementFiles.lakePointsByLakeId],/untouchedHelper/);
 assert.equal(p.fingerprint,(await preflightEntityReplacements(i)).fingerprint);
 assert.deepEqual(replacementAliases(i.publications),{'synthetic-source':['synthetic-north','synthetic-south']});
});
for(const [name,mutate] of [
 ['missing source', f=>delete f.state.lakes[source.id]],
 ['existing replacement', f=>f.state.lakes['synthetic-north']={...source,id:'synthetic-north'}],
 ['stale lake', f=>f.state.lakes[source.id].name='Drift'],
 ['stale depth', f=>f.state.lakeDepthMapResearch[source.id].checkedAt='2026-09-16'],
 ['stale points', f=>delete f.state.lakePointsByLakeId[source.id]],
 ['wrong count', f=>{f.state.lakes.extra={...source,id:'extra'};f.state.lakeDepthMapResearch.extra=depth;}],
]) test(`${name} blocks`,async()=>{const f=fixture();mutate(f);assert.equal((await preflightEntityReplacements(input(f))).eligible,false);});
for(const [name,mutate] of [
 ['duplicate IDs',m=>m.replacements[1]=structuredClone(m.replacements[0])],
 ['source fingerprint',m=>m.source.lakeFingerprint='0'.repeat(64)],
 ['missing replacement points',m=>delete m.replacements[0].points],
 ['missing replacement depth',m=>delete m.replacements[0].depth],
 ['arbitrary delete',m=>m.replacements=[]],
 ['self replacement',m=>m.replacements[0].id=source.id],
 ['published overlay',m=>m.source.depth.bathymetry={published:true}],
 ['unsupported fields',m=>m.force=true],
]) test(`manifest rejects ${name}`,()=>{const f=fixture();mutate(f.manifest);assert.ok(validateReplacementManifest(f.manifest).length);});
test('canonical review binding rejects changed data, rejected reviews and wrapper tampering',async()=>{
 const f=fixture();const p=prepareReplacementPublication(f.manifest,f.review);
 const changed=structuredClone(f.manifest);changed.replacements[0].lake.name='Changed';
 assert.throws(()=>prepareReplacementPublication(changed,f.review));assert.throws(()=>prepareReplacementPublication(f.manifest,{...f.review,decision:'rejected'}));
 p.reviewHash='0'.repeat(64);assert.equal((await preflightEntityReplacements({currentFiles:files(f.state),publications:[p]})).eligible,false);
});
test('publication is exclusive and repeat is unchanged',async t=>{
 const {root}=await repo(t);assert.equal(await publishEntityReplacement('synthetic-split',root),'unchanged');
 const path=join(root,'data/published-replacements/synthetic-split.json');const p=JSON.parse(await readFile(path,'utf8'));p.reviewHash='0'.repeat(64);await writeFile(path,JSON.stringify(p));
 await assert.rejects(publishEntityReplacement('synthetic-split',root));
});
test('conflicting publications block',async()=>{const f=fixture();const i=input(f);i.publications.push(i.publications[0]);assert.equal((await preflightEntityReplacements(i)).eligible,false);});
test('apply stages source retirement and all metadata, persists history; second apply writes nothing',async t=>{
 const {root,state}=await repo(t);const result=await apply(root);assert.equal(result.status,'success',JSON.stringify(result));
 const post=await repositoryReplacementPreflight(root);assert.equal(post.eligible,true,post.blockers.join());assert.deepEqual(post.alreadyApplied,['synthetic-split']);assert.deepEqual(post.pending,[]);assert.deepEqual(post.filesToChange,[]);
 assert.deepEqual(post.proposedDataset.lakes.unrelated,state.lakes.unrelated);
 for(const record of Object.values(post.proposedDataset)) assert.equal(Object.hasOwn(record,source.id),false);
 const first=await replacementRepositoryInput(root);assert.equal(first.receipts.length,1);assert.equal(first.receipts[0].appliedAt,'2026-09-17T12:00:00.000Z');
 assert.equal((await apply(root)).status,'noop');assert.deepEqual(await replacementRepositoryInput(root),first);assert.deepEqual(await residue(root),[]);
});
for(const failingPath of [...Object.values(replacementFiles),'data/replacement-history/synthetic-split.json']) test(`failure after replacing ${failingPath} rolls back ALL files`,async t=>{
 const {root}=await repo(t);const before=await replacementRepositoryInput(root);
 const result=await apply(root,{checkpoint:async(name,e)=>{if(name==='after-replace'&&e.path===failingPath)throw new Error('injected failure');}});
 assert.equal(result.status,'rolled-back',JSON.stringify(result));assert.equal(result.rollbackRequired,true);
 assert.deepEqual(await replacementRepositoryInput(root),before);assert.deepEqual(await residue(root),[]);
});
test('post-apply validator failure rolls back data and receipt',async t=>{const {root}=await repo(t);const before=await replacementRepositoryInput(root);const r=await apply(root,{validate:async()=>{throw new Error('validator failed');}});assert.equal(r.status,'rolled-back');assert.deepEqual(await replacementRepositoryInput(root),before);});
test('stale preflight does not overwrite unrelated drift',async t=>{
 const {root}=await repo(t);const result=await apply(root,{checkpoint:async name=>{if(name==='before-recheck'){const i=await replacementRepositoryInput(root);const s=await parseReplacementFiles(i.currentFiles);s.lakes.unrelated.name='Concurrent edit';await writeFile(join(root,replacementFiles.lakes),files(s)[replacementFiles.lakes]);}}});
 assert.equal(result.status,'blocked');const p=await repositoryReplacementPreflight(root);assert.equal(p.proposedDataset.lakes.unrelated.name,'Concurrent edit');assert.deepEqual(await residue(root),[]);
});
test('partial state and missing receipt cannot masquerade as applied',async t=>{
 const {root}=await repo(t);assert.equal((await apply(root)).status,'success');await rm(join(root,'data/replacement-history/synthetic-split.json'));assert.equal((await repositoryReplacementPreflight(root)).eligible,false);
});
test('unexplained replacement drift blocks even with receipt',async t=>{const {root}=await repo(t);await apply(root);const i=await replacementRepositoryInput(root);const s=await parseReplacementFiles(i.currentFiles);s.lakes['synthetic-north'].name='Unreviewed';await writeFile(join(root,replacementFiles.lakes),files(s)[replacementFiles.lakes]);assert.equal((await repositoryReplacementPreflight(root)).eligible,false);});
test('future ordinary reviewed update preserves exact replacement provenance',async t=>{
 const {root}=await repo(t);await apply(root);const i=await replacementRepositoryInput(root);const s=await parseReplacementFiles(i.currentFiles);const lake=s.lakes['synthetic-north'];
 const proposal={schemaVersion:1,proposalId:'synthetic-later-update',targetLakeId:lake.id,targetLakeFingerprint:replacementHash(lake),reason:'Synthetic later correction',sources:[provenance],changes:[{operation:'set',path:'details.methods.spin',expected:{mode:'absent'},proposed:{value:'allowed',status:'verified',ruleType:'rule',verifiedAt:'2026-09-17',sources:[{url:provenance.url,type:'other'}],conditions:null,note:'Synthetic'},reason:'Synthetic update',sources:['synthetic'],verifiedAt:'2026-09-17'}]};
 const review={schemaVersion:1,proposalId:proposal.proposalId,targetLakeId:lake.id,decision:'approved',reviewer:'Synthetic',reviewedAt:'2026-09-17',hashStrategy:'sha256-canonical-json-v1',proposalHash:replacementHash(proposal)};
 const publication=prepareReviewedUpdatePublication(proposal,review);
 lake.details.methods.spin=proposal.changes[0].proposed;
 await writeFile(join(root,replacementFiles.lakes),files(s)[replacementFiles.lakes]);await writeFile(join(root,'data/published-updates/synthetic-later-update.json'),JSON.stringify(publication));
 const p=await repositoryReplacementPreflight(root);assert.equal(p.eligible,true,p.blockers.join());assert.deepEqual(p.alreadyApplied,['synthetic-split']);assert.equal((await apply(root)).status,'noop');
});
test('pre-existing recovery lock is retained and blocks apply',async t=>{const {root}=await repo(t);const lock=join(root,'data/replacement-history/.pike-replacement-lock');await writeFile(lock,'manual recovery required');assert.equal((await apply(root)).status,'blocked');assert.equal(await readFile(lock,'utf8'),'manual recovery required');});
test('corrupt staged data blocks before any production write',async t=>{const {root}=await repo(t);const before=await replacementRepositoryInput(root);const r=await apply(root,{checkpoint:async(name,e)=>{if(name==='after-stage')await writeFile(e.staging,'bad');}});assert.equal(r.status,'blocked');assert.deepEqual(await replacementRepositoryInput(root),before);assert.deepEqual(await residue(root),[]);});
test('normal new-lake and update workflows still reject retirement',async()=>{
 const f=fixture();const proposed=structuredClone(f.state);delete proposed.lakes[source.id];delete proposed.lakeDepthMapResearch[source.id];
 const p=await createProductionDatasetPreflight({productionLakes:f.state.lakes,productionDepthMapResearch:f.state.lakeDepthMapResearch,lakePointsByLakeId:f.state.lakePointsByLakeId,currentFiles:files(f.state),buildResult:{proposedDataset:proposed,additions:[],blocked:[],productionErrors:[]}});
 assert.equal(p.eligible,false);assert.ok(p.blockers.some(b=>b.code==='existing-lake-removed'));
 const bad={schemaVersion:1,proposalId:'delete-source',targetLakeId:source.id,targetLakeFingerprint:replacementHash(source),reason:'Not allowed',sources:[provenance],changes:[{operation:'remove',path:'id',expected:{mode:'exact',value:source.id},proposed:null,reason:'Not allowed',sources:['synthetic'],verifiedAt:'2026-09-17'}]};
 assert.equal(evaluateLakeUpdateProposal({proposal:bad,productionLakes:f.state.lakes,productionDepthMapResearch:f.state.lakeDepthMapResearch,lakePointsByLakeId:f.state.lakePointsByLakeId}).eligible,false);
});
test('one-to-three and absent source points are explicit and valid',async()=>{
 const f=fixture();delete f.state.lakePointsByLakeId[source.id];f.manifest.source.points=null;
 const third=structuredClone(f.manifest.replacements[0]);third.id='synthetic-third';third.lake.id=third.id;f.manifest.replacements.push(third);f.manifest.expectedCountAfter=4;f.review.proposalHash=replacementHash(f.manifest);
 const p=await preflightEntityReplacements(input(f));assert.equal(p.eligible,true,p.blockers.join());assert.equal(p.proposedLakeCount,4);assert.deepEqual(p.proposedDataset.lakePointsByLakeId[third.id],[]);
});
test('tampered receipt is rejected',async t=>{
 const {root}=await repo(t);await apply(root);const path=join(root,'data/replacement-history/synthetic-split.json');const receipt=JSON.parse(await readFile(path,'utf8'));receipt.appliedAt='2026-09-18T12:00:00.000Z';await writeFile(path,JSON.stringify(receipt));assert.equal((await repositoryReplacementPreflight(root)).eligible,false);
});
test('unrelated state existing before preflight is preserved, not replaced by manifest assumptions',async()=>{
 const f=fixture();f.state.lakes.unrelated.name='New unrelated verified name';const p=await preflightEntityReplacements(input(f));assert.equal(p.eligible,true);assert.equal(p.proposedDataset.lakes.unrelated.name,f.state.lakes.unrelated.name);
});
test('critical rollback retains verified backups and recovery journal',async t=>{
 const {root}=await repo(t);const r=await apply(root,{checkpoint:async(name,e)=>{if(name==='after-replace'&&e.path===replacementFiles.lakes){await writeFile(e.backup,'corrupted backup');throw new Error('injected');}}});
 assert.equal(r.status,'critical');assert.equal(r.productionModified,null);assert.ok((await residue(root)).includes('.pike-replacement-lock'));assert.ok((await residue(root)).some(p=>p.endsWith('.backup')));
});
test('pre-existing stage file is not removed or overwritten',async t=>{
 const {root}=await repo(t);const p=await repositoryReplacementPreflight(root);const path=join(root,`${p.filesToChange[0]}.pike-${p.fingerprint.slice(0,16)}.next`);await writeFile(path,'previous recovery');const r=await apply(root);assert.equal(r.status,'blocked');assert.equal(await readFile(path,'utf8'),'previous recovery');
});
test('malformed available bathymetry is blocked before publication',()=>{
 const f=fixture();f.manifest.replacements[0].depth={status:'available',checkedAt:'2026-09-17',smhiLakeId:'test',sourceUrl:'https://example.org/map',maps:[{}]};assert.ok(validateReplacementManifest(f.manifest).some(e=>e.includes('processing state')));
});
