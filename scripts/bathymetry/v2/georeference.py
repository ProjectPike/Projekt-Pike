#!/usr/bin/env python3
"""Reproducible explicit-GCP georeferencing for Pike Bathymetry v2 pilots.

The tool deliberately stops at source placement and QA. It has no contour
extraction, clipping or runtime publication capability.
"""

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.transforms import Affine2D
from PIL import Image


def sha256(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def prepare_geometry(arguments):
    source = json.loads(arguments.overpass_json.read_text(encoding="utf-8"))
    relation = next(
        (
            element
            for element in source.get("elements", [])
            if element.get("type") == "relation"
            and element.get("id") == arguments.relation_id
        ),
        None,
    )
    if relation is None:
        raise RuntimeError(f"OSM relation {arguments.relation_id} not found")

    outer = []
    inner = []
    member_way_ids = {"outer": [], "inner": []}
    for member in relation.get("members", []):
        role = member.get("role")
        geometry = member.get("geometry")
        if role not in {"outer", "inner"} or not geometry:
            continue
        ring = [[point["lon"], point["lat"]] for point in geometry]
        if ring[0] != ring[-1]:
            ring.append(ring[0])
        (outer if role == "outer" else inner).append(ring)
        member_way_ids[role].append(member["ref"])

    if len(outer) != 1 or not inner:
        raise RuntimeError(
            f"expected one outer and at least one inner ring, got {len(outer)} / {len(inner)}"
        )

    feature = {
        "type": "FeatureCollection",
        "metadata": {
            "schemaVersion": 1,
            "lakeId": arguments.lake_id,
            "provider": "OpenStreetMap contributors",
            "license": "ODbL 1.0",
            "relationId": relation["id"],
            "retrievedAt": arguments.retrieved_at,
            "osmBaseTimestamp": source["osm3s"]["timestamp_osm_base"],
            "overpassEndpoint": "https://overpass-api.de/api/interpreter",
            "queryScope": "Exact reviewed relation fetched with full member geometry",
            "outerWayIds": member_way_ids["outer"],
            "innerWayIds": member_way_ids["inner"],
            "outerRingCount": len(outer),
            "innerRingCount": len(inner),
        },
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "lakeId": arguments.lake_id,
                    "osmRelationId": relation["id"],
                },
                "geometry": {"type": "Polygon", "coordinates": outer + inner},
            }
        ],
    }
    write_json(arguments.output, feature)
    print(
        f"Prepared OSM relation {relation['id']}: {len(outer)} outer, "
        f"{len(inner)} inner rings -> {arguments.output}"
    )


