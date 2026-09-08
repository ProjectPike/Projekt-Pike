#!/usr/bin/env python3
"""Extract genuine contour boundaries from reviewed SMHI color-band maps.

This is an offline import tool, not part of the Vite build. It deliberately
supports only sources whose depth bands and shoreline can be separated without
guessing. Every new source needs an explicit config and must pass the residual,
land-crossing and visual review gates before its output is published.
"""

import argparse
import json
import math
import subprocess
import tempfile
from pathlib import Path

import contourpy
import numpy as np
from matplotlib.path import Path as GeometryPath
from PIL import Image
from scipy import ndimage
from scipy.spatial import cKDTree


CONFIGS = {
    "hokesjon": {
        "osm_name": "Hökesjön",
        "source": "hokesjon/hokesjon-01.pdf",
        "source_map": "5-0025",
        "smhi_id": "642099-139212",
        "crop": (0, 150, 3100, 4250),
        "seed": (1500, 1200),
        "thresholds": ((2, 30), (3, 65), (4, 110), (5, 170)),
    },
    "knipesjon": {
        "osm_name": "Knipesjön",
        "source": "knipesjon/knipesjon-01.pdf",
        "source_map": "5-0026",
        "smhi_id": "642528-138795",
        "crop": (0, 0, 3600, 4760),
        "seed": (1300, 1500),
        "thresholds": ((1, 30), (2, 65), (3, 110), (4, 170)),
    },
    "munksjon": {
        "mode": "red-bands",
        "osm_name": "Munksjön",
        "source": "munksjon/munksjon-01.jpg",
        "source_map": "3-6432",
        "smhi_id": "640746-140268",
        "crop": (3250, 200, 6000, 4400),
        "seed": (4600, 1800),
        "thresholds": (
            (2, 235),
            (4, 225),
            (6, 215),
            (8, 203),
            (10, 190),
            (12, 175),
            (14, 162),
            (16, 150),
            (18, 138),
        ),
    },
    "svansjon": {
        "mode": "reviewed-regions",
        "osm_name": "Svansjön",
        "source": "svansjon/svansjon-01.tif",
        "source_map": "3-5723",
        "smhi_id": "641175-137986",
        "crop": (300, 300, 4500, 6100),
        "seed": (3000, 2500),
        "ink_dilation": 2,
        "regions": (
            {"depth": 1, "seed": (900, 1500)},
            {"depth": 2, "seed": (1000, 2500)},
            {"depth": 2, "seed": (2200, 900)},
            {"depth": 4, "seed": (3000, 2500)},
        ),
    },
}


def assemble_rings(element, role):
    segments = []
    for member in element.get("members", []):
        if member.get("role") != role or not member.get("geometry"):
            continue
        segments.append([(point["lon"], point["lat"]) for point in member["geometry"]])

    rings = []
    while segments:
        ring = segments.pop(0)
        while segments:
            for index, segment in enumerate(segments):
                if ring[-1] == segment[0]:
                    ring += segment[1:]
                elif ring[-1] == segment[-1]:
                    ring += list(reversed(segment[:-1]))
                elif ring[0] == segment[-1]:
                    ring = segment[:-1] + ring
                elif ring[0] == segment[0]:
                    ring = list(reversed(segment[1:])) + ring
                else:
                    continue
                segments.pop(index)
                break
            else:
                break
        rings.append(ring)
    return rings


def get_rings(osm_data, name):
    element = next(
        item for item in osm_data["elements"] if item.get("tags", {}).get("name") == name
    )
    if element["type"] == "way":
        outer = [[(point["lon"], point["lat"]) for point in element["geometry"]]]
        return outer, []
    return assemble_rings(element, "outer"), assemble_rings(element, "inner")


def resample_closed(points, count=800):
    points = np.asarray(points, dtype=float)
    points = np.vstack([points, points[0]])
    distances = np.linalg.norm(np.diff(points, axis=0), axis=1)
    cumulative = np.r_[0, np.cumsum(distances)]
    result = []
    for value in np.linspace(0, cumulative[-1], count, endpoint=False):
        index = min(
            max(0, np.searchsorted(cumulative, value, side="right") - 1),
            len(distances) - 1,
        )
        fraction = (value - cumulative[index]) / max(distances[index], 1e-9)
        result.append(points[index] * (1 - fraction) + points[index + 1] * fraction)
    return np.asarray(result)


