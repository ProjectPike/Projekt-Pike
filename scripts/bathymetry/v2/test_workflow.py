import copy
import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))

from workflow import (  # noqa: E402
    JobValidationError,
    batch_jobs,
    fit_affine,
    geometry_components,
    projection,
    run_job,
    sha256,
    validate_job,
)
from georeference import require_non_runtime_output  # noqa: E402


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def square(x=10.0, y=60.0, size=0.02):
    return [
        [x, y],
        [x + size, y],
        [x + size, y + size],
        [x, y + size],
        [x, y],
    ]


class SyntheticJob:
    def __init__(self, root, lake_id="synthetic-one", geometry_type="Polygon", islands=False):
        self.root = Path(root)
        self.lake_id = lake_id
        self.directory = self.root / "data" / "bathymetry-working" / lake_id
        self.directory.mkdir(parents=True)
        self.source_path = self.root / f"{lake_id}.tif"
        Image.new("L", (32, 32), color=255).save(self.source_path, format="TIFF")
        source_hash = sha256(self.source_path)

        self.source = {
            "schemaVersion": 1,
            "lakeId": lake_id,
            "displayName": lake_id,
            "format": "TIFF",
            "widthPixels": 32,
            "heightPixels": 32,
            "mapNumber": f"map-{lake_id}",
            "smhiLakeId": f"id-{lake_id}",
            "fileSha256": source_hash,
        }
        self.gcps = {
            "schemaVersion": 1,
            "lakeId": lake_id,
            "sourceMapNumber": self.source["mapNumber"],
            "sourceSha256": source_hash,
            "referenceGeometry": {"relationId": 123},
            "rasterCropPixels": [0, 0, 32, 32],
            "transformCandidate": "affine",
            "gcps": [
                self.point("F1", 2, 2, 10.002, 60.002, "fit"),
                self.point("F2", 28, 2, 10.028, 60.002, "fit"),
                self.point("F3", 2, 28, 10.002, 60.028, "fit"),
                self.point("H1", 20, 20, 10.020, 60.020, "holdout"),
            ],
        }
        polygon = [square()]
        if islands:
            polygon.append(square(10.008, 60.008, 0.003))
        coordinates = polygon
        if geometry_type == "MultiPolygon":
            coordinates = [polygon, [square(10.03, 60.03, 0.005)]]
        self.geometry = {
            "type": "FeatureCollection",
            "metadata": {"schemaVersion": 1, "lakeId": lake_id, "relationId": 123},
            "features": [{
                "type": "Feature",
                "properties": {"lakeId": lake_id},
                "geometry": {"type": geometry_type, "coordinates": coordinates},
            }],
        }
        base = f"data/bathymetry-working/{lake_id}"
        self.manifest = {
            "schemaVersion": 1,
            "lakeId": lake_id,
            "displayName": lake_id,
            "model": "affine",
            "inputs": {
                "sourceMetadata": f"{base}/source.json",
                "gcps": f"{base}/gcps.json",
                "referenceGeometry": f"{base}/geometry.geojson",
            },
            "outputs": {
                "transformation": f"{base}/transformation.json",
                "residuals": f"{base}/residuals.csv",
                "result": f"{base}/result.json",
            },
            "qa": {"behavior": "temporary", "closeups": []},
            "candidateGate": {"policy": "pilot-v1"},
            "assessment": {
                "affineSufficient": True,
                "piecewiseTested": False,
                "piecewiseRequired": False,
                "recommendation": "proceed-to-extraction",
                "reason": "synthetic test",
            },
        }
        self.flush()

    @staticmethod
    def point(point_id, x, y, longitude, latitude, role):
        return {
            "id": point_id,
            "pixelX": x,
            "pixelY": y,
            "longitude": longitude,
            "latitude": latitude,
            "description": point_id,
            "featureClass": "test-feature",
            "role": role,
            "confidence": "high",
            "reviewNote": "synthetic",
        }

    @property
    def manifest_path(self):
        return self.directory / "job.json"

    def flush(self):
        write_json(self.directory / "source.json", self.source)
        write_json(self.directory / "gcps.json", self.gcps)
        write_json(self.directory / "geometry.geojson", self.geometry)
        write_json(self.manifest_path, self.manifest)


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.job = SyntheticJob(self.root)

    def tearDown(self):
        self.temporary.cleanup()

    def test_manifest_validation_success(self):
        validated = validate_job(self.job.manifest_path, self.root)
        self.assertEqual(validated["manifest"]["lakeId"], "synthetic-one")

    def test_malformed_manifest_rejected(self):
        self.job.manifest["schemaVersion"] = 99
        self.job.flush()
        with self.assertRaisesRegex(JobValidationError, "schemaVersion"):
            validate_job(self.job.manifest_path, self.root)

    def test_duplicate_gcp_id_rejected(self):
        self.job.gcps["gcps"][3]["id"] = "F1"
        self.job.flush()
        with self.assertRaisesRegex(JobValidationError, "unique"):
            validate_job(self.job.manifest_path, self.root)

    def test_unsupported_model_rejected(self):
        self.job.manifest["model"] = "rubber-sheet"
        self.job.flush()
        with self.assertRaisesRegex(JobValidationError, "unsupported"):
            validate_job(self.job.manifest_path, self.root)

    def test_insufficient_fit_and_holdout_rejected(self):
        self.job.gcps["gcps"] = self.job.gcps["gcps"][:2]
        self.job.flush()
        with self.assertRaisesRegex(JobValidationError, "three fit"):
            validate_job(self.job.manifest_path, self.root)
        self.job = SyntheticJob(self.root, "synthetic-two")
        self.job.gcps["gcps"] = [
            {**point, "role": "fit"} for point in self.job.gcps["gcps"]
        ]
        self.job.flush()
        with self.assertRaisesRegex(JobValidationError, "holdout"):
            validate_job(self.job.manifest_path, self.root)

    def test_polygon_without_islands_accepted(self):
        validated = validate_job(self.job.manifest_path, self.root)
        self.assertEqual(len(validated["components"]), 1)
        self.assertEqual(len(validated["components"][0]["inner"]), 0)

    def test_polygon_with_islands_accepted(self):
        job = SyntheticJob(self.root, "with-island", islands=True)
        validated = validate_job(job.manifest_path, self.root)
        self.assertEqual(len(validated["components"][0]["inner"]), 1)

    def test_multipolygon_accepted_without_collapsing_components(self):
        job = SyntheticJob(self.root, "multi", geometry_type="MultiPolygon", islands=True)
        validated = validate_job(job.manifest_path, self.root)
        self.assertEqual(validated["geometryType"], "MultiPolygon")
        self.assertEqual(len(validated["components"]), 2)

    def test_output_path_escape_and_runtime_publish_rejected(self):
        for unsafe in ("../escape.json", "public/bathymetry/fake.geojson"):
            with self.subTest(unsafe=unsafe):
                self.job.manifest["outputs"]["result"] = unsafe
                self.job.flush()
                with self.assertRaisesRegex(JobValidationError, "escapes repository|output must remain"):
                    validate_job(self.job.manifest_path, self.root)
        with self.assertRaisesRegex(ValueError, "only under"):
            require_non_runtime_output(
                self.root / "public" / "bathymetry" / "fake.geojson", self.root
            )

    def test_fit_points_affect_transform_but_holdouts_do_not(self):
        gcps = self.job.gcps["gcps"]
        _, _, _, _, project = projection(gcps)
        original = fit_affine(gcps, project)
        changed_holdout = copy.deepcopy(gcps)
        changed_holdout[-1]["longitude"] += 1
        _, _, _, _, project_holdout = projection(changed_holdout)
        np.testing.assert_allclose(original, fit_affine(changed_holdout, project_holdout))
        changed_fit = copy.deepcopy(gcps)
        changed_fit[0]["longitude"] += 0.001
        _, _, _, _, project_fit = projection(changed_fit)
        self.assertFalse(np.allclose(original, fit_affine(changed_fit, project_fit)))

    def test_repeated_outputs_are_deterministic(self):
        qa = self.root / "qa"
        run_job(self.job.manifest_path, self.job.source_path, qa, self.root, render_qa=False)
        paths = [
            self.job.directory / "transformation.json",
            self.job.directory / "residuals.csv",
            self.job.directory / "result.json",
        ]
        first = [path.read_bytes() for path in paths]
        run_job(self.job.manifest_path, self.job.source_path, qa, self.root, render_qa=False)
        self.assertEqual(first, [path.read_bytes() for path in paths])

    def test_batch_multiple_jobs_and_failed_job_reported(self):
        second = SyntheticJob(self.root, "synthetic-two")
        missing = self.root / "missing.tif"
        summary = batch_jobs(
            [
                (self.job.manifest_path, self.job.source_path),
                (second.manifest_path, second.source_path),
                (self.job.manifest_path, missing),
            ],
            self.root,
            self.root / "qa",
            render_qa=False,
        )
        self.assertEqual(summary["completedCount"], 2)
        self.assertEqual(summary["failedCount"], 1)
        self.assertEqual(summary["results"][-1]["status"], "failed")
        self.assertFalse(summary["runtimePublished"])


