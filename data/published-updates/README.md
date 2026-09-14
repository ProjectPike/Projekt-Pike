# Published existing-lake updates — not production

`data/published-updates/<proposal-id>.json` is the deterministic, isolated
snapshot `{ "schemaVersion": 1, "proposal": { ... }, "review": { ... } }`.
Publication requires a structurally valid proposal, an exact approved review
hash and a fresh eligible U1.0 evaluation against current production.

Run `npm run publish:lake-update -- <proposal-id>`. The first publication uses
exclusive creation. An identical repeat reports `unchanged` without rewriting;
different, malformed or unsafe existing content blocks. There is no overwrite,
force or output-path option.

Published update is not live. This directory is not read by the app or the
new-lake builder. U1.2 provides separate `preflight:lake-updates` and explicit
`apply:lake-updates` commands; publication never triggers either automatically.

Preflight classifies each intact publication as pending, already applied or
blocked. Exact reviewed path values remain satisfied history even after later
updates change unrelated fields. Drift on a historically owned path blocks, and
changing that same path again requires a future explicit supersede mechanism.
Multiple pending updates for one lake are blocked unless sequencing is explicitly
added in a later contract.