def source_water_mask(image, crop, seed):
    x0, y0, x1, y1 = crop
    pixels = np.asarray(image.convert("RGB"))[y0:y1, x0:x1]
    red = pixels[:, :, 0].astype(int)
    green = pixels[:, :, 1].astype(int)
    blue = pixels[:, :, 2].astype(int)
    blue_minus_red = blue - red
    water_like = (blue_minus_red > 5) & (blue >= green - 2) & (green > red)
    water_like = ndimage.binary_closing(water_like, iterations=12)
    labels, _ = ndimage.label(water_like)
    lake_label = labels[seed[1] - y0, seed[0] - x0]
    mask = labels == lake_label
    mask = ndimage.binary_closing(mask, iterations=6)
    mask = ndimage.binary_fill_holes(mask)
    return pixels, blue_minus_red, mask


def longest_boundary(mask, x0, y0):
    paths = contourpy.contour_generator(
        z=mask.astype(float), line_type="Separate"
    ).lines(0.5)
    path = max(paths, key=len)
    return np.c_[path[:, 0] + x0, -(path[:, 1] + y0)]


def apply_affine(points, transform):
    return np.c_[points, np.ones(len(points))] @ transform


def fit_shoreline(source_boundary, target_boundary):
    source = resample_closed(source_boundary)
    target = resample_closed(target_boundary)
    scale_x = np.ptp(target[:, 0]) / np.ptp(source[:, 0])
    scale_y = np.ptp(target[:, 1]) / np.ptp(source[:, 1])
    transform = np.array(
        [
            [scale_x, 0],
            [0, scale_y],
            [
                -np.mean(source[:, 0]) * scale_x + np.mean(target[:, 0]),
                -np.mean(source[:, 1]) * scale_y + np.mean(target[:, 1]),
            ],
        ]
    )

    for _ in range(50):
        transformed = apply_affine(source, transform)
        source_distance, target_index = cKDTree(target).query(transformed)
        target_distance, source_index = cKDTree(transformed).query(target)
        source_limit = np.percentile(source_distance, 75)
        target_limit = np.percentile(target_distance, 75)
        fit_source = np.vstack(
            [source[source_distance <= source_limit], source[source_index[target_distance <= target_limit]]]
        )
        fit_target = np.vstack(
            [target[target_index[source_distance <= source_limit]], target[target_distance <= target_limit]]
        )
        updated = np.linalg.lstsq(
            np.c_[fit_source, np.ones(len(fit_source))], fit_target, rcond=None
        )[0]
        transform = 0.65 * transform + 0.35 * updated

    transformed = apply_affine(source, transform)
    distances = cKDTree(target).query(transformed)[0]
    return transform, float(np.mean(distances)), float(np.percentile(distances, 90))


def point_in_ring(point, ring):
    x, y = point
    inside = False
    previous = len(ring) - 1
    for index, (current_x, current_y) in enumerate(ring):
        previous_x, previous_y = ring[previous]
        if ((current_y > y) != (previous_y > y)) and x < (
            (previous_x - current_x) * (y - current_y)
            / (previous_y - current_y + 1e-30)
            + current_x
        ):
            inside = not inside
        previous = index
    return inside


