import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).parent))

from extraction import (  # noqa: E402
    _land_crossing_count,
    clip_path,
    extract_selection,
    require_temporary_output,
    run_extraction,
    validate_manifest,
)
from workflow import JobValidationError, sha256, write_json  # noqa: E402


class SyntheticExtractionJob:
    def __init__(self, root):
        self.root = Path(root)
        self.lake_id = "synthetic-extraction"
        self.working = self.root / "data" / "bathymetry-working" / self.lake_id
        self.working.mkdir(parents=True)
        self.source_path = self.root / "source.tif"

        image = Image.new("L", (64, 64), color=255)
        draw = ImageDraw.Draw(image)
        draw.line([(8, 8), (54, 8), (54, 54)], fill=0, width=1)
        image.save(self.source_path, format="TIFF")

        self.source = {
            "schemaVersion": 1,
            "lakeId": self.lake_id,
            "format": "TIFF",
            "widthPixels": 64,
            "heightPixels": 64,
            "mapNumber": "synthetic-map",
            "fileSha256": sha256(self.source_path),
        }
        self.transformation = {
            "schemaVersion": 1,
            "lakeId": self.lake_id,
            "model": "affine",
            "affineLongitudeLatitude": {
                "longitudeCoefficients": [0.001, 0.0, 10.0],
                "latitudeCoefficients": [0.0, 0.001, 60.0],
            },
        }
        self.geometry = {
            "type": "FeatureCollection",
            "metadata": {"schemaVersion": 1, "lakeId": self.lake_id},
            "features": [{
                "type": "Feature",
                "properties": {"lakeId": self.lake_id},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [9.99, 59.99], [10.07, 59.99], [10.07, 60.07],
                        [9.99, 60.07], [9.99, 59.99],
                    ]],
                },
            }],
        }
        self.source_metadata_path = self.working / "source.json"
        self.transformation_path = self.working / "transformation.json"
        self.geometry_path = self.working / "geometry.geojson"
        write_json(self.source_metadata_path, self.source)
        write_json(self.transformation_path, self.transformation)
        write_json(self.geometry_path, self.geometry)

        base = f"data/bathymetry-working/{self.lake_id}"
        self.manifest = {
            "schemaVersion": 1,
            "lakeId": self.lake_id,
            "adapter": "reviewed-waypoint-line-art-v1",
            "inputs": {
                "sourceMetadata": f"{base}/source.json",
                "acceptedTransformation": f"{base}/transformation.json",
                "referenceGeometry": f"{base}/geometry.geojson",
            },
            "sourceSha256": self.source["fileSha256"],
            "transformationSha256": sha256(self.transformation_path),
            "referenceGeometrySha256": sha256(self.geometry_path),
            "permittedDepths": [2],
            "semanticExclusions": {
                "soundingValues": [11],
                "soundingsAreContours": False,
            },
            "lineArt": {"inkThreshold": 128},
            "selections": [{
                "id": "depth-2-line",
                "depth": 2,
                "closed": False,
                "sourceInkSeed": [8, 8],
                "waypoints": [[8, 8], [54, 8], [54, 54]],
                "corridorRadiusPixels": 5,
                "maximumGuideSnapPixels": 5,
                "minimumExtractedPoints": 80,
            }],
            "outputs": {
                "candidateBehavior": "temporary",
                "qaBehavior": "temporary",
                "result": f"{base}/result.json",
            },
        }
        self.manifest_path = self.working / "extraction.json"
        self.flush_manifest()

    def flush_manifest(self):
        write_json(self.manifest_path, self.manifest)

    def run(self, suffix):
        return run_extraction(
            self.manifest_path,
            self.source_path,
            self.working / f"candidate-{suffix}.geojson",
            self.working / f"qa-{suffix}",
            self.root,
            render_qa=False,
        )


class ExtractionValidationTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.job = SyntheticExtractionJob(self.root)

    def tearDown(self):
        self.temporary.cleanup()

    def test_source_and_transformation_hash_binding(self):
        with Image.open(self.job.source_path) as image:
            changed = image.copy()
        changed.putpixel((0, 0), 0)
        changed.save(self.job.source_path, format="TIFF")
        with self.assertRaisesRegex(JobValidationError, "source SHA-256 mismatch"):
            self.job.run("changed-source")

        self.job = SyntheticExtractionJob(self.root / "second")
        changed_transform = copy.deepcopy(self.job.transformation)
        changed_transform["affineLongitudeLatitude"]["longitudeCoefficients"][2] += 1
        write_json(self.job.transformation_path, changed_transform)
        with self.assertRaisesRegex(JobValidationError, "transformation artifact"):
            validate_manifest(self.job.manifest_path, self.job.root)

    def test_permitted_depth_and_sounding_only_depth_rejected(self):
        self.job.manifest["selections"][0]["depth"] = 11
        self.job.flush_manifest()
        with self.assertRaisesRegex(JobValidationError, "non-permitted depth"):
            validate_manifest(self.job.manifest_path, self.root)

        self.job.manifest["permittedDepths"] = [2, 11]
        self.job.flush_manifest()
        with self.assertRaisesRegex(JobValidationError, "sounding-only"):
            validate_manifest(self.job.manifest_path, self.root)

    def test_repeated_extraction_is_byte_deterministic(self):
        first = self.job.run("one")
        first_bytes = (self.job.working / "candidate-one.geojson").read_bytes()
        second = self.job.run("two")
        second_bytes = (self.job.working / "candidate-two.geojson").read_bytes()
        self.assertEqual(first_bytes, second_bytes)
        self.assertEqual(first["candidateSha256"], second["candidateSha256"])

    def test_routing_never_leaves_source_ink(self):
        with Image.open(self.job.source_path) as source:
            ink = np.asarray(source.convert("L")) < 128
        labels, _ = ndimage.label(ink, structure=np.ones((3, 3), dtype=np.uint8))
        path = extract_selection(ink, labels, self.job.manifest["selections"][0])
        self.assertTrue(path)
        self.assertTrue(all(ink[y, x] for x, y in path))

    def test_clipping_splits_around_island_without_land_crossing(self):
        components = [{
            "outer": [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
            "inner": [[[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]],
        }]
        clipped = clip_path([[2, 5], [8, 5]], components)
        self.assertEqual(len(clipped), 2)
        self.assertEqual(_land_crossing_count(clipped, components), 0)

    def test_runtime_public_output_is_rejected(self):
        with self.assertRaisesRegex(JobValidationError, "only under"):
            require_temporary_output(
                self.root / "public" / "bathymetry" / "synthetic.geojson",
                self.root,
            )


class KlappasjonExtractionRegressionTests(unittest.TestCase):
    repo_root = Path(__file__).resolve().parents[3]
    working = repo_root / "data" / "bathymetry-working" / "klappasjon"

    def test_frozen_config_and_result_identity(self):
        self.assertEqual(
            sha256(self.working / "extraction.json"),
            "6d73119108078a6fa31f65117c9937067cf82a65b851b5aa2460d4f5654d6a2c",
        )
        result = json.loads((self.working / "extraction-result.json").read_text())
        self.assertEqual(result["candidateSha256"], "045a6a77c15e662f871ad7881d1334c8641423046f6638b0205e6fa64f92acdd")
        self.assertEqual(result["extractedDepths"], [2, 4, 6, 8, 10])
        self.assertEqual(result["clipping"]["sourceSegmentCount"], 11)
        self.assertEqual(result["clipping"]["postclipSegmentCount"], 12)
        self.assertEqual(result["clipping"]["postclipLandCrossingCount"], 0)


if __name__ == "__main__":
    unittest.main()
