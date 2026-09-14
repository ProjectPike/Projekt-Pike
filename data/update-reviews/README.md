# Existing-lake update reviews — human approval

An update proposal remains unapproved until a human reviews its exact JSON and
creates `data/update-reviews/<proposal-id>.json`. This is separate from new-lake
candidate reviews.

```json
{
  "schemaVersion": 1,
  "proposalId": "lake-id-short-change-name",
  "targetLakeId": "lake-id",
  "decision": "approved",
  "reviewer": "Reviewer name",
  "reviewedAt": "2026-09-14",
  "hashStrategy": "sha256-canonical-json-v1",
  "proposalHash": "SHA-256-OF-CANONICAL-PROPOSAL",
  "note": "Optional concrete review note"
}
```

Run `npm run hash:lake-update -- <proposal-id>` for the exact proposal being
reviewed. The hash uses the shared canonical JSON implementation: recursively
sorted object keys with arrays, strings and exact values preserved. Any semantic
proposal change requires a new review. Rejected reviews, identity mismatches,
unsupported hash strategies and stale target-production fingerprints block
publication.

An approved review authorizes only isolated update publication. It does not
authorize or perform a production write.