def simplify(points, tolerance=1.5):
    points = np.asarray(points, dtype=float)
    keep = np.zeros(len(points), dtype=bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        start, end = stack.pop()
        if end <= start + 1:
            continue
        origin, destination = points[start], points[end]
        vector = destination - origin
        candidates = points[start + 1 : end]
        denominator = np.dot(vector, vector)
        if denominator:
            position = np.clip(((candidates - origin) @ vector) / denominator, 0, 1)
            distances = np.linalg.norm(
                candidates - (origin + position[:, None] * vector), axis=1
            )
        else:
            distances = np.linalg.norm(candidates - origin, axis=1)
        relative_index = int(np.argmax(distances))
        if distances[relative_index] > tolerance:
            index = start + 1 + relative_index
            keep[index] = True
            stack.extend(((start, index), (index, end)))
    return points[keep]


def render_first_pdf_page(source, destination):
    subprocess.run(
        ["pdftoppm", "-f", "1", "-singlefile", "-png", "-r", "140", source, destination],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return Path(f"{destination}.png")


def open_source_image(source, temporary, lake_id):
    if source.suffix.lower() == ".pdf":
        return Image.open(render_first_pdf_page(source, temporary / lake_id))
    return Image.open(source)


def projection_for_lake(osm_data, name):
    outer_rings, inner_rings = get_rings(osm_data, name)
    outer = max(outer_rings, key=len)
    longitude_origin = np.mean([longitude for longitude, _ in outer])
    latitude_origin = np.mean([latitude for _, latitude in outer])
    longitude_scale = 111320 * math.cos(math.radians(latitude_origin))

    def project(ring):
        return np.asarray(
            [
                [
                    (longitude - longitude_origin) * longitude_scale,
                    (latitude - latitude_origin) * 110540,
                ]
                for longitude, latitude in ring
            ]
        )

    return (
        project(outer),
        [project(ring) for ring in inner_rings],
        longitude_origin,
        latitude_origin,
        longitude_scale,
    )


def dense_points(points, spacing=2):
    dense = []
    for start, end in zip(points[:-1], points[1:]):
        count = max(1, int(np.linalg.norm(end - start) / spacing))
        dense.extend(start + (end - start) * index / count for index in range(count))
    dense.append(points[-1])
    return dense


def clip_contours(
    contours,
    projected_outer,
    projected_inner,
    longitude_origin,
    latitude_origin,
    longitude_scale,
):
    outer_path = GeometryPath(projected_outer)
    inner_paths = [GeometryPath(ring) for ring in projected_inner]

    def water_mask_for_points(points):
        points = np.asarray(points)
        inside = outer_path.contains_points(points)
        for inner_path in inner_paths:
            inside &= ~inner_path.contains_points(points)
        return inside

    features = []
    outside = 0
    total = 0
    postclip_land = 0
    postclip_samples = 0

    for depth, projected in contours:
        parts = []
        part = []
        dense = dense_points(projected)
        water_flags = water_mask_for_points(dense)
        for point, inside in zip(dense, water_flags):
            total += 1
            outside += not inside
            if inside:
                part.append(point)
            elif len(part) > 5:
                parts.append(part)
                part = []
            else:
                part = []
        if len(part) > 5:
            parts.append(part)

        for part in parts:
            reduced = simplify(part)
            if len(reduced) < 5:
                continue
            verification_samples = dense_points(reduced, spacing=1)
            land_count = int(
                np.count_nonzero(~water_mask_for_points(verification_samples))
            )
            if land_count:
                reduced = simplify(part, tolerance=0.25)
                verification_samples = dense_points(reduced, spacing=0.5)
                land_count = int(
                    np.count_nonzero(~water_mask_for_points(verification_samples))
                )
            if land_count:
                raise RuntimeError(
                    "Contour simplification crossed modern land geometry"
                )
            postclip_samples += len(verification_samples)
            postclip_land += land_count
            coordinates = [
                [
                    round(float(x / longitude_scale + longitude_origin), 7),
                    round(float(y / 110540 + latitude_origin), 7),
                ]
                for x, y in reduced
            ]
            features.append(
                {
                    "type": "Feature",
                    "properties": {"depth": depth, "kind": "contour"},
                    "geometry": {"type": "LineString", "coordinates": coordinates},
                }
            )

    return (
        features,
        100 * outside / max(total, 1),
        postclip_samples,
        postclip_land,
    )


def write_result(
    lake_id,
    config,
    output_root,
    features,
    mean_residual,
    p90_residual,
    outside_percent,
    postclip_samples,
    postclip_land,
    processing_method,
    inner_ring_count,
):
    if (
        mean_residual > 60
        or p90_residual > 130
        or outside_percent > 25
        or postclip_land > 0
    ):
        raise RuntimeError(
            f"{lake_id} failed quality gate: mean={mean_residual:.1f} m, "
            f"p90={p90_residual:.1f} m, outside={outside_percent:.1f}%, "
            f"postclip-land={postclip_land}/{postclip_samples}"
        )

    depth_values = sorted({feature["properties"]["depth"] for feature in features})
    result = {
        "type": "FeatureCollection",
        "metadata": {
            "schemaVersion": 1,
            "lakeId": lake_id,
            "units": "metres",
            "sourceOrganization": "SMHI",
            "sourceDataset": "Damm- och sjöregistret",
            "sourceMapNumber": config["source_map"],
            "sourceUrl": f"https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/{config['smhi_id']}",
            "sourceRetrievedAt": "2026-09-08",
            "processedAt": "2026-09-08",
            "processingMethod": processing_method,
            "georeferencingMethod": "Source-specific robust affine shoreline fit using 800 distributed control samples",
            "controlPointCount": 800,
            "shorelineMeanResidualMeters": round(mean_residual, 1),
            "shorelineP90ResidualMeters": round(p90_residual, 1),
            "preclipOutsidePercent": round(outside_percent, 2),
            "postclipSampleCount": postclip_samples,
            "postclipLandPointCount": postclip_land,
            "postclipLandPercent": round(100 * postclip_land / max(postclip_samples, 1), 2),
            "islandCount": inner_ring_count,
            "islandClippingPassed": postclip_land == 0,
            "topologyStatus": "reviewed-plausible",
            "clippedTo": "OpenStreetMap lake multipolygon including islands",
            "depthValues": depth_values,
            "qualityStatus": "verified",
            "license": "CC BY 4.0",
            "warning": "Generalized depth data; not for navigation",
        },
        "features": features,
    }
    output_root.mkdir(parents=True, exist_ok=True)
    output_path = output_root / f"{lake_id}.geojson"
    output_path.write_text(json.dumps(result, separators=(",", ":")) + "\n")
    print(
        f"{lake_id}: {len(features)} segments, mean {mean_residual:.1f} m, "
        f"p90 {p90_residual:.1f} m, preclip outside {outside_percent:.1f}%, "
        f"postclip land {postclip_land}/{postclip_samples}"
    )


def process_red_bands(lake_id, config, source_root, osm_data, output_root):
    with tempfile.TemporaryDirectory() as temporary:
        image = open_source_image(
            source_root / config["source"], Path(temporary), lake_id
        )
        pixels, _, water_mask = source_water_mask(
            image, config["crop"], config["seed"]
        )

    x0, y0, _, _ = config["crop"]
    source_boundary = longest_boundary(water_mask, x0, y0)
    (
        projected_outer,
        projected_inner,
        longitude_origin,
        latitude_origin,
        longitude_scale,
    ) = projection_for_lake(osm_data, config["osm_name"])
    transform, mean_residual, p90_residual = fit_shoreline(
        source_boundary, projected_outer
    )

    # The scan uses genuine two-metre colour bands. Smoothing suppresses print
    # halftone without moving the band boundaries; a small shoreline erosion
    # excludes the source map's green/red shoreline and hatching.
    red = ndimage.gaussian_filter(pixels[:, :, 0].astype(float), sigma=15)
    contour_area = ndimage.binary_erosion(water_mask, iterations=12)
    contours = []
    for depth, threshold in config["thresholds"]:
        mask = contour_area & (red < threshold)
        mask = ndimage.binary_closing(mask, iterations=5)
        mask = ndimage.binary_fill_holes(mask)
        labels, _ = ndimage.label(mask)
        sizes = np.bincount(labels.ravel())
        mask = np.isin(labels, np.where(sizes > 15000)[0]) & (labels > 0)
        paths = contourpy.contour_generator(
            z=mask.astype(float), line_type="Separate"
        ).lines(0.5)
        for path in paths:
            if len(path) < 100:
                continue
            source_points = np.c_[path[:, 0] + x0, -(path[:, 1] + y0)]
            contours.append((depth, apply_affine(source_points, transform)))

    features, outside_percent, postclip_samples, postclip_land = clip_contours(
        contours,
        projected_outer,
        projected_inner,
        longitude_origin,
        latitude_origin,
        longitude_scale,
    )
    write_result(
        lake_id,
        config,
        output_root,
        features,
        mean_residual,
        p90_residual,
        outside_percent,
        postclip_samples,
        postclip_land,
        "Reviewed two-metre colour-band boundary vectorization; source shoreline, hatching, labels and soundings excluded",
        len(projected_inner),
    )


def process_reviewed_regions(lake_id, config, source_root, osm_data, output_root):
    with tempfile.TemporaryDirectory() as temporary:
        image = open_source_image(
            source_root / config["source"], Path(temporary), lake_id
        )
        grayscale = np.asarray(image.convert("L"))

    x0, y0, x1, y1 = config["crop"]
    ink = grayscale[y0:y1, x0:x1] < 128
    ink = ndimage.binary_dilation(ink, iterations=config["ink_dilation"])
    filled = ndimage.binary_fill_holes(ink)
    filled_labels, _ = ndimage.label(filled)
    lake_label = filled_labels[config["seed"][1] - y0, config["seed"][0] - x0]
    lake_mask = filled_labels == lake_label
    source_boundary = longest_boundary(lake_mask, x0, y0)

    (
        projected_outer,
        projected_inner,
        longitude_origin,
        latitude_origin,
        longitude_scale,
    ) = projection_for_lake(osm_data, config["osm_name"])
    transform, mean_residual, p90_residual = fit_shoreline(
        source_boundary, projected_outer
    )

    # Only manually reviewed enclosed regions are selected. Their outer
    # boundaries are the labelled source contours; all other scan ink is
    # deliberately ignored.
    region_labels, _ = ndimage.label(~ink)
    contours = []
    used_labels = set()
    for region in config["regions"]:
        seed_x, seed_y = region["seed"]
        region_label = int(region_labels[seed_y - y0, seed_x - x0])
        if region_label <= 0 or region_label in used_labels:
            raise RuntimeError(f"{lake_id}: invalid or duplicate reviewed region")
        used_labels.add(region_label)
        paths = contourpy.contour_generator(
            z=(region_labels == region_label).astype(float), line_type="Separate"
        ).lines(0.5)
        path = max(paths, key=len)
        source_points = np.c_[path[:, 0] + x0, -(path[:, 1] + y0)]
        contours.append(
            (region["depth"], apply_affine(source_points, transform))
        )

    features, outside_percent, postclip_samples, postclip_land = clip_contours(
        contours,
        projected_outer,
        projected_inner,
        longitude_origin,
        latitude_origin,
        longitude_scale,
    )
    write_result(
        lake_id,
        config,
        output_root,
        features,
        mean_residual,
        p90_residual,
        outside_percent,
        postclip_samples,
        postclip_land,
        "Reviewed labelled contour-region extraction; source shoreline, typography, symbols and sounding point excluded",
        len(projected_inner),
    )


def process(lake_id, config, source_root, osm_data, output_root):
    if config.get("mode") == "red-bands":
        return process_red_bands(
            lake_id, config, source_root, osm_data, output_root
        )
    if config.get("mode") == "reviewed-regions":
        return process_reviewed_regions(
            lake_id, config, source_root, osm_data, output_root
        )

    with tempfile.TemporaryDirectory() as temporary:
        image = open_source_image(
            source_root / config["source"], Path(temporary), lake_id
        )
        pixels, blue_minus_red, water_mask = source_water_mask(
            image, config["crop"], config["seed"]
        )

    x0, y0, _, _ = config["crop"]
    source_boundary = longest_boundary(water_mask, x0, y0)
    outer_rings, inner_rings = get_rings(osm_data, config["osm_name"])
    outer = max(outer_rings, key=len)
    longitude_origin = np.mean([longitude for longitude, _ in outer])
    latitude_origin = np.mean([latitude for _, latitude in outer])
    longitude_scale = 111320 * math.cos(math.radians(latitude_origin))

    def project(ring):
        return np.asarray(
            [
                [
                    (longitude - longitude_origin) * longitude_scale,
                    (latitude - latitude_origin) * 110540,
                ]
                for longitude, latitude in ring
            ]
        )

    projected_outer = project(outer)
    projected_inner = [project(ring) for ring in inner_rings]
    transform, mean_residual, p90_residual = fit_shoreline(
        source_boundary, projected_outer
    )

    def is_water(point):
        return point_in_ring(point, projected_outer) and not any(
            point_in_ring(point, ring) for ring in projected_inner
        )

    features = []
    outside = 0
    total = 0
    for depth, threshold in config["thresholds"]:
        mask = water_mask & (blue_minus_red > threshold)
        mask = ndimage.binary_closing(mask, iterations=7)
        mask = ndimage.binary_fill_holes(mask)
        labels, _ = ndimage.label(mask)
        sizes = np.bincount(labels.ravel())
        mask = np.isin(labels, np.where(sizes > 2500)[0]) & (labels > 0)
        paths = contourpy.contour_generator(
            z=mask.astype(float), line_type="Separate"
        ).lines(0.5)

        for path in paths:
            if len(path) < 80:
                continue
            source_points = np.c_[path[:, 0] + x0, -(path[:, 1] + y0)]
            projected = apply_affine(source_points, transform)
            dense = []
            for start, end in zip(projected[:-1], projected[1:]):
                count = max(1, int(np.linalg.norm(end - start) / 2))
                dense.extend(start + (end - start) * index / count for index in range(count))
            dense.append(projected[-1])

            parts = []
            part = []
            for point in dense:
                inside = is_water(point)
                total += 1
                outside += not inside
                if inside:
                    part.append(point)
                elif len(part) > 5:
                    parts.append(part)
                    part = []
                else:
                    part = []
            if len(part) > 5:
                parts.append(part)

            for part in parts:
                reduced = simplify(part)
                if len(reduced) < 5:
                    continue
                coordinates = [
                    [
                        round(float(x / longitude_scale + longitude_origin), 7),
                        round(float(y / 110540 + latitude_origin), 7),
                    ]
                    for x, y in reduced
                ]
                features.append(
                    {
                        "type": "Feature",
                        "properties": {"depth": depth, "kind": "contour"},
                        "geometry": {"type": "LineString", "coordinates": coordinates},
                    }
                )

    outside_percent = 100 * outside / max(total, 1)
    if mean_residual > 60 or p90_residual > 130 or outside_percent > 25:
        raise RuntimeError(
            f"{lake_id} failed quality gate: mean={mean_residual:.1f} m, "
            f"p90={p90_residual:.1f} m, outside={outside_percent:.1f}%"
        )

    result = {
        "type": "FeatureCollection",
        "metadata": {
            "schemaVersion": 1,
            "lakeId": lake_id,
            "units": "metres",
            "sourceOrganization": "SMHI",
            "sourceDataset": "Damm- och sjöregistret",
            "sourceMapNumber": config["source_map"],
            "sourceUrl": f"https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/{config['smhi_id']}",
            "sourceRetrievedAt": "2026-09-08",
            "processedAt": "2026-09-08",
            "processingMethod": "Color-band boundary vectorization; source graphics and typography excluded",
            "georeferencingMethod": "Source-specific robust affine shoreline fit using 800 distributed control samples",
            "controlPointCount": 800,
            "shorelineMeanResidualMeters": round(mean_residual, 1),
            "shorelineP90ResidualMeters": round(p90_residual, 1),
            "preclipOutsidePercent": round(outside_percent, 2),
            "clippedTo": "OpenStreetMap lake multipolygon including islands",
            "depthValues": [depth for depth, _ in config["thresholds"]],
            "qualityStatus": "verified",
            "license": "CC BY 4.0",
            "warning": "Generalized depth data; not for navigation",
        },
        "features": features,
    }
    output_root.mkdir(parents=True, exist_ok=True)
    output_path = output_root / f"{lake_id}.geojson"
    output_path.write_text(json.dumps(result, separators=(",", ":")) + "\n")
    print(
        f"{lake_id}: {len(features)} segments, mean {mean_residual:.1f} m, "
        f"p90 {p90_residual:.1f} m, preclip outside {outside_percent:.1f}%"
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--osm-json", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, default=Path("public/bathymetry"))
    parser.add_argument("lakes", nargs="*", default=[])
    arguments = parser.parse_args()
    osm_data = json.loads(arguments.osm_json.read_text())
    requested_lakes = arguments.lakes or list(CONFIGS)
    unknown_lakes = sorted(set(requested_lakes) - set(CONFIGS))
    if unknown_lakes:
        parser.error(f"unsupported lake(s): {', '.join(unknown_lakes)}")
    for lake_id in requested_lakes:
        process(
            lake_id,
            CONFIGS[lake_id],
            arguments.source_root,
            osm_data,
            arguments.output_root,
        )


if __name__ == "__main__":
    main()
