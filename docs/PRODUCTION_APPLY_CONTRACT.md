# Production dataset apply contract

Part 3B.0 is preflight only. It computes replacement bytes and safety metadata in
memory; it does not write production, staging or backup files. Run
`npm run preflight:lake-data` to inspect the current proposal.

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

## Future apply sequence

An actual Part 3B apply must consume the preflight result without rebuilding or
editing it and then:

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
