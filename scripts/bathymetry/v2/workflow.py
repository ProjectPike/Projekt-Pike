"""Manifest-driven Bathymetry v2 affine georeferencing workflow.

This module stops at source placement and QA. It deliberately has no contour
extraction, clipping, ledger mutation, or runtime publication capability.
"""

from __future__ import annotations

import csv
import hashlib
import json
import math
import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.transforms import Affine2D
from PIL import Image


SUPPORTED_SCHEMA_VERSION = 1
SUPPORTED_MODEL = "affine"
APPROVED_WORKING_ROOT = Path("data/bathymetry-working")
LAKE_ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
PILOT_V1_GATE = {
    "minimumFitCount": 8,
    "minimumHoldoutCount": 4,
    "maximumHoldoutRmseMeters": 25.0,
    "maximumHoldoutResidualMeters": 50.0,
}


class JobValidationError(ValueError):
    """Raised when a job is unsafe or structurally invalid."""


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def _repository_path(repo_root: Path, value: str, *, must_exist: bool) -> Path:
    relative = Path(value)
    if relative.is_absolute():
        raise JobValidationError(f"committed path must be repository-relative: {value}")
    resolved_root = repo_root.resolve()
    resolved = (resolved_root / relative).resolve()
    if not resolved.is_relative_to(resolved_root):
        raise JobValidationError(f"path escapes repository: {value}")
    if must_exist and not resolved.is_file():
        raise JobValidationError(f"referenced file does not exist: {value}")
    return resolved


def _output_path(repo_root: Path, lake_id: str, value: str) -> Path:
    resolved = _repository_path(repo_root, value, must_exist=False)
    approved = (repo_root.resolve() / APPROVED_WORKING_ROOT / lake_id).resolve()
    if not resolved.is_relative_to(approved):
        raise JobValidationError(
            f"output must remain inside {APPROVED_WORKING_ROOT / lake_id}: {value}"
        )
    return resolved


