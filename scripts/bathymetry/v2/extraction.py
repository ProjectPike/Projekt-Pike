#!/usr/bin/env python3
"""Reviewed line-art contour extraction for Pike Bathymetry v2 candidates.

The adapter follows source ink through reviewed waypoint corridors, applies an
already accepted affine transform, and clips only after transformation. It has
no publication or runtime-data write path.
"""

from __future__ import annotations

import argparse
import hashlib
import heapq
import json
import math
import sys
from collections import defaultdict
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

from workflow import JobValidationError, geometry_components, read_json, sha256, write_json


ADAPTER = "reviewed-waypoint-line-art-v1"
SCHEMA_VERSION = 1
WORKING_ROOT = Path("data/bathymetry-working")


def _repo_path(repo_root: Path, value: str, *, exists: bool) -> Path:
    relative = Path(value)
    if relative.is_absolute():
        raise JobValidationError(f"committed path must be repository-relative: {value}")
    root = repo_root.resolve()
    resolved = (root / relative).resolve()
    if not resolved.is_relative_to(root):
        raise JobValidationError(f"path escapes repository: {value}")
    if exists and not resolved.is_file():
        raise JobValidationError(f"referenced file does not exist: {value}")
    return resolved


def _result_path(repo_root: Path, lake_id: str, value: str) -> Path:
    path = _repo_path(repo_root, value, exists=False)
    approved = (repo_root.resolve() / WORKING_ROOT / lake_id).resolve()
    if not path.is_relative_to(approved):
        raise JobValidationError(f"result path must remain inside {WORKING_ROOT / lake_id}")
    return path


def require_temporary_output(path: Path, repo_root: Path) -> None:
    resolved = path.resolve()
    root = repo_root.resolve()
    if resolved.is_relative_to(root):
        allowed = (root / WORKING_ROOT).resolve()
        if not resolved.is_relative_to(allowed):
            raise JobValidationError(
                "temporary extraction output inside the repository is allowed only under "
                "data/bathymetry-working"
            )


def _number(value, label):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise JobValidationError(f"{label} must be numeric")
    result = float(value)
    if not math.isfinite(result):
        raise JobValidationError(f"{label} must be finite")
    return result


