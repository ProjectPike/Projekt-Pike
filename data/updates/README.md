# Existing-lake update proposals — not production

`data/updates/` contains explicit, unreviewed proposals for changing lakes that
already exist in production. This is separate from the new-lake
candidate/review/published pipeline. U1.0 provides validation and a read-only dry
run. U1.1 adds hash-bound human review in `data/update-reviews/` and isolated
publication in `data/published-updates/`. There is still no production-apply path
inside the proposal evaluator or publisher. U1.2 adds a separate fingerprint-bound
preflight and explicit safe apply command documented in
`docs/UPDATE_APPLY_CONTRACT.md`.

Run `npm run dry-run:lake-updates`. The command reads proposals, evaluates them
against the current production lake records in memory, validates the complete
proposed lake dataset and writes nothing.

## Proposal format

```json
{
  "schemaVersion": 1,
  "proposalId": "lake-id-short-change-name",
  "targetLakeId": "lake-id",
  "targetLakeFingerprint": "SHA-256-OF-CANONICAL-CURRENT-LAKE",
  "reason": "Why the update is proposed",
  "sources": [
    {
      "id": "source-id",
      "type": "authority",
      "title": "Source title",
      "url": "https://example.org/source",
      "checkedAt": "2026-09-14"
    }
  ],
  "changes": [
    {
      "operation": "set",
      "path": "details.methods.spin",
      "expected": { "mode": "absent" },
      "proposed": { "value": "allowed" },
      "reason": "Exact reason for this path",
      "sources": ["source-id"],
      "verifiedAt": "2026-09-14"
    }
  ]
}
```

`targetLakeFingerprint` is SHA-256 over the existing canonical JSON semantics:
object keys are sorted recursively while arrays, strings and exact values are
preserved. Any production change to the target makes the proposal stale.

U1.0 supports only `set` on safe dotted object paths. Every parent object must
already exist; the evaluator never manufactures intermediate structures. Each
change must use exactly one expectation:

- `{ "mode": "absent" }`: the final path must not exist;
- `{ "mode": "exact", "value": ... }`: the current value must match exactly.

Duplicate paths and ancestor/descendant path overlaps are blocked. SET writes the
explicit `proposed` JSON value only to an in-memory clone. The complete proposed
dataset must pass production validation, all other lakes must remain identical,
and every target change outside the listed paths is blocked. REMOVE, arrays and
production apply are deferred.