class KlappasjonRegressionTests(unittest.TestCase):
    repo_root = Path(__file__).resolve().parents[3]
    working = repo_root / "data" / "bathymetry-working" / "klappasjon"

    def test_committed_manifest_and_result_regression(self):
        job = validate_job(self.working / "job.json", self.repo_root)
        gcps = job["gcpsConfig"]["gcps"]
        _, _, _, _, project = projection(gcps)
        transform = fit_affine(gcps, project)
        from workflow import evaluate, statistics

        rows = evaluate(gcps, project, transform)
        self.assertEqual(statistics(rows, "fit"), {
            "count": 10,
            "meanMeters": 16.794,
            "medianMeters": 16.7,
            "maximumMeters": 31.631,
            "rmseMeters": 17.908,
            "meanVectorEastMeters": -0.0,
            "meanVectorNorthMeters": 0.0,
        })
        self.assertEqual(statistics(rows, "holdout"), {
            "count": 6,
            "meanMeters": 11.746,
            "medianMeters": 11.149,
            "maximumMeters": 16.254,
            "rmseMeters": 12.25,
            "meanVectorEastMeters": 6.173,
            "meanVectorNorthMeters": -1.874,
        })
        self.assertEqual(
            sha256(self.working / "transformation.json"),
            "a6d50e1ddea2ce660c358e51a38b0aa26f5185b29a572fda17bbb62d89d13b61",
        )
        self.assertEqual(
            sha256(self.working / "residuals.csv"),
            "ea30960cf701806580e8fdd8176958db574470d98a4ec4c6c7a9294dfea4aedd",
        )
        result = json.loads((self.working / "georeference-result.json").read_text())
        self.assertEqual(result["recommendation"], "pass-georeferencing")
        self.assertTrue(result["candidateGate"]["numericGatePassed"])
        self.assertTrue(result["humanReviewRequired"])
        self.assertFalse(result["runtimePublished"])


if __name__ == "__main__":
    unittest.main()
