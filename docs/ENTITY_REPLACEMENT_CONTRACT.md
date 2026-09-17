# Entity Replacement v1

A separate, explicit lifecycle retires **one** production lake identity and
inserts **two or more** fully specified replacement identities. Nothing here
changes matching, search, favorites, or the existing add/update deletion guards.
No real replacement is included in this infrastructure change.

## Artifacts and human review

1. `data/replacements/<replacementId>.json`: unreviewed manifest.
2. `npm run hash:replacement -- <replacementId>`: canonical manifest SHA-256.
3. A human creates `data/replacement-reviews/<replacementId>.json` after reviewing
   every record and its provenance. The existing update-review schema is reused:
   `schemaVersion: 1`, `proposalId: <replacementId>`, `targetLakeId: <source.id>`,
   `decision: approved|rejected`, `reviewer`, real `reviewedAt` date,
   `hashStrategy: sha256-canonical-json-v1`, `proposalHash`, optional `note`.
   Infrastructure never generates an approval decision.
4. `npm run publish:replacement -- <replacementId>` validates current eligibility
   and exclusively creates `data/published-replacements/<replacementId>.json`.
   The exact wrapper is `{schemaVersion:1, manifest, review, reviewHash}`.
   `reviewHash` is canonical SHA-256 of the full review. Changed manifest/review
   content invalidates binding. Identical publication is `unchanged`; conflict
   never overwrites. Publication does not apply production changes.
5. `npm run preflight:replacements`: read-only, deterministic preflight.
6. After separate human authorization, run
   `npm run apply:replacement -- <exact-preflight-fingerprint>`.

Canonical hashing reuses Pike's recursively sorted object-key implementation;
arrays, string values and ordering are preserved. Hashes detect changes, not
cryptographic human signatures. Git review/history remains the approval record.

## Complete manifest schema

All fields below are required; unknown top-level/source/replacement fields fail.
The placeholders below describe types, not a ready-to-publish manifest.

```text
schemaVersion: 1
replacementId: safe lowercase slug
migrationType: "one-to-many"
source:
  id: existing lake slug
  lakeFingerprint: canonical SHA-256 of source.lake
  lake: complete exact current lake record
  depth: complete exact current depth-research record
  points: complete exact current point array, or null only if key is absent
replacements: [                         # at least two, unique IDs
  { id, lake, depth, points }, ...       # complete records; points: [] is explicit
]
expectedCountBefore: positive integer
expectedCountAfter: expectedCountBefore - 1 + replacements.length
reason: nonempty migration rationale
sources: [
  { id, type, title, url, checkedAt }, ...
]
```

Sources follow existing source types and require clean HTTP(S) provenance URLs
and real YYYY-MM-DD dates. Complete facts retain their own source references.
No missing records are filled in; unknown remains unknown. Replacement records
pass the production validator, including global point-ID uniqueness and orphan
checks. IDs cannot collide with source, each other, or any current metadata key.

V1 explicitly blocks retirement of a source owned by a prior new-lake or
existing-lake-update publication. Such a source requires a future retirement
provenance bridge, not deletion of historical artifacts. Chained replacements
and overlapping migrations are also blocked. The first intended legacy source,
Bunn, has no such publication history.

Published bathymetry overlays have additional GeoJSON/runtime ID bindings outside
these three files. V1 blocks sources/replacements with published overlays.
Available replacement research must have explicit unpublished bathymetry and a
valid processing state. Research assignment must be reviewed; no georeferencing
or readiness is invented. These limitations are explicit gates, not bypasses.

## Preflight and serialization

The production scope is fixed:

- `src/data/lakes.js`
- `src/data/lakeDepthMapResearch.js`
- `src/data/lakePoints.js`

Preflight parses fresh file bytes, validates baseline state, checks complete
source equality, replacement absence and exact count transition, and constructs
outputs by cloning current state and replacing only the bound identity.
Unrelated records remain semantically exact. Each output module's exported
record is deterministically serialized; module prefix/suffix and point helpers
remain intact. Formatting of the record may change. Parsed output must exactly
match the in-memory result. No source key may survive in any managed record.

The fingerprint binds all three current/output file hashes, complete ordered
published replacements, receipts, ordinary update publications and new-lake
publications. A concurrent unrelated edit changes this fingerprint and cannot be
overwritten using an old preflight. Legitimate unrelated edits already present
when preflight begins are preserved.