def _finite_number(value, label: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise JobValidationError(f"{label} must be numeric")
    result = float(value)
    if not math.isfinite(result):
        raise JobValidationError(f"{label} must be finite")
    return result


def _validate_ring(ring, label: str) -> None:
    if not isinstance(ring, list) or len(ring) < 4:
        raise JobValidationError(f"{label} must contain at least four coordinates")
    for index, coordinate in enumerate(ring):
        if not isinstance(coordinate, list) or len(coordinate) < 2:
            raise JobValidationError(f"{label}[{index}] is not a coordinate")
        _finite_number(coordinate[0], f"{label}[{index}].longitude")
        _finite_number(coordinate[1], f"{label}[{index}].latitude")


def geometry_components(geometry_data):
    features = geometry_data.get("features")
    if not isinstance(features, list) or len(features) != 1:
        raise JobValidationError("reference geometry must contain exactly one feature")
    geometry = features[0].get("geometry", {})
    geometry_type = geometry.get("type")
    coordinates = geometry.get("coordinates")
    if geometry_type == "Polygon":
        polygons = [coordinates]
    elif geometry_type == "MultiPolygon":
        polygons = coordinates
    else:
        raise JobValidationError("reference geometry must be Polygon or MultiPolygon")
    if not isinstance(polygons, list) or not polygons:
        raise JobValidationError("reference geometry has no polygon components")

    components = []
    for polygon_index, polygon in enumerate(polygons):
        if not isinstance(polygon, list) or not polygon:
            raise JobValidationError(f"polygon {polygon_index} has no outer ring")
        for ring_index, ring in enumerate(polygon):
            _validate_ring(ring, f"polygon[{polygon_index}].ring[{ring_index}]")
        components.append({"outer": polygon[0], "inner": polygon[1:]})
    return geometry_type, components


def topology_summary(geometry_type: str, components) -> dict:
    return {
        "geometryType": geometry_type,
        "componentCount": len(components),
        "outerRingCount": len(components),
        "innerRingCount": sum(len(component["inner"]) for component in components),
    }


def validate_job(manifest_path: Path, repo_root: Path) -> dict:
    manifest = read_json(manifest_path)
    if manifest.get("schemaVersion") != SUPPORTED_SCHEMA_VERSION:
        raise JobValidationError("unsupported job schemaVersion")
    lake_id = manifest.get("lakeId")
    if not isinstance(lake_id, str) or not LAKE_ID_PATTERN.fullmatch(lake_id):
        raise JobValidationError("invalid lakeId")
    if manifest.get("model") != SUPPORTED_MODEL:
        raise JobValidationError("unsupported transformation model")

    inputs = manifest.get("inputs")
    outputs = manifest.get("outputs")
    if not isinstance(inputs, dict) or not isinstance(outputs, dict):
        raise JobValidationError("job must define inputs and outputs")
    input_paths = {
        key: _repository_path(repo_root, inputs.get(key, ""), must_exist=True)
        for key in ("sourceMetadata", "gcps", "referenceGeometry")
    }
    output_paths = {
        key: _output_path(repo_root, lake_id, outputs.get(key, ""))
        for key in ("transformation", "residuals", "result")
    }

    source = read_json(input_paths["sourceMetadata"])
    gcps_config = read_json(input_paths["gcps"])
    geometry = read_json(input_paths["referenceGeometry"])
    if source.get("lakeId") != lake_id or gcps_config.get("lakeId") != lake_id:
        raise JobValidationError("lakeId differs between job, source metadata, or GCPs")
    if geometry.get("metadata", {}).get("lakeId") != lake_id:
        raise JobValidationError("reference geometry lakeId differs from job")
    feature_lake_id = geometry.get("features", [{}])[0].get("properties", {}).get("lakeId")
    if feature_lake_id not in (None, lake_id):
        raise JobValidationError("reference geometry feature lakeId differs from job")
    if source.get("mapNumber") != gcps_config.get("sourceMapNumber"):
        raise JobValidationError("source map identity differs between metadata and GCPs")
    if source.get("fileSha256") != gcps_config.get("sourceSha256"):
        raise JobValidationError("source hash differs between metadata and GCPs")
    if gcps_config.get("transformCandidate") != SUPPORTED_MODEL:
        raise JobValidationError("GCP transformCandidate is unsupported or differs from job")

    reference = gcps_config.get("referenceGeometry", {})
    geometry_metadata = geometry.get("metadata", {})
    if reference.get("relationId") is not None and (
        reference.get("relationId") != geometry_metadata.get("relationId")
    ):
        raise JobValidationError("reference geometry identity differs between GCPs and snapshot")

    gcps = gcps_config.get("gcps")
    if not isinstance(gcps, list):
        raise JobValidationError("gcps must be an array")
    ids = []
    for index, point in enumerate(gcps):
        point_id = point.get("id")
        if not isinstance(point_id, str) or not point_id:
            raise JobValidationError(f"GCP {index} has no stable ID")
        ids.append(point_id)
        if point.get("role") not in {"fit", "holdout"}:
            raise JobValidationError(f"GCP {point_id} has invalid role")
        for field in ("pixelX", "pixelY", "longitude", "latitude"):
            _finite_number(point.get(field), f"GCP {point_id}.{field}")
        for field in ("description", "featureClass"):
            if not isinstance(point.get(field), str) or not point[field]:
                raise JobValidationError(f"GCP {point_id}.{field} is required")
    if len(ids) != len(set(ids)):
        raise JobValidationError("GCP IDs must be unique; a point cannot be fit and holdout")
    fit = [point for point in gcps if point["role"] == "fit"]
    holdout = [point for point in gcps if point["role"] == "holdout"]
    if len(fit) < 3:
        raise JobValidationError("affine fitting requires at least three fit GCPs")
    design = np.asarray(
        [[point["pixelX"], point["pixelY"], 1.0] for point in fit], dtype=float
    )
    if np.linalg.matrix_rank(design) < 3:
        raise JobValidationError("fit GCPs do not constrain a two-dimensional affine model")
    if not holdout:
        raise JobValidationError("at least one independent holdout GCP is required")

    geometry_type, components = geometry_components(geometry)
    qa = manifest.get("qa", {})
    if qa.get("behavior") != "temporary":
        raise JobValidationError("qa.behavior must be temporary")
    for view in qa.get("closeups", []):
        if not isinstance(view.get("title"), str) or not view["title"]:
            raise JobValidationError("each QA closeup needs a title")
        point_ids = view.get("pointIds")
        if not isinstance(point_ids, list) or not point_ids:
            raise JobValidationError("each QA closeup needs pointIds")
        if set(point_ids) - set(ids):
            raise JobValidationError("QA closeup references unknown GCP ID")
        _finite_number(view.get("marginMeters"), "QA closeup marginMeters")

    gate = manifest.get("candidateGate")
    if gate not in (None, {"policy": "pilot-v1"}):
        raise JobValidationError("unsupported candidate gate policy")

    return {
        "manifest": manifest,
        "sourceMetadata": source,
        "gcpsConfig": gcps_config,
        "geometryData": geometry,
        "geometryType": geometry_type,
        "components": components,
        "inputPaths": input_paths,
        "outputPaths": output_paths,
    }


def projection(gcps):
    fit = [point for point in gcps if point["role"] == "fit"]
    longitude_origin = float(np.mean([point["longitude"] for point in fit]))
    latitude_origin = float(np.mean([point["latitude"] for point in fit]))
    longitude_scale = 111320.0 * math.cos(math.radians(latitude_origin))
    latitude_scale = 110540.0

    def project(longitude, latitude):
        return np.asarray(
            [
                (longitude - longitude_origin) * longitude_scale,
                (latitude - latitude_origin) * latitude_scale,
            ],
            dtype=float,
        )

    return longitude_origin, latitude_origin, longitude_scale, latitude_scale, project


def fit_affine(gcps, project):
    fit = [point for point in gcps if point["role"] == "fit"]
    source = np.asarray(
        [[point["pixelX"], point["pixelY"], 1.0] for point in fit], dtype=float
    )
    target = np.asarray(
        [project(point["longitude"], point["latitude"]) for point in fit], dtype=float
    )
    return np.linalg.lstsq(source, target, rcond=None)[0]


def evaluate(gcps, project, transform):
    rows = []
    for point in gcps:
        target = project(point["longitude"], point["latitude"])
        predicted = np.asarray(
            [point["pixelX"], point["pixelY"], 1.0], dtype=float
        ) @ transform
        delta = predicted - target
        rows.append(
            {
                "id": point["id"],
                "role": point["role"],
                "featureClass": point["featureClass"],
                "description": point["description"],
                "residualEastMeters": float(delta[0]),
                "residualNorthMeters": float(delta[1]),
                "residualMeters": float(np.linalg.norm(delta)),
                "predictedEastMeters": float(predicted[0]),
                "predictedNorthMeters": float(predicted[1]),
                "targetEastMeters": float(target[0]),
                "targetNorthMeters": float(target[1]),
            }
        )
    return rows


def statistics(rows, role):
    selected = [row for row in rows if row["role"] == role]
    values = np.asarray([row["residualMeters"] for row in selected], dtype=float)
    vectors = np.asarray(
        [[row["residualEastMeters"], row["residualNorthMeters"]] for row in selected],
        dtype=float,
    )
    return {
        "count": int(len(values)),
        "meanMeters": round(float(np.mean(values)), 3),
        "medianMeters": round(float(np.median(values)), 3),
        "maximumMeters": round(float(np.max(values)), 3),
        "rmseMeters": round(float(np.sqrt(np.mean(values**2))), 3),
        "meanVectorEastMeters": round(float(np.mean(vectors[:, 0])), 3),
        "meanVectorNorthMeters": round(float(np.mean(vectors[:, 1])), 3),
    }


def _project_ring(ring, project):
    return np.asarray([project(longitude, latitude) for longitude, latitude in ring])


def _plot_geometry(axis, components, project):
    for component in components:
        projected = _project_ring(component["outer"], project)
        axis.plot(projected[:, 0], projected[:, 1], color="#1557b0", linewidth=1.5)
        for ring in component["inner"]:
            projected = _project_ring(ring, project)
            axis.plot(projected[:, 0], projected[:, 1], color="#c62828", linewidth=1.2)


def _source_gcps_figure(image, config, display_name, output):
    crop = config["rasterCropPixels"]
    figure, axis = plt.subplots(figsize=(10, 13))
    axis.imshow(image, cmap="gray", origin="upper")
    axis.set_xlim(crop[0], crop[2])
    axis.set_ylim(crop[3], crop[1])
    for point in config["gcps"]:
        colour = "#087f5b" if point["role"] == "fit" else "#d9480f"
        marker = "o" if point["role"] == "fit" else "s"
        axis.scatter(point["pixelX"], point["pixelY"], c=colour, marker=marker, s=35)
        axis.text(point["pixelX"] + 18, point["pixelY"] - 18, point["id"], fontsize=8)
    axis.set_title(f"{display_name} source map — explicit fit and holdout GCPs")
    axis.set_xlabel("source pixel X")
    axis.set_ylabel("source pixel Y")
    axis.grid(alpha=0.12)
    figure.tight_layout()
    figure.savefig(output, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def _target_gcps_figure(config, components, project, display_name, output):
    figure, axis = plt.subplots(figsize=(9, 12))
    _plot_geometry(axis, components, project)
    for point in config["gcps"]:
        target = project(point["longitude"], point["latitude"])
        colour = "#087f5b" if point["role"] == "fit" else "#d9480f"
        marker = "o" if point["role"] == "fit" else "s"
        axis.scatter(*target, c=colour, marker=marker, s=35, zorder=4)
        axis.text(target[0] + 5, target[1] + 5, point["id"], fontsize=8)
    axis.set_aspect("equal")
    axis.set_title(f"{display_name} reference geometry — corresponding GCPs")
    axis.set_xlabel("local east (metres)")
    axis.set_ylabel("local north (metres)")
    axis.grid(alpha=0.15)
    figure.tight_layout()
    figure.savefig(output, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def _add_source_overlay(axis, image, crop, transform):
    x0, y0, x1, y1 = crop
    raster = np.asarray(image)[y0:y1:2, x0:x1:2]
    alpha = np.clip((255.0 - raster.astype(float)) / 255.0, 0.0, 1.0) * 0.5
    rgba = np.zeros((*raster.shape, 4), dtype=float)
    rgba[:, :, :3] = 0.25
    rgba[:, :, 3] = alpha
    affine = Affine2D.from_values(
        transform[0, 0], transform[0, 1], transform[1, 0],
        transform[1, 1], transform[2, 0], transform[2, 1]
    )
    axis.imshow(
        rgba, origin="upper", extent=(x0, x1, y1, y0),
        transform=affine + axis.transData, interpolation="nearest"
    )


def _geometry_limits(components, project, margin=60):
    projected = np.concatenate(
        [_project_ring(component["outer"], project) for component in components]
    )
    return (
        (projected[:, 0].min() - margin, projected[:, 0].max() + margin),
        (projected[:, 1].min() - margin, projected[:, 1].max() + margin),
    )


def _overlay_figure(image, config, components, project, transform, display_name, output):
    figure, axis = plt.subplots(figsize=(9, 12))
    _add_source_overlay(axis, image, config["rasterCropPixels"], transform)
    _plot_geometry(axis, components, project)
    x_limits, y_limits = _geometry_limits(components, project)
    axis.set_xlim(*x_limits)
    axis.set_ylim(*y_limits)
    axis.set_aspect("equal")
    axis.set_title(f"{display_name} affine source overlay against reference geometry")
    axis.set_xlabel("local east (metres)")
    axis.set_ylabel("local north (metres)")
    axis.grid(alpha=0.15)
    figure.tight_layout()
    figure.savefig(output, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def _holdout_figure(rows, components, project, output):
    figure, axis = plt.subplots(figsize=(9, 12))
    _plot_geometry(axis, components, project)
    for row in rows:
        if row["role"] != "holdout":
            continue
        start = [row["predictedEastMeters"], row["predictedNorthMeters"]]
        end = [row["targetEastMeters"], row["targetNorthMeters"]]
        axis.annotate(
            "", xy=end, xytext=start,
            arrowprops={"arrowstyle": "->", "color": "#d9480f", "lw": 1.2}
        )
        axis.scatter(*end, c="#d9480f", marker="s", s=32, zorder=4)
        axis.text(end[0] + 5, end[1] + 5, f"{row['id']} {row['residualMeters']:.1f} m", fontsize=8)
    axis.set_aspect("equal")
    axis.set_title("Independent holdout residuals")
    axis.set_xlabel("local east (metres)")
    axis.set_ylabel("local north (metres)")
    axis.grid(alpha=0.15)
    figure.tight_layout()
    figure.savefig(output, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def _closeups_figure(image, config, components, project, transform, rows, views, output):
    figure, axes = plt.subplots(1, len(views), figsize=(5.4 * len(views), 6))
    if len(views) == 1:
        axes = [axes]
    point_by_id = {row["id"]: row for row in rows}
    for axis, view in zip(axes, views):
        _add_source_overlay(axis, image, config["rasterCropPixels"], transform)
        _plot_geometry(axis, components, project)
        selected = [point_by_id[point_id] for point_id in view["pointIds"]]
        east = [row["targetEastMeters"] for row in selected]
        north = [row["targetNorthMeters"] for row in selected]
        margin = view["marginMeters"]
        axis.set_xlim(min(east) - margin, max(east) + margin)
        axis.set_ylim(min(north) - margin, max(north) + margin)
        axis.set_aspect("equal")
        axis.set_title(view["title"])
        axis.grid(alpha=0.15)
    figure.tight_layout()
    figure.savefig(output, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def _write_residuals(path: Path, rows) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as destination:
        writer = csv.writer(destination, lineterminator="\n")
        writer.writerow([
            "id", "role", "featureClass", "description", "residualEastMeters",
            "residualNorthMeters", "residualMeters",
        ])
        for row in rows:
            writer.writerow([
                row["id"], row["role"], row["featureClass"], row["description"],
                f"{row['residualEastMeters']:.3f}",
                f"{row['residualNorthMeters']:.3f}",
                f"{row['residualMeters']:.3f}",
            ])


def _numeric_gate(policy, fit_statistics, holdout_statistics):
    if policy is None:
        return None
    checks = {
        "minimumFitCount": fit_statistics["count"] >= PILOT_V1_GATE["minimumFitCount"],
        "minimumHoldoutCount": holdout_statistics["count"] >= PILOT_V1_GATE["minimumHoldoutCount"],
        "maximumHoldoutRmseMeters": holdout_statistics["rmseMeters"] <= PILOT_V1_GATE["maximumHoldoutRmseMeters"],
        "maximumHoldoutResidualMeters": holdout_statistics["maximumMeters"] <= PILOT_V1_GATE["maximumHoldoutResidualMeters"],
    }
    return {
        "policy": "pilot-v1",
        "meaning": "candidate screening for the next bathymetry stage; not publication approval",
        "criteria": PILOT_V1_GATE,
        "checks": checks,
        "numericGatePassed": all(checks.values()),
        "humanReviewRequired": True,
    }


def run_job(
    manifest_path: Path,
    source_path: Path,
    qa_output: Path,
    repo_root: Path,
    *,
    render_qa: bool = True,
) -> dict:
    job = validate_job(manifest_path, repo_root)
    manifest = job["manifest"]
    source_metadata = job["sourceMetadata"]
    config = job["gcpsConfig"]
    actual_hash = sha256(source_path)
    if actual_hash != source_metadata["fileSha256"] or actual_hash != config["sourceSha256"]:
        raise JobValidationError(f"source SHA-256 mismatch: {actual_hash}")

    with Image.open(source_path) as opened_image:
        if opened_image.format != source_metadata["format"] or opened_image.size != (
            source_metadata["widthPixels"], source_metadata["heightPixels"]
        ):
            raise JobValidationError(
                f"source format/dimensions mismatch: {opened_image.format} {opened_image.size}"
            )
        image = opened_image.convert("L")

    gcps = config["gcps"]
    lon0, lat0, lon_scale, lat_scale, project = projection(gcps)
    transform = fit_affine(gcps, project)
    rows = evaluate(gcps, project, transform)
    fit_statistics = statistics(rows, "fit")
    holdout_statistics = statistics(rows, "holdout")
    longitude_coefficients = [
        transform[0, 0] / lon_scale,
        transform[1, 0] / lon_scale,
        lon0 + transform[2, 0] / lon_scale,
    ]
    latitude_coefficients = [
        transform[0, 1] / lat_scale,
        transform[1, 1] / lat_scale,
        lat0 + transform[2, 1] / lat_scale,
    ]
    singular_values = np.linalg.svd(transform[:2, :], compute_uv=False)
    largest = max(rows, key=lambda row: row["residualMeters"])
    geometry_metadata = job["geometryData"].get("metadata", {})

    transformation = {
        "schemaVersion": 1,
        "lakeId": manifest["lakeId"],
        "status": "georeferencing-pilot",
        "runtimePublished": False,
        "source": {
            "mapNumber": source_metadata["mapNumber"],
            "smhiLakeId": source_metadata["smhiLakeId"],
            "sha256": actual_hash,
            "dimensions": [image.width, image.height],
        },
        "inputs": {
            "gcpSha256": sha256(job["inputPaths"]["gcps"]),
            "geometrySha256": sha256(job["inputPaths"]["referenceGeometry"]),
            "osmRelationId": geometry_metadata.get("relationId"),
            "osmBaseTimestamp": geometry_metadata.get("osmBaseTimestamp"),
        },
        "model": "affine",
        "projection": {
            "description": "Local equirectangular metres for fitting and residuals",
            "longitudeOrigin": round(lon0, 12),
            "latitudeOrigin": round(lat0, 12),
            "metresPerLongitudeDegree": round(lon_scale, 12),
            "metresPerLatitudeDegree": lat_scale,
        },
        "affineLocalMetres": {
            "equation": "[pixelX, pixelY, 1] × matrix = [eastMetres, northMetres]",
            "matrix": [[round(float(value), 12) for value in row] for row in transform],
            "linearSingularValuesMetresPerPixel": [
                round(float(value), 12) for value in singular_values
            ],
            "linearDeterminant": round(float(np.linalg.det(transform[:2, :])), 12),
        },
        "affineLongitudeLatitude": {
            "longitudeEquation": "a*pixelX + b*pixelY + c",
            "longitudeCoefficients": [round(float(value), 15) for value in longitude_coefficients],
            "latitudeEquation": "d*pixelX + e*pixelY + f",
            "latitudeCoefficients": [round(float(value), 15) for value in latitude_coefficients],
        },
        "fitResiduals": fit_statistics,
        "holdoutResiduals": holdout_statistics,
        "largestResidual": {
            "id": largest["id"],
            "role": largest["role"],
            "metres": round(largest["residualMeters"], 3),
        },
        "assessment": manifest["assessment"],
    }
    write_json(job["outputPaths"]["transformation"], transformation)
    _write_residuals(job["outputPaths"]["residuals"], rows)

    gate = _numeric_gate(manifest.get("candidateGate"), fit_statistics, holdout_statistics)
    recommendation = (
        "pass-georeferencing"
        if manifest["assessment"].get("affineSufficient") is True
        and (gate is None or gate["numericGatePassed"])
        else "needs-review"
    )
    result = {
        "schemaVersion": 1,
        "lakeId": manifest["lakeId"],
        "runtimePublished": False,
        "source": {
            "mapNumber": source_metadata["mapNumber"],
            "sha256": actual_hash,
        },
        "model": "affine",
        "fitCount": fit_statistics["count"],
        "holdoutCount": holdout_statistics["count"],
        "transformCoefficients": transformation["affineLocalMetres"]["matrix"],
        "fitResiduals": fit_statistics,
        "holdoutResiduals": holdout_statistics,
        "largestResidual": transformation["largestResidual"],
        "geometryTopology": topology_summary(job["geometryType"], job["components"]),
        "candidateGate": gate,
        "humanReviewRequired": True,
        "recommendation": recommendation,
        "publicationImplication": "none",
    }
    write_json(job["outputPaths"]["result"], result)

    if render_qa:
        qa_output.mkdir(parents=True, exist_ok=True)
        display_name = manifest.get("displayName", manifest["lakeId"])
        _source_gcps_figure(image, config, display_name, qa_output / "01-source-gcps.png")
        _target_gcps_figure(
            config, job["components"], project, display_name,
            qa_output / "02-target-gcps.png"
        )
        _overlay_figure(
            image, config, job["components"], project, transform, display_name,
            qa_output / "03-affine-overlay.png"
        )
        _holdout_figure(
            rows, job["components"], project, qa_output / "04-holdout-residuals.png"
        )
        views = manifest.get("qa", {}).get("closeups", [])
        if views:
            _closeups_figure(
                image, config, job["components"], project, transform, rows, views,
                qa_output / "05-closeups.png"
            )
    return result


def batch_jobs(jobs, repo_root: Path, qa_root: Path, *, render_qa: bool = True) -> dict:
    results = []
    for manifest_path, source_path in jobs:
        lake_id = "unknown"
        try:
            raw_manifest = read_json(manifest_path)
            lake_id = raw_manifest.get("lakeId", "unknown")
            result = run_job(
                manifest_path, source_path, qa_root / lake_id, repo_root,
                render_qa=render_qa,
            )
            results.append({
                "lakeId": lake_id,
                "status": "completed",
                "fitRmseMeters": result["fitResiduals"]["rmseMeters"],
                "holdoutRmseMeters": result["holdoutResiduals"]["rmseMeters"],
                "holdoutMaximumMeters": result["holdoutResiduals"]["maximumMeters"],
                "numericGatePassed": (
                    result["candidateGate"]["numericGatePassed"]
                    if result["candidateGate"] is not None else None
                ),
                "recommendation": result["recommendation"],
            })
        except Exception as error:  # deterministic per-job failure reporting
            results.append({
                "lakeId": lake_id,
                "status": "failed",
                "errorType": type(error).__name__,
                "error": str(error),
            })
    return {
        "schemaVersion": 1,
        "policy": "continue-all-and-report; nonzero CLI exit when any job fails",
        "jobCount": len(results),
        "completedCount": sum(item["status"] == "completed" for item in results),
        "failedCount": sum(item["status"] == "failed" for item in results),
        "results": results,
        "runtimePublished": False,
    }