def validate_manifest(manifest_path: Path, repo_root: Path) -> dict:
    manifest = read_json(manifest_path)
    if manifest.get("schemaVersion") != SCHEMA_VERSION:
        raise JobValidationError("unsupported extraction schemaVersion")
    lake_id = manifest.get("lakeId")
    if not isinstance(lake_id, str) or not lake_id:
        raise JobValidationError("invalid lakeId")
    if manifest.get("adapter") != ADAPTER:
        raise JobValidationError("unsupported extraction adapter")

    inputs = manifest.get("inputs", {})
    paths = {
        key: _repo_path(repo_root, inputs.get(key, ""), exists=True)
        for key in ("sourceMetadata", "acceptedTransformation", "referenceGeometry")
    }
    source_metadata = read_json(paths["sourceMetadata"])
    transformation = read_json(paths["acceptedTransformation"])
    geometry = read_json(paths["referenceGeometry"])
    if any(value.get("lakeId") != lake_id for value in (source_metadata, transformation)):
        raise JobValidationError("lakeId differs between extraction inputs")
    if geometry.get("metadata", {}).get("lakeId") != lake_id:
        raise JobValidationError("reference geometry lakeId differs from extraction manifest")
    if manifest.get("sourceSha256") != source_metadata.get("fileSha256"):
        raise JobValidationError("manifest does not bind the registered source SHA-256")
    if sha256(paths["acceptedTransformation"]) != manifest.get("transformationSha256"):
        raise JobValidationError("accepted transformation artifact SHA-256 mismatch")
    if sha256(paths["referenceGeometry"]) != manifest.get("referenceGeometrySha256"):
        raise JobValidationError("reviewed reference geometry SHA-256 mismatch")
    if transformation.get("model") != "affine":
        raise JobValidationError("accepted transformation is not affine")

    permitted = manifest.get("permittedDepths")
    if (
        not isinstance(permitted, list)
        or not permitted
        or any(isinstance(depth, bool) or not isinstance(depth, int) or depth <= 0 for depth in permitted)
        or len(permitted) != len(set(permitted))
        or permitted != sorted(permitted)
    ):
        raise JobValidationError("permittedDepths must be unique sorted positive integers")
    exclusions = manifest.get("semanticExclusions", {})
    if exclusions.get("soundingsAreContours") is not False:
        raise JobValidationError("manifest must explicitly state that soundings are not contours")
    sounding_values = exclusions.get("soundingValues", [])
    if set(permitted) & set(sounding_values):
        raise JobValidationError("a sounding-only value cannot be a permitted contour depth")

    selections = manifest.get("selections")
    if not isinstance(selections, list) or not selections:
        raise JobValidationError("at least one reviewed contour selection is required")
    selection_ids = []
    for selection in selections:
        selection_id = selection.get("id")
        if not isinstance(selection_id, str) or not selection_id:
            raise JobValidationError("each selection needs a stable ID")
        selection_ids.append(selection_id)
        if selection.get("depth") not in permitted:
            raise JobValidationError(f"selection {selection_id} uses a non-permitted depth")
        waypoints = selection.get("waypoints")
        minimum = 3 if selection.get("closed") else 2
        if not isinstance(waypoints, list) or len(waypoints) < minimum:
            raise JobValidationError(f"selection {selection_id} has insufficient waypoints")
        for index, point in enumerate(waypoints):
            if not isinstance(point, list) or len(point) != 2:
                raise JobValidationError(f"selection {selection_id} waypoint {index} is invalid")
            _number(point[0], f"selection {selection_id} pixelX")
            _number(point[1], f"selection {selection_id} pixelY")
        seed = selection.get("sourceInkSeed")
        if not isinstance(seed, list) or len(seed) != 2:
            raise JobValidationError(f"selection {selection_id} needs a sourceInkSeed")
        _number(seed[0], f"selection {selection_id} sourceInkSeed pixelX")
        _number(seed[1], f"selection {selection_id} sourceInkSeed pixelY")
        radius = _number(selection.get("corridorRadiusPixels"), "corridorRadiusPixels")
        if radius < 5 or radius > 100:
            raise JobValidationError("corridorRadiusPixels must be between 5 and 100")
        guide_snap = _number(selection.get("maximumGuideSnapPixels"), "maximumGuideSnapPixels")
        if guide_snap < radius or guide_snap > 500:
            raise JobValidationError(
                "maximumGuideSnapPixels must be at least the corridor radius and at most 500"
            )
        minimum_points = selection.get("minimumExtractedPoints")
        if not isinstance(minimum_points, int) or minimum_points < 2:
            raise JobValidationError("minimumExtractedPoints must be an integer >= 2")
    if len(selection_ids) != len(set(selection_ids)):
        raise JobValidationError("selection IDs must be unique")

    threshold = manifest.get("lineArt", {}).get("inkThreshold")
    if not isinstance(threshold, int) or not 1 <= threshold <= 254:
        raise JobValidationError("lineArt.inkThreshold must be an integer from 1 to 254")
    geometry_type, components = geometry_components(geometry)
    outputs = manifest.get("outputs", {})
    if outputs.get("candidateBehavior") != "temporary" or outputs.get("qaBehavior") != "temporary":
        raise JobValidationError("candidate and QA behavior must be temporary")
    result_path = _result_path(repo_root, lake_id, outputs.get("result", ""))

    return {
        "manifest": manifest,
        "sourceMetadata": source_metadata,
        "transformation": transformation,
        "geometry": geometry,
        "geometryType": geometry_type,
        "components": components,
        "paths": paths,
        "resultPath": result_path,
    }