Only one pending replacement is accepted per transaction. Duplicate/overlapping
publications block; no implicit migration order is inferred. Before a pending
replacement, the ordinary update and new-lake lifecycle must be satisfied with
no pending work. Existing lifecycle history must be valid. No other lifecycle is
applied by this command.

## Apply, rollback and process interruption

This is a **compensated multi-file transaction**, not an OS-level atomic swap.
Each rename is atomic; readers could observe the interval between renames. Run
apply in a maintenance checkout without concurrent production writers/readers.
The existing new-lake/update writer's allowlist remains unchanged.

The replacement writer:

1. Exclusively obtains `data/replacement-history/.pike-replacement-lock`.
2. Recomputes preflight and requires the supplied exact fingerprint.
3. Exclusively stages all outputs beside their destinations, including the new
   applied receipt; verifies every staged hash and the complete parsed dataset.
4. Exclusively creates and verifies all original-file backups before mutation.
5. Rechecks production/publication fingerprints immediately before replacement.
6. Writes a recovery journal into the lock, with destinations, backups and hashes.
7. Renames all three outputs and then the receipt; verifies final bytes, full
   replacement lifecycle, production/candidate/bathymetry validators.
8. Cleans owned staging/backups/lock only after successful validation.

The receipt is the one necessary additional **lifecycle metadata** file; it is
included in the same rollback protection, not a fourth production dataset.

Any caught write/final-validation failure restores every managed original from
its verified backup and removes the newly inserted receipt. Verified rollback
cleans temporary artifacts. If a restore cannot be verified, return `critical`,
retain backups/journal, report production state unknown, and stop. Pre-existing
staging/backup artifacts are never overwritten or deleted. Cleanup failures are
reported separately and must be resolved before another operational task.

A killed process/power failure cannot execute JavaScript rollback. The persistent
lock intentionally blocks retry. Inspect the journal and all backup hashes,
restore every original and remove any inserted receipt as one recovery operation,
then verify all original hashes and validators before removing the lock. Do not
just delete the lock and retry. There is no automatic crash-recovery/force mode
in v1 and no claim of power-loss durability or interprocess read isolation.

## Applied history and idempotency

`data/replacement-history/<replacementId>.json` is created only by successful
apply and must be committed with the production output. It contains source and
replacement IDs, canonical manifest/review hashes, exact preflight fingerprint,
all before/after file hashes, ISO applied timestamp and canonical receipt hash.
Never rewrite a receipt. Its reviewed manifest remains the immutable complete
replacement baseline and the source identity stays auditable there.

An intact receipt plus exact replacement state is `alreadyApplied`. A second
apply is write-free for production and creates no staging/backup residue.
Missing source without a receipt blocks even if replacement records happen to
match: do not manufacture an applied timestamp. Partial states, resurrected
sources, missing replacements and unexplained drift block.

Later ordinary updates are allowed without rewriting replacement history. The
history checker uses only valid `alreadyApplied` update publications and replays
a unique chain from each immutable replacement baseline. Every update's target
fingerprint and exact/absent before-state must match; final full record equality
is required. Pending or invalid updates cannot explain drift. Depth and points
must still match their approved baselines; their future updates need a separate
reviewed lineage extension. The current ordinary update lifecycle's own overlap
and superseding restrictions still apply.

The standalone production validator derives its count adjustment from valid
applied replacement history (current baseline 23 plus applied replacement
deltas). Unreviewed/pending replacements do not change the expected count.
Future additions retain the existing separate count-maintenance convention.

## Favorites and runtime

`replacementAliases(publications)` exposes the reviewed mapping
`source ID -> ordered replacement IDs`; consumers must use only publications
with validated applied receipts. It is metadata, not a redirect or grouping.
No browser/localStorage mutation or runtime import is introduced here.

A separate runtime change must approve favorite behavior before the Bunn split:
recommended one-time expansion of an old favorite to both successors, with
stable order and deduplication, then persist the migrated list. That policy is
not implemented by this lifecycle. Search/matching see ordinary new lake records.

## First Bunn step

Create a complete **unreviewed** Bunn replacement manifest after resolving data
partition, provenance-safe coordinates, depth metadata assignment, source
conflict decisions and exact point ownership. Add future-state matching tests.
Then obtain separate human review, publish, preflight, and explicit apply
approval. Bunn itself has not been migrated by this infrastructure task.
