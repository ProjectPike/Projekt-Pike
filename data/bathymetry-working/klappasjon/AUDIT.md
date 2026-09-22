# Klappasjön Bathymetry v2 georeferencing audit

## Scope and source identity

This pilot places the registered historical source map only. It does not
extract, assign, clip or publish depth contours.

- Registered lake: Klappasjön (`klappasjon`)
- SMHI lake ID: `638147-142329`
- Map: `3-3402`, Nässjö kommun, TIFF, survey date shown as 1986-06-02
- TIFF dimensions: 5024 × 7192 pixels, 1-bit, 600 dpi
- TIFF SHA-256: `9b1fc55d1d9f0fbb1063fc677779494062d8c0024d5e8583d73b15f1b12e30ed`
- Registered package retrieved: 2026-09-22
- Reference geometry: unnamed OpenStreetMap water multipolygon relation
  `1428762`, snapshot base timestamp `2026-09-22T08:45:51Z`, retrieved
  `2026-09-22T18:31:00Z`, ODbL 1.0

The geometry identity is confirmed by the Pike production coordinate
`14.51712, 57.55435` falling within relation 1428762, plus the distinctive
north double apex, elongated southern basin, eastern lobes and matching island
pattern. The committed polygon preserves one outer ring and all ten mapped
inner rings without simplification.

The original TIFF is not committed. Its source identity and hash are committed,
and the registered SMHI URL reproduced the exact file during this audit.

## Explicit GCP model

Ten distributed points fit the affine model. Six points are excluded from the
fit and used only as independent checks: the northern inlet, four island tips
distributed north-to-south, and a lower western bay corner. Every point and its
OSM member/vertex provenance is recorded in `gcps.json`.

The model maps `[pixelX, pixelY, 1]` to local `[east, north]` metres:

```text
[
  [ 0.298367412735,  0.006142172337],
  [ 0.003059676838, -0.288121554896],
  [-898.367661823338, 825.829330011755]
]
```

Equivalent geographic equations are:

```text
longitude = 0.000004995973574 * pixelX
          + 0.000000051232353 * pixelY
          + 14.502710071824831

latitude  = 0.000000055565156 * pixelX
          - 0.000002606491360 * pixelY
          + 57.562754464212170
```

No bounding-box stretch, independent axis fill or shoreline nearest-neighbour
fit is used.

## Residuals

| Group | Count | Mean | Median | Maximum | RMSE |
| --- | ---: | ---: | ---: | ---: | ---: |
| Fit | 10 | 16.794 m | 16.700 m | 31.631 m | 17.908 m |
| Holdout | 6 | 11.746 m | 11.149 m | 16.254 m | 12.250 m |

The largest residual is fit point `F09`, the broad west-shore shoulder beside
the upper basin, at 31.631 m. It is the only medium-confidence fitting feature
and does not have a matching regional holdout drift. The holdout mean vector is
6.173 m east and 1.874 m south, small relative to both the source line width and
the individual residuals.

The four island holdouts measure 7.172, 8.967, 9.332 and 12.967 m. Their shapes
and north-to-south placement align without topology reversal or detectable
local scale change. The northern inlet holdout measures 15.784 m. Major
headlands and the eastern channel entrance remain visually aligned throughout
the lake.

## Model decision

Affine is sufficient for this source-placement stage. The fitted pixel scales
are 0.298630 and 0.287931 m/pixel along the affine principal axes, a 3.7%
difference consistent with modest scan/paper distortion rather than separate
regional warps. Residual directions alternate around the lake; no coherent
local drift, section join or discontinuity is visible.

A piecewise model was not tested. Adding flexibility when all independent
holdouts remain at or below 16.254 m would fit shoreline detail rather than
demonstrated paper distortion and could unnecessarily deform the source depth
geometry.

## Reproduction and QA

Two independent runs from the same TIFF, committed GCP file and committed OSM
snapshot produced byte-identical transformation JSON and residual CSV:

- `transformation.json`: `a6d50e1ddea2ce660c358e51a38b0aa26f5185b29a572fda17bbb62d89d13b61`
- `residuals.csv`: `ea30960cf701806580e8fdd8176958db574470d98a4ec4c6c7a9294dfea4aedd`

The run generated five non-runtime review images:

1. numbered source GCPs
2. numbered OSM shoreline GCPs
3. affine source/shoreline overlay
4. independent holdout residual arrows
5. close views of the northern inlet, mapped islands and largest residual

Raster-bearing images are reproducible but not committed because the source
scan's licence is not recorded in the registered package. This avoids silently
expanding the repository's source-material licensing convention.

## Extraction feasibility and proposed pilot gate

The source visibly contains genuine shoreline, islands, labelled 2/4/6/8/10 m
contours and isolated 11 m soundings. A follow-up may investigate extraction of
the explicitly labelled contour lines. It must keep labels, soundings, hatching,
shoreline and other ink separate and must not infer missing segments or values.

Klappasjön supports this conservative candidate gate for future v2 review,
subject to human approval and more pilots:

- at least 8 strong, distributed fit GCPs;
- at least 4 independent holdouts spanning multiple lake regions and including
  islands/narrows where present;
- holdout RMSE no greater than 25 m and maximum no greater than 50 m;
- no coherent regional drift, topology reversal or island/narrows mismatch;
- affine preferred unless independent holdouts demonstrate localized,
  reproducible distortion;
- source age, resolution, line width and explainable shoreline change reviewed
  before any extraction or publication decision.

This is deliberately a pilot recommendation, not a universal v2 policy.

Recommendation for Klappasjön: **proceed-to-extraction**, with a new human
review before any contour data can move toward clipping or publication.
