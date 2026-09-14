# Existing-lake update production contract

Existing-lake updates remain separate from the new-lake ingest pipeline. Run
`npm run preflight:lake-updates` for a read-only proposal. Production changes
require the distinct explicit `npm run apply:lake-updates` command; review and
publication never apply automatically.

## Published-update lifecycle

Every publication must contain exactly schema version 1, its proposal and its
matching approved hash-bound review.

- **Pending:** production still has the reviewed target fingerprint and every
  expected before-state. The exact reviewed SET operations can be proposed.
- **Already applied:** every path owned by the historical update exactly equals
  its reviewed proposed value. Unrelated later lake changes do not invalidate
  that history.
- **Blocked:** malformed or rejected content, hash/identity failures, unknown
  targets, stale pending state, reviewed-path drift, unsupported operations or
  ambiguous concurrent pending updates.

One already-applied update and one pending update for a different path on the
same lake are allowed. Multiple pending updates for one lake are not implicitly
ordered. A pending update may not reuse a path owned by already-applied history;
that requires a future explicit supersede/version contract.

## Preflight integrity

Preflight evaluates all published updates deterministically, applies eligible
pending SET operations only to an in-memory clone and validates the complete
production dataset. It proves other lakes and unreviewed target fields remain
unchanged. The serializer replaces only each reviewed target lake record in the
existing `lakes.js` bytes; unrelated module bytes are preserved. Depth research
is carried byte-identically and is not listed for replacement when unchanged.

SHA-256 binds the current production bytes, ordered published-update input bytes,
complete proposed output bytes and ordered pending update IDs into one proposal
fingerprint. Staging and backup names use the first 16 fingerprint characters and
sit beside the destination.

## Explicit apply and rollback

The update apply reuses Pike's compensated production-file transaction engine.
It recomputes preflight, requires an identical proposal fingerprint, rereads and
verifies production immediately before staging and again before replacement,
then validates exact staged bytes. Every changing file receives an exclusive,
verified same-directory backup before the first rename.

Replacement follows the deterministic preflight order. Any failure after a
replacement begins restores all affected originals and verifies their baseline
fingerprints plus the complete production validator. Verified rollback removes
temporary artifacts; unverifiable rollback is critical and retains recovery
artifacts. An already-applied proposal produces a write-free no-op. There is no
force, overwrite, skip-validation or fingerprint bypass.

Normal filesystem operations are not a true multi-file transaction. If a future
update changes multiple files, Pike relies on verified backups and compensating
rollback rather than claiming atomicity.
