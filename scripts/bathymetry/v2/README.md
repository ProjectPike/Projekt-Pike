# Bathymetry v2 georeferencing

Bathymetry v2 keeps the reviewed stages separate:

`SOURCE → GCP / reference evidence → TRANSFORMATION → GEOREFERENCED SOURCE → EXTRACTION → CLIPPING → QA → PUBLISH`

This directory implements only manifest validation, affine source placement,
independent-holdout metrics and non-runtime QA. It cannot extract contours,
change the bathymetry ledger or publish runtime files.

## Cheap normal workflow

A. The CTO/source-preparation step establishes exact source identity and a
reviewed Polygon or MultiPolygon reference snapshot. The geometry may have zero
or more islands and multiple outer components.

B. Human/agent preparation adds `gcps.json` and a small `job.json` under
`data/bathymetry-working/<lake-id>/`. The source raster stays outside Git and is
supplied at execution time.

C. The generic runner validates all identities and paths, fits affine using
only `fit` GCPs, evaluates independent `holdout` GCPs, and writes deterministic
transformation, residual and compact result files plus temporary QA images.

D. A numeric candidate-gate pass can advance to a separately reviewed
extraction study.

E. A failure remains `needs-review`; reproducible local distortion may justify
a later, explicit piecewise investigation.

F. Several already-prepared jobs use the same batch runner. It continues all
jobs, records each failure, and exits nonzero if any job fails.

Do **not** write new georeferencing code for an ordinary lake. New code should
normally be needed only for structurally unusual source/reference geometry, a
genuinely justified transformation class, or a later source-type extraction
adapter.

## Job manifest

`job.json` schema version 1 contains:

- `lakeId`, `displayName`, and `model: "affine"`;
- repository-relative `inputs` for source metadata, GCPs and reference geometry;
- repository-relative `outputs` confined to that lake's working directory;
- `qa.behavior: "temporary"` and optional configured closeups;
- optional `candidateGate: { "policy": "pilot-v1" }`;
- the human assessment recorded for the transformation artifact.

The external raster path is never committed. Validation rejects identity drift,
duplicate or invalid GCPs, underconstrained affine fits, missing holdouts,
unsupported models and output path escapes before processing.

Klappasjön's manifest is
`data/bathymetry-working/klappasjon/job.json`. Validate and run it with:

```sh
python3 scripts/bathymetry/v2/georeference.py validate \
  --job data/bathymetry-working/klappasjon/job.json

python3 scripts/bathymetry/v2/georeference.py run \
  --job data/bathymetry-working/klappasjon/job.json \
  --source /external/3-3402_Klappasjön_638147-142329.tif \
  --qa-output /tmp/klappasjon-v2-qa
```

Normal QA contains the source GCP view, reference GCP view, transformed overlay
and independent holdout residual view. Optional closeups are entirely
manifest-driven; no point IDs are hardcoded in the runner.

## Batch

Supply each manifest and an explicit `lakeId=/external/path.tif` mapping:

```sh
python3 scripts/bathymetry/v2/georeference.py batch \
  --job data/bathymetry-working/lake-a/job.json \
  --source lake-a=/external/lake-a.tif \
  --job data/bathymetry-working/lake-b/job.json \
  --source lake-b=/external/lake-b.tif \
  --qa-root /tmp/pike-bathymetry-v2-qa \
  --summary /tmp/pike-bathymetry-v2-batch.json
```

The runner performs no discovery or network access and never fabricates GCPs.

## Provisional pilot-v1 candidate gate

The optional numeric screen requires at least 8 fit GCPs, 4 independent
holdouts, holdout RMSE at most 25 m, and holdout maximum at most 50 m. Its result
means only “numeric candidate for the next bathymetry stage.” It is not a
verification or publication rule. Human review remains mandatory for regional
drift, topology, islands/narrows, source resolution and historical change.

Run the offline tests with:

```sh
python3 scripts/bathymetry/v2/test_workflow.py
```
