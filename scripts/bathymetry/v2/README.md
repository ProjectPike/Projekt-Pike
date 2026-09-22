# Bathymetry v2 georeferencing pilot

Bathymetry v2 keeps source placement separate from contour extraction and
runtime publication:

`SOURCE → GCP / reference evidence → TRANSFORMATION → GEOREFERENCED SOURCE → EXTRACTION → CLIPPING → QA → PUBLISH`

This pilot implements only the first four stages plus georeferencing QA. It
does not extract, assign, clip or publish depth contours.

## Reproducible inputs

Each lake pilot keeps these machine-readable inputs under
`data/bathymetry-working/<lake-id>/`:

- `source.json`: registered source identity, dimensions and SHA-256. The source
  raster itself stays outside Git unless its licence is explicitly established.
- `osm-geometry.geojson`: the exact reviewed OpenStreetMap shoreline snapshot,
  including inner rings/islands and ODbL attribution.
- `gcps.json`: explicit source pixels and target coordinates. Every GCP has a
  provenance note and is classified as either `fit` or independent `holdout`.
- `transformation.json` and `residuals.csv`: deterministic affine output and
  individual residuals.

`georeference.py` verifies the source hash and dimensions before fitting. Only
`fit` points enter the least-squares affine model. Holdouts are evaluated after
the transform and never influence it.

## Run Klappasjön

Retrieve the registered SMHI package and extract its TIFF outside the repo,
then run:

```sh
python3 scripts/bathymetry/v2/georeference.py run \
  --source /path/to/3-3402_Klappasjön_638147-142329.tif \
  --source-metadata data/bathymetry-working/klappasjon/source.json \
  --gcps data/bathymetry-working/klappasjon/gcps.json \
  --geometry data/bathymetry-working/klappasjon/osm-geometry.geojson \
  --output-dir /tmp/klappasjon-v2-qa \
  --result data/bathymetry-working/klappasjon/transformation.json \
  --residuals data/bathymetry-working/klappasjon/residuals.csv
```

The temporary output directory receives review PNGs, including source GCPs,
target GCPs, an affine overlay, holdout arrows and close views. Raster-bearing
QA images are deliberately not committed while the source-scan licence remains
unrecorded. They are deterministic derivatives and can be regenerated from the
registered source plus committed inputs.

The command writes no runtime bathymetry and has no publish path.