def _corridor_mask(size, waypoints, radius, closed):
    mask = Image.new("1", size, 0)
    draw = ImageDraw.Draw(mask)
    points = [(round(point[0]), round(point[1])) for point in waypoints]
    if closed:
        points.append(points[0])
    draw.line(points, fill=1, width=2 * round(radius) + 1, joint="curve")
    for point in points:
        draw.ellipse(
            (point[0] - radius, point[1] - radius, point[0] + radius, point[1] + radius),
            fill=1,
        )
    return np.asarray(mask, dtype=bool)


def _thin(binary):
    """Deterministic Zhang-Suen thinning for a cropped binary ink mask."""
    image = binary.astype(np.uint8).copy()
    changed = True
    while changed:
        changed = False
        for phase in (0, 1):
            padded = np.pad(image, 1)
            p2 = padded[:-2, 1:-1]
            p3 = padded[:-2, 2:]
            p4 = padded[1:-1, 2:]
            p5 = padded[2:, 2:]
            p6 = padded[2:, 1:-1]
            p7 = padded[2:, :-2]
            p8 = padded[1:-1, :-2]
            p9 = padded[:-2, :-2]
            neighbours = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9
            transitions = (
                ((p2 == 0) & (p3 == 1)).astype(np.uint8)
                + ((p3 == 0) & (p4 == 1))
                + ((p4 == 0) & (p5 == 1))
                + ((p5 == 0) & (p6 == 1))
                + ((p6 == 0) & (p7 == 1))
                + ((p7 == 0) & (p8 == 1))
                + ((p8 == 0) & (p9 == 1))
                + ((p9 == 0) & (p2 == 1))
            )
            candidate = (image == 1) & (neighbours >= 2) & (neighbours <= 6) & (transitions == 1)
            if phase == 0:
                candidate &= (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
            else:
                candidate &= (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
            if np.any(candidate):
                image[candidate] = 0
                changed = True
    return image.astype(bool)


def _nearest_skeleton(skeleton, point, maximum_distance):
    ys, xs = np.nonzero(skeleton)
    if not len(xs):
        raise JobValidationError("reviewed corridor contains no source ink skeleton")
    distance_squared = (xs - point[0]) ** 2 + (ys - point[1]) ** 2
    index = int(np.argmin(distance_squared))
    if distance_squared[index] > maximum_distance**2:
        raise JobValidationError("reviewed waypoint cannot be snapped to source ink")
    return int(xs[index]), int(ys[index])


def _shortest_path(skeleton, start, end):
    height, width = skeleton.shape
    queue = [(0.0, start)]
    distances = {start: 0.0}
    previous = {}
    neighbours = [
        (-1, -1, math.sqrt(2)), (0, -1, 1.0), (1, -1, math.sqrt(2)),
        (-1, 0, 1.0), (1, 0, 1.0),
        (-1, 1, math.sqrt(2)), (0, 1, 1.0), (1, 1, math.sqrt(2)),
    ]
    while queue:
        distance, current = heapq.heappop(queue)
        if distance != distances.get(current):
            continue
        if current == end:
            path = [current]
            while current != start:
                current = previous[current]
                path.append(current)
            return list(reversed(path))
        for dx, dy, cost in neighbours:
            candidate = (current[0] + dx, current[1] + dy)
            if not (0 <= candidate[0] < width and 0 <= candidate[1] < height):
                continue
            if not skeleton[candidate[1], candidate[0]]:
                continue
            next_distance = distance + cost
            if next_distance < distances.get(candidate, float("inf")):
                distances[candidate] = next_distance
                previous[candidate] = current
                heapq.heappush(queue, (next_distance, candidate))
    raise JobValidationError("reviewed waypoints are not connected by source ink")


def extract_selection(ink, component_labels, selection):
    reviewed_waypoints = selection["waypoints"]
    radius = selection["corridorRadiusPixels"]
    seed_x, seed_y = (round(value) for value in selection["sourceInkSeed"])
    if not (0 <= seed_x < ink.shape[1] and 0 <= seed_y < ink.shape[0]):
        raise JobValidationError("sourceInkSeed is outside the source raster")
    component_id = int(component_labels[seed_y, seed_x])
    if component_id == 0:
        raise JobValidationError("sourceInkSeed is not on source ink")
    component_y, component_x = np.nonzero(component_labels == component_id)
    waypoints = []
    for index, point in enumerate(reviewed_waypoints):
        distances = (component_x - point[0]) ** 2 + (component_y - point[1]) ** 2
        nearest = int(np.argmin(distances))
        if distances[nearest] > selection["maximumGuideSnapPixels"] ** 2:
            raise JobValidationError(
                f"reviewed waypoint {index} is too far from its selected source-ink component"
            )
        waypoints.append([int(component_x[nearest]), int(component_y[nearest])])
    minimum_x = max(0, math.floor(min(point[0] for point in waypoints) - radius - 2))
    maximum_x = min(ink.shape[1], math.ceil(max(point[0] for point in waypoints) + radius + 3))
    minimum_y = max(0, math.floor(min(point[1] for point in waypoints) - radius - 2))
    maximum_y = min(ink.shape[0], math.ceil(max(point[1] for point in waypoints) + radius + 3))
    local_waypoints = [[point[0] - minimum_x, point[1] - minimum_y] for point in waypoints]
    local = component_labels[minimum_y:maximum_y, minimum_x:maximum_x] == component_id
    corridor = _corridor_mask(
        (local.shape[1], local.shape[0]), local_waypoints, radius, selection.get("closed", False)
    )
    # Route only across original source-ink pixels. Keeping the full ink ribbon
    # avoids topology damage from thinning and still guarantees every emitted
    # point is directly traceable to the scan.
    skeleton = local & corridor
    snapped = []
    for index, point in enumerate(local_waypoints):
        try:
            snapped.append(_nearest_skeleton(skeleton, point, radius * 2))
        except JobValidationError as error:
            raise JobValidationError(
                f"waypoint {index} {reviewed_waypoints[index]} snapped to {waypoints[index]}: {error}"
            ) from error
    pairs = list(zip(snapped, snapped[1:]))
    if selection.get("closed"):
        pairs.append((snapped[-1], snapped[0]))
    path = []
    for index, (start, end) in enumerate(pairs):
        try:
            leg = _shortest_path(skeleton, start, end)
        except JobValidationError as error:
            raise JobValidationError(
                f"waypoint leg {index} {reviewed_waypoints[index]}->"
                f"{reviewed_waypoints[(index + 1) % len(reviewed_waypoints)]} "
                f"snapped {start}->{end} is disconnected: {error}"
            ) from error
        if path and leg[0] == path[-1]:
            leg = leg[1:]
        path.extend(leg)
    if len(path) < selection["minimumExtractedPoints"]:
        raise JobValidationError(
            f"selection {selection['id']} produced only {len(path)} source points"
        )
    global_path = [[x + minimum_x, y + minimum_y] for x, y in path]
    for x, y in global_path:
        if not ink[y, x]:
            raise AssertionError("extracted point is not source ink")
    return global_path


def _transform_path(path, transformation):
    longitude = transformation["affineLongitudeLatitude"]["longitudeCoefficients"]
    latitude = transformation["affineLongitudeLatitude"]["latitudeCoefficients"]
    return [
        [
            round(longitude[0] * x + longitude[1] * y + longitude[2], 7),
            round(latitude[0] * x + latitude[1] * y + latitude[2], 7),
        ]
        for x, y in path
    ]


def _point_on_segment(point, start, end, epsilon=1e-10):
    cross = (point[0] - start[0]) * (end[1] - start[1]) - (point[1] - start[1]) * (end[0] - start[0])
    if abs(cross) > epsilon:
        return False
    return (
        min(start[0], end[0]) - epsilon <= point[0] <= max(start[0], end[0]) + epsilon
        and min(start[1], end[1]) - epsilon <= point[1] <= max(start[1], end[1]) + epsilon
    )


def _point_in_ring(point, ring):
    inside = False
    for start, end in zip(ring, ring[1:]):
        if _point_on_segment(point, start, end):
            return True
        if (start[1] > point[1]) != (end[1] > point[1]):
            longitude = (end[0] - start[0]) * (point[1] - start[1]) / (end[1] - start[1]) + start[0]
            if point[0] < longitude:
                inside = not inside
    return inside


def point_in_water(point, components):
    for component in components:
        if _point_in_ring(point, component["outer"]):
            if not any(_point_in_ring(point, inner) for inner in component["inner"]):
                return True
    return False


def _intersection_parameter(start, end, ring_start, ring_end):
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    rx = ring_end[0] - ring_start[0]
    ry = ring_end[1] - ring_start[1]
    denominator = dx * ry - dy * rx
    if abs(denominator) < 1e-15:
        return None
    qx = ring_start[0] - start[0]
    qy = ring_start[1] - start[1]
    t = (qx * ry - qy * rx) / denominator
    u = (qx * dy - qy * dx) / denominator
    if -1e-12 <= t <= 1 + 1e-12 and -1e-12 <= u <= 1 + 1e-12:
        return min(1.0, max(0.0, t))
    return None


def clip_path(path, components):
    rings = []
    for component in components:
        rings.append(component["outer"])
        rings.extend(component["inner"])
    output = []
    current = []
    for start, end in zip(path, path[1:]):
        parameters = [0.0, 1.0]
        for ring in rings:
            for ring_start, ring_end in zip(ring, ring[1:]):
                parameter = _intersection_parameter(start, end, ring_start, ring_end)
                if parameter is not None:
                    parameters.append(parameter)
        parameters = sorted(set(round(value, 12) for value in parameters))
        for first, second in zip(parameters, parameters[1:]):
            if second - first < 1e-12:
                continue
            midpoint = [
                start[0] + (end[0] - start[0]) * ((first + second) / 2),
                start[1] + (end[1] - start[1]) * ((first + second) / 2),
            ]
            interval_start = [
                round(start[0] + (end[0] - start[0]) * first, 7),
                round(start[1] + (end[1] - start[1]) * first, 7),
            ]
            interval_end = [
                round(start[0] + (end[0] - start[0]) * second, 7),
                round(start[1] + (end[1] - start[1]) * second, 7),
            ]
            if point_in_water(midpoint, components):
                if not current:
                    current = [interval_start, interval_end]
                elif current[-1] == interval_start:
                    current.append(interval_end)
                else:
                    if len(current) >= 2:
                        output.append(current)
                    current = [interval_start, interval_end]
            elif current:
                if len(current) >= 2:
                    output.append(current)
                current = []
    if len(current) >= 2:
        output.append(current)
    return output


def _land_crossing_count(paths, components):
    crossings = 0
    for path in paths:
        for start, end in zip(path, path[1:]):
            midpoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
            if not point_in_water(midpoint, components):
                crossings += 1
    return crossings


def _candidate(lake_id, manifest, source_metadata, transformation_hash, geometry, features, metrics):
    return {
        "type": "FeatureCollection",
        "metadata": {
            "schemaVersion": 1,
            "lakeId": lake_id,
            "status": "review-candidate",
            "runtimePublished": False,
            "humanReviewRequired": True,
            "sourceMapNumber": source_metadata["mapNumber"],
            "sourceSha256": manifest["sourceSha256"],
            "transformationSha256": transformation_hash,
            "extractionAdapter": ADAPTER,
            "extractionConfigVersion": manifest["schemaVersion"],
            "referenceGeometry": geometry.get("metadata", {}),
            "depthValues": manifest["permittedDepths"],
            "clipping": metrics,
            "licenseStatus": "unresolved-derived-candidate-not-committed",
            "warning": "Generalized historical depth data; not for navigation",
        },
        "features": features,
    }


def _write_candidate(path, candidate):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(candidate, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


def _plot_source(image, extracted, qa_path):
    figure, axis = plt.subplots(figsize=(10, 14))
    axis.imshow(image, cmap="gray", origin="upper")
    colours = {2: "#1565c0", 4: "#2e7d32", 6: "#ef6c00", 8: "#8e24aa", 10: "#c62828"}
    for item in extracted:
        points = np.asarray(item["sourcePath"])
        axis.plot(points[:, 0], points[:, 1], color=colours.get(item["depth"], "#d50000"), linewidth=0.9)
    axis.set_xlim(1600, 4300)
    axis.set_ylim(5800, 1200)
    axis.set_title("Reviewed source-ink contour extraction")
    axis.grid(alpha=0.1)
    figure.tight_layout()
    figure.savefig(qa_path, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def _plot_geographic(components, features, qa_path, bounds=None, title="Candidate contours clipped to modern water"):
    figure, axis = plt.subplots(figsize=(10, 14))
    for component in components:
        outer = np.asarray(component["outer"])
        axis.plot(outer[:, 0], outer[:, 1], color="#263238", linewidth=1.1)
        for inner in component["inner"]:
            ring = np.asarray(inner)
            axis.plot(ring[:, 0], ring[:, 1], color="#c62828", linewidth=1.0)
    colours = {2: "#1565c0", 4: "#2e7d32", 6: "#ef6c00", 8: "#8e24aa", 10: "#c62828"}
    for feature in features:
        points = np.asarray(feature["geometry"]["coordinates"])
        axis.plot(points[:, 0], points[:, 1], color=colours[feature["properties"]["depth"]], linewidth=0.9)
    if bounds:
        axis.set_xlim(bounds[0], bounds[2])
        axis.set_ylim(bounds[1], bounds[3])
    axis.set_aspect("equal")
    axis.set_title(title)
    axis.grid(alpha=0.12)
    figure.tight_layout()
    figure.savefig(qa_path, dpi=160, metadata={"Software": "Project Pike Bathymetry v2"})
    plt.close(figure)


def run_extraction(manifest_path, source_path, candidate_path, qa_output, repo_root, *, render_qa=True):
    validated = validate_manifest(manifest_path, repo_root)
    manifest = validated["manifest"]
    require_temporary_output(candidate_path, repo_root)
    require_temporary_output(qa_output, repo_root)
    if sha256(source_path) != manifest["sourceSha256"]:
        raise JobValidationError("source SHA-256 mismatch")
    with Image.open(source_path) as opened:
        expected = validated["sourceMetadata"]
        if opened.format != expected["format"] or opened.size != (
            expected["widthPixels"], expected["heightPixels"]
        ):
            raise JobValidationError("source format or dimensions mismatch")
        image = opened.convert("L")
    ink = np.asarray(image) < manifest["lineArt"]["inkThreshold"]
    component_labels, _ = ndimage.label(ink, structure=np.ones((3, 3), dtype=np.uint8))

    extracted = []
    for selection in manifest["selections"]:
        try:
            source_path_points = extract_selection(ink, component_labels, selection)
        except JobValidationError as error:
            raise JobValidationError(f"selection {selection['id']}: {error}") from error
        transformed = _transform_path(source_path_points, validated["transformation"])
        clipped = clip_path(transformed, validated["components"])
        extracted.append({
            "id": selection["id"],
            "depth": selection["depth"],
            "sourcePath": source_path_points,
            "transformedPath": transformed,
            "clippedPaths": clipped,
        })

    features = []
    source_counts = defaultdict(int)
    postclip_counts = defaultdict(int)
    preclip_points = 0
    outside_points = 0
    all_clipped = []
    for item in extracted:
        source_counts[item["depth"]] += 1
        preclip_points += len(item["transformedPath"])
        outside_points += sum(
            not point_in_water(point, validated["components"])
            for point in item["transformedPath"]
        )
        for index, path in enumerate(item["clippedPaths"], 1):
            if len(path) < 2:
                continue
            postclip_counts[item["depth"]] += 1
            all_clipped.append(path)
            features.append({
                "type": "Feature",
                "properties": {
                    "kind": "contour",
                    "depth": item["depth"],
                    "sourceSelectionId": item["id"],
                    "sourceSegmentPart": index,
                },
                "geometry": {"type": "LineString", "coordinates": path},
            })
    land_crossings = _land_crossing_count(all_clipped, validated["components"])
    metrics = {
        "sourceSegmentCount": len(extracted),
        "transformedSegmentCount": len(extracted),
        "preclipPointCount": preclip_points,
        "outsideModernWaterPointCount": outside_points,
        "outsideModernWaterPercent": round(100 * outside_points / preclip_points, 3),
        "postclipSegmentCount": len(features),
        "postclipPointCount": sum(len(path) for path in all_clipped),
        "postclipLandCrossingCount": land_crossings,
    }
    candidate = _candidate(
        manifest["lakeId"], manifest, validated["sourceMetadata"],
        manifest["transformationSha256"], validated["geometry"], features, metrics
    )
    _write_candidate(candidate_path, candidate)
    candidate_hash = sha256(candidate_path)

    source_by_depth = {str(depth): source_counts[depth] for depth in manifest["permittedDepths"]}
    clipped_by_depth = {str(depth): postclip_counts[depth] for depth in manifest["permittedDepths"]}
    recommendation = (
        "review-extraction-candidate"
        if features and land_crossings == 0
        else "needs-extraction-review"
    )
    result = {
        "schemaVersion": 1,
        "lakeId": manifest["lakeId"],
        "adapter": ADAPTER,
        "sourceSha256": manifest["sourceSha256"],
        "transformationSha256": manifest["transformationSha256"],
        "referenceGeometrySha256": manifest["referenceGeometrySha256"],
        "permittedDepths": manifest["permittedDepths"],
        "extractedDepths": sorted({feature["properties"]["depth"] for feature in features}),
        "sourceSegmentCountPerDepth": source_by_depth,
        "postclipSegmentCountPerDepth": clipped_by_depth,
        "clipping": metrics,
        "candidateSha256": candidate_hash,
        "candidateCommitted": False,
        "candidateLicenseStatus": "unresolved",
        "humanReviewRequired": True,
        "recommendation": recommendation,
        "runtimePublished": False,
    }
    write_json(validated["resultPath"], result)

    if render_qa:
        qa_output.mkdir(parents=True, exist_ok=True)
        _plot_source(image, extracted, qa_output / "01-source-extraction.png")
        _plot_geographic(
            validated["components"], features, qa_output / "02-clipped-candidate.png"
        )
        closeup = manifest.get("qa", {}).get("geographicCloseupBounds")
        if closeup:
            _plot_geographic(
                validated["components"], features, qa_output / "03-review-closeup.png",
                bounds=closeup, title="Candidate review closeup"
            )
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, default=Path.cwd())
    commands = parser.add_subparsers(dest="command", required=True)
    validate = commands.add_parser("validate")
    validate.add_argument("--manifest", type=Path, required=True)
    run = commands.add_parser("run")
    run.add_argument("--manifest", type=Path, required=True)
    run.add_argument("--source", type=Path, required=True)
    run.add_argument("--candidate-output", type=Path, required=True)
    run.add_argument("--qa-output", type=Path, required=True)
    arguments = parser.parse_args()
    try:
        if arguments.command == "validate":
            validated = validate_manifest(arguments.manifest, arguments.repo_root)
            print(
                f"VALID {validated['manifest']['lakeId']}: "
                f"{len(validated['manifest']['selections'])} reviewed selections"
            )
        else:
            result = run_extraction(
                arguments.manifest, arguments.source, arguments.candidate_output,
                arguments.qa_output, arguments.repo_root
            )
            print(
                f"{result['lakeId']}: {result['recommendation']}; "
                f"{result['clipping']['sourceSegmentCount']} source segments; "
                f"{result['clipping']['postclipSegmentCount']} clipped segments; "
                f"candidate {result['candidateSha256']}"
            )
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()