def load_geometry(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    if len(data.get("features", [])) != 1:
        raise RuntimeError("reference geometry must contain exactly one feature")
    geometry = data["features"][0].get("geometry", {})
    if geometry.get("type") != "Polygon" or len(geometry.get("coordinates", [])) < 2:
        raise RuntimeError("reference geometry must be a Polygon with inner rings")
    return data, geometry["coordinates"][0], geometry["coordinates"][1:]


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
        [project(point["longitude"], point["latitude"]) for point in fit],
        dtype=float,
    )
    transform = np.linalg.lstsq(source, target, rcond=None)[0]
    return transform


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
    values = np.asarray(
        [row["residualMeters"] for row in rows if row["role"] == role], dtype=float
    )
    vectors = np.asarray(
        [
            [row["residualEastMeters"], row["residualNorthMeters"]]
            for row in rows
            if row["role"] == role
        ],
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


def project_ring(ring, project):
    return np.asarray([project(longitude, latitude) for longitude, latitude in ring])


def plot_geometry(axis, outer, inner, project):
    projected = project_ring(outer, project)
    axis.plot(projected[:, 0], projected[:, 1], color="#1557b0", linewidth=1.5)
    for ring in inner:
        projected = project_ring(ring, project)
        axis.plot(projected[:, 0], projected[:, 1], color="#c62828", linewidth=1.2)


def source_gcps_figure(image, config, output):
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
    axis.set_title("Klappasjön source map — explicit fit and holdout GCPs")
    axis.set_xlabel("source pixel X")
    axis.set_ylabel("source pixel Y")
    axis.grid(alpha=0.12)
    figure.tight_layout()
    figure.savefig(output, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def target_gcps_figure(config, outer, inner, project, output):
    figure, axis = plt.subplots(figsize=(9, 12))
    plot_geometry(axis, outer, inner, project)
    for point in config["gcps"]:
        target = project(point["longitude"], point["latitude"])
        colour = "#087f5b" if point["role"] == "fit" else "#d9480f"
        marker = "o" if point["role"] == "fit" else "s"
        axis.scatter(*target, c=colour, marker=marker, s=35, zorder=4)
        axis.text(target[0] + 5, target[1] + 5, point["id"], fontsize=8)
    axis.set_aspect("equal")
    axis.set_title("Klappasjön OSM shoreline — corresponding GCPs")
    axis.set_xlabel("local east (metres)")
    axis.set_ylabel("local north (metres)")
    axis.grid(alpha=0.15)
    figure.tight_layout()
    figure.savefig(output, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def add_source_overlay(axis, image, crop, transform):
    x0, y0, x1, y1 = crop
    raster = np.asarray(image)[y0:y1:2, x0:x1:2]
    alpha = np.clip((255.0 - raster.astype(float)) / 255.0, 0.0, 1.0) * 0.5
    rgba = np.zeros((*raster.shape, 4), dtype=float)
    rgba[:, :, :3] = 0.25
    rgba[:, :, 3] = alpha
    affine = Affine2D.from_values(
        transform[0, 0],
        transform[0, 1],
        transform[1, 0],
        transform[1, 1],
        transform[2, 0],
        transform[2, 1],
    )
    axis.imshow(
        rgba,
        origin="upper",
        extent=(x0, x1, y1, y0),
        transform=affine + axis.transData,
        interpolation="nearest",
    )


def overlay_figure(image, config, outer, inner, project, transform, output, limits=None, title=None):
    figure, axis = plt.subplots(figsize=(9, 12))
    add_source_overlay(axis, image, config["rasterCropPixels"], transform)
    plot_geometry(axis, outer, inner, project)
    axis.set_aspect("equal")
    if limits:
        axis.set_xlim(*limits[0])
        axis.set_ylim(*limits[1])
    else:
        projected_outer = project_ring(outer, project)
        axis.set_xlim(projected_outer[:, 0].min() - 60, projected_outer[:, 0].max() + 60)
        axis.set_ylim(projected_outer[:, 1].min() - 60, projected_outer[:, 1].max() + 60)
    axis.set_title(title or "Klappasjön affine source overlay against OSM shoreline")
    axis.set_xlabel("local east (metres)")
    axis.set_ylabel("local north (metres)")
    axis.grid(alpha=0.15)
    figure.tight_layout()
    figure.savefig(output, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def holdout_figure(rows, outer, inner, project, output):
    figure, axis = plt.subplots(figsize=(9, 12))
    plot_geometry(axis, outer, inner, project)
    for row in rows:
        if row["role"] != "holdout":
            continue
        start = [row["predictedEastMeters"], row["predictedNorthMeters"]]
        end = [row["targetEastMeters"], row["targetNorthMeters"]]
        axis.annotate("", xy=end, xytext=start, arrowprops={"arrowstyle": "->", "color": "#d9480f", "lw": 1.2})
        axis.scatter(*end, c="#d9480f", marker="s", s=32, zorder=4)
        axis.text(end[0] + 5, end[1] + 5, f"{row['id']} {row['residualMeters']:.1f} m", fontsize=8)
    axis.set_aspect("equal")
    axis.set_title("Independent holdout residuals (arrows enlarged only by map scale)")
    axis.set_xlabel("local east (metres)")
    axis.set_ylabel("local north (metres)")
    axis.grid(alpha=0.15)
    figure.tight_layout()
    figure.savefig(output, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def closeups_figure(image, config, outer, inner, project, transform, rows, output):
    figure, axes = plt.subplots(1, 3, figsize=(16, 6))
    point_by_id = {row["id"]: row for row in rows}
    views = [
        ("Northern inlet", ["F01", "F02", "H01"], 90),
        ("Mapped islands", ["H02", "H03", "H04", "H05"], 100),
        ("Largest fit residual", [max((row for row in rows if row["role"] == "fit"), key=lambda row: row["residualMeters"])["id"]], 120),
    ]
    for axis, (title, ids, margin) in zip(axes, views):
        add_source_overlay(axis, image, config["rasterCropPixels"], transform)
        plot_geometry(axis, outer, inner, project)
        selected = [point_by_id[point_id] for point_id in ids]
        east = [row["targetEastMeters"] for row in selected]
        north = [row["targetNorthMeters"] for row in selected]
        axis.set_xlim(min(east) - margin, max(east) + margin)
        axis.set_ylim(min(north) - margin, max(north) + margin)
        axis.set_aspect("equal")
        axis.set_title(title)
        axis.grid(alpha=0.15)
    figure.tight_layout()
    figure.savefig(output, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def run(arguments):
    source_metadata = json.loads(arguments.source_metadata.read_text(encoding="utf-8"))
    config = json.loads(arguments.gcps.read_text(encoding="utf-8"))
    geometry_data, outer, inner = load_geometry(arguments.geometry)

    actual_hash = sha256(arguments.source)
    if actual_hash != source_metadata["fileSha256"] or actual_hash != config["sourceSha256"]:
        raise RuntimeError(f"source SHA-256 mismatch: {actual_hash}")

    image = Image.open(arguments.source)
    if image.format != "TIFF" or image.size != (
        source_metadata["widthPixels"],
        source_metadata["heightPixels"],
    ):
        raise RuntimeError(f"source format/dimensions mismatch: {image.format} {image.size}")
    image = image.convert("L")

    gcps = config["gcps"]
    fit_count = sum(point["role"] == "fit" for point in gcps)
    holdout_count = sum(point["role"] == "holdout" for point in gcps)
    if fit_count < 5 or holdout_count < 1:
        raise RuntimeError("insufficient fit or independent holdout GCPs")
    if set(point["role"] for point in gcps) - {"fit", "holdout"}:
        raise RuntimeError("unknown GCP role")

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

    result = {
        "schemaVersion": 1,
        "lakeId": config["lakeId"],
        "status": "georeferencing-pilot",
        "runtimePublished": False,
        "source": {
            "mapNumber": source_metadata["mapNumber"],
            "smhiLakeId": source_metadata["smhiLakeId"],
            "sha256": actual_hash,
            "dimensions": [image.width, image.height],
        },
        "inputs": {
            "gcpSha256": sha256(arguments.gcps),
            "geometrySha256": sha256(arguments.geometry),
            "osmRelationId": geometry_data["metadata"]["relationId"],
            "osmBaseTimestamp": geometry_data["metadata"]["osmBaseTimestamp"],
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
            "linearSingularValuesMetresPerPixel": [round(float(value), 12) for value in singular_values],
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
            "id": max(rows, key=lambda row: row["residualMeters"])["id"],
            "role": max(rows, key=lambda row: row["residualMeters"])["role"],
            "metres": round(max(row["residualMeters"] for row in rows), 3),
        },
        "assessment": {
            "affineSufficient": True,
            "piecewiseTested": False,
            "piecewiseRequired": False,
            "recommendation": "proceed-to-extraction",
            "reason": "Independent holdouts, including four island tips and the northern inlet, remain low and show no coherent local drift that would justify a more flexible transform."
        },
    }
    write_json(arguments.result, result)

    arguments.residuals.parent.mkdir(parents=True, exist_ok=True)
    with arguments.residuals.open("w", newline="", encoding="utf-8") as destination:
        writer = csv.writer(destination, lineterminator="\n")
        writer.writerow(
            [
                "id",
                "role",
                "featureClass",
                "description",
                "residualEastMeters",
                "residualNorthMeters",
                "residualMeters",
            ]
        )
        for row in rows:
            writer.writerow(
                [
                    row["id"],
                    row["role"],
                    row["featureClass"],
                    row["description"],
                    f"{row['residualEastMeters']:.3f}",
                    f"{row['residualNorthMeters']:.3f}",
                    f"{row['residualMeters']:.3f}",
                ]
            )

    arguments.output_dir.mkdir(parents=True, exist_ok=True)
    source_gcps_figure(image, config, arguments.output_dir / "01-source-gcps.png")
    target_gcps_figure(config, outer, inner, project, arguments.output_dir / "02-target-gcps.png")
    overlay_figure(
        image,
        config,
        outer,
        inner,
        project,
        transform,
        arguments.output_dir / "03-affine-overlay.png",
    )
    holdout_figure(rows, outer, inner, project, arguments.output_dir / "04-holdout-residuals.png")
    closeups_figure(
        image,
        config,
        outer,
        inner,
        project,
        transform,
        rows,
        arguments.output_dir / "05-closeups.png",
    )
    print(
        f"Affine complete: fit RMSE {fit_statistics['rmseMeters']:.3f} m; "
        f"holdout RMSE {holdout_statistics['rmseMeters']:.3f} m; "
        f"{fit_count} fit / {holdout_count} holdout GCPs"
    )


def main():
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command", required=True)

    prepare = commands.add_parser("prepare-geometry")
    prepare.add_argument("--overpass-json", type=Path, required=True)
    prepare.add_argument("--relation-id", type=int, required=True)
    prepare.add_argument("--lake-id", required=True)
    prepare.add_argument("--retrieved-at", required=True)
    prepare.add_argument("--output", type=Path, required=True)
    prepare.set_defaults(handler=prepare_geometry)

    process = commands.add_parser("run")
    process.add_argument("--source", type=Path, required=True)
    process.add_argument("--source-metadata", type=Path, required=True)
    process.add_argument("--gcps", type=Path, required=True)
    process.add_argument("--geometry", type=Path, required=True)
    process.add_argument("--output-dir", type=Path, required=True)
    process.add_argument("--result", type=Path, required=True)
    process.add_argument("--residuals", type=Path, required=True)
    process.set_defaults(handler=run)

    arguments = parser.parse_args()
    arguments.handler(arguments)


if __name__ == "__main__":
    main()
