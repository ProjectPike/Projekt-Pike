# Production dataset apply contract

Part 3B.0 computes replacement bytes and safety metadata in memory. Run
`npm run preflight:lake-data` to inspect the current proposal without writes.
Part 3B.1 implements the separate, explicit `npm run apply:lake-data` command.
Apply is never triggered by validation, build, review or publish.

## Eligibility

A proposal is eligible only when:

- Part 3A reports no blocked publication;
- every current lake and depth-research record remains present and semantically
  unchanged;
- every new lake ID comes from Part 3A's approved additions and has one matching
  depth-research record;
- no unapproved lake or depth-research ID is present;
- the complete serialized replacement modules pass the production lake-data
  validator, including the unchanged map-point data; and
- the current source-file SHA-256 fingerprints still match the proposal base.

The serializer preserves all current production bytes and their observable lake
order, then appends approved new IDs in lexical order. With no additions, proposed
output is byte-identical to current production and no file would change.

## Implemented apply sequence

The apply command constructs a preflight, recomputes it immediately before write
preparation and requires the combined proposal fingerprint to remain identical.
The fingerprint also binds the complete ordered published-input bytes, so changed
reviewed/published input blocks apply even if production has not changed.

For a proposal with changes, apply then:

1. Re-read both destinations and verify every production fingerprint immediately
   before staging. A mismatch makes the proposal stale and blocks apply.
2. Create each `.next` file exclusively in the destination directory so its final
   rename stays on the same filesystem.
3. Verify every staged file against its proposed-output fingerprint and run the
   complete production validator over the staged pair.
4. Create an exclusive backup of every destination before replacing either file;
   verify backups against the original production fingerprints.
5. Rename staged files in the preflight's declared order.
6. Re-read and fingerprint both destinations, then validate the complete final
   production state.
7. Remove backups only after every final check succeeds.

No force, overwrite-bypass or partial-success mode is permitted.
If no files would change, apply is a write-free no-op: it creates no stage or
backup artifacts.

## Rollback

Normal filesystem operations cannot atomically replace two independent files as
one transaction. Each same-filesystem rename is atomic, but another process could
observe the interval between the two renames. Part 3B must compensate by retaining
verified originals for both files before the first replacement.

If staging, backup creation, replacement or final validation fails, restore every
destination from those verified originals, including a destination that had not
yet been replaced. Re-read both restored files and require their fingerprints to
match the preflight rollback fingerprints. If restoration cannot be verified,
stop and retain all backups for manual recovery; never continue with another
proposal.

Existing-lake updates and removals require a different reviewed workflow and are
not eligible under this contract.

### Failure reporting

The command reports one unambiguous state: `APPLY SUCCESS`, `APPLY NO-OP`,
`APPLY BLOCKED`, `APPLY FAILED — PRODUCTION UNCHANGED`,
`APPLY FAILED — ROLLBACK VERIFIED`, or
`CRITICAL — ROLLBACK VERIFICATION FAILED`. A critical result retains deterministic
backup/staging paths for manual recovery. Normal success and verified rollback
remove their temporary artifacts.

The first real lake apply should be run as a deliberately observed milestone only
after its published document, dry-run report and preflight fingerprint have been
reviewed by a human. Current support remains new lake IDs only.
