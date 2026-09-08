# Pike bathymetry data

Runtime bathymetry is stored as one GeoJSON file per lake. The app loads only
the open lake's file. Each feature is a genuine, reviewed depth contour:

```json
{
  "type": "Feature",
  "properties": { "kind": "contour", "depth": 4 },
  "geometry": { "type": "LineString", "coordinates": [] }
}
```

Visual styling is intentionally absent from the data. `LakeMap.jsx` owns line
colour, width, opacity, labels and zoom behaviour.

## Published data

| Lake | SMHI map | Depths | Georeferencing | Review |
| --- | --- | --- | --- | --- |
| Hökesjön | 5-0025 | 2, 3, 4, 5 m | robust affine shoreline fit | verified 2026-09-08 |
| Knipesjön | 5-0026 | 1, 2, 3, 4 m | robust affine shoreline fit | verified 2026-09-08 |
| Munksjön | 3-6432 | 2, 4, 6, 8, 10, 12, 14, 16, 18 m | robust affine shoreline fit | verified 2026-09-08 |
| Svansjön | 3-5723 | 1, 2, 4 m | robust affine shoreline fit | verified 2026-09-08 |

Reviewed source colour-band boundaries or explicitly labelled contour regions
were used as data geometry. Original typography, roads, fills, grid lines,
shorelines and other map graphics are not present in these files. Contours were
clipped to the current OpenStreetMap lake multipolygon, including islands, and
generalized by at most 1.5 metres to avoid false precision. The importer retries
at 0.25 metres when normal simplification would cross land.

Every file retains source, import, processing, georeferencing, clipping,
quality and licence metadata. These are generalized historical depth data and
must not be used for navigation.

## Quality gate

The source inventory and readiness state for all 22 Pike lakes lives in
`src/data/lakeDepthMapResearch.js`. `getLakeDepthMap()` exposes only datasets
whose processing state is `published` and quality state is `verified`.

Run:

```sh
npm run validate:bathymetry
npm run audit:depth-maps
```

The offline importer for reviewed colour-band maps and explicitly selected
historical contour regions is
`scripts/bathymetry/extractColorBands.py`. It requires Pillow, NumPy, SciPy,
contourpy, Matplotlib and Poppler's `pdftoppm`, plus separately downloaded SMHI
source maps and current OSM geometry. New source types need their own reviewed
extraction method; this tool must not be applied blindly to historical scans.
