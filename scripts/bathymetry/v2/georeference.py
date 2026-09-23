#!/usr/bin/env python3
"""CLI for the manifest-driven Pike Bathymetry v2 georeferencing workflow."""

import argparse
import json
import sys
from pathlib import Path

from workflow import batch_jobs, validate_job, write_json


def require_non_runtime_output(path, repo_root):
    """Reject any temporary/result destination inside runtime production areas."""
    resolved = path.resolve()
    root = repo_root.resolve()
    if resolved.is_relative_to(root):
        allowed = (root / "data" / "bathymetry-working").resolve()
        if not resolved.is_relative_to(allowed):
            raise ValueError(
                "runner output inside the repository is allowed only under "
                "data/bathymetry-working"
            )


def prepare_geometry(arguments):
    """Prepare a simple reviewed OSM relation snapshot.

    This helper intentionally remains narrow. Arbitrary split-member assembly is
    an upstream reviewed geometry-preparation responsibility, not a runner task.
    """
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

    if len(outer) != 1:
        raise RuntimeError(
            "preparation helper supports one already-assembled outer ring; "
            "prepare complex geometry in a reviewed upstream step"
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


def validate_command(arguments):
    job = validate_job(arguments.job, arguments.repo_root)
    print(
        f"VALID {job['manifest']['lakeId']}: {job['geometryType']}, "
        f"{len(job['gcpsConfig']['gcps'])} GCPs"
    )


def run_command(arguments):
    from workflow import run_job

    require_non_runtime_output(arguments.qa_output, arguments.repo_root)
    result = run_job(
        arguments.job,
        arguments.source,
        arguments.qa_output,
        arguments.repo_root,
    )
    print(
        f"{result['lakeId']}: {result['recommendation']}; "
        f"fit RMSE {result['fitResiduals']['rmseMeters']:.3f} m; "
        f"holdout RMSE {result['holdoutResiduals']['rmseMeters']:.3f} m"
    )


def parse_source_mapping(values):
    mappings = {}
    for value in values:
        if "=" not in value:
            raise ValueError("--source must use lakeId=/external/source.tif")
        lake_id, path = value.split("=", 1)
        if not lake_id or not path or lake_id in mappings:
            raise ValueError(f"invalid or duplicate source mapping: {value}")
        mappings[lake_id] = Path(path)
    return mappings


def batch_command(arguments):
    require_non_runtime_output(arguments.qa_root, arguments.repo_root)
    require_non_runtime_output(arguments.summary, arguments.repo_root)
    sources = parse_source_mapping(arguments.source)
    jobs = []
    job_lake_ids = set()
    for manifest_path in arguments.job:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        lake_id = manifest.get("lakeId")
        if lake_id not in sources:
            raise ValueError(f"missing external source mapping for {lake_id}")
        jobs.append((manifest_path, sources[lake_id]))
        job_lake_ids.add(lake_id)
    unused = set(sources) - job_lake_ids
    if unused:
        raise ValueError(f"unused source mappings: {', '.join(sorted(unused))}")
    summary = batch_jobs(jobs, arguments.repo_root, arguments.qa_root)
    write_json(arguments.summary, summary)
    for item in summary["results"]:
        if item["status"] == "completed":
            print(
                f"{item['lakeId']}: completed; fit {item['fitRmseMeters']:.3f} m; "
                f"holdout {item['holdoutRmseMeters']:.3f} m; "
                f"max {item['holdoutMaximumMeters']:.3f} m; "
                f"gate {item['numericGatePassed']}; {item['recommendation']}"
            )
        else:
            print(f"{item['lakeId']}: failed; {item['errorType']}: {item['error']}")
    if summary["failedCount"]:
        raise SystemExit(1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", type=Path, default=Path.cwd())
    commands = parser.add_subparsers(dest="command", required=True)

    validate = commands.add_parser("validate")
    validate.add_argument("--job", type=Path, required=True)
    validate.set_defaults(handler=validate_command)

    process = commands.add_parser("run")
    process.add_argument("--job", type=Path, required=True)
    process.add_argument("--source", type=Path, required=True)
    process.add_argument("--qa-output", type=Path, required=True)
    process.set_defaults(handler=run_command)

    batch = commands.add_parser("batch")
    batch.add_argument("--job", type=Path, action="append", required=True)
    batch.add_argument("--source", action="append", required=True)
    batch.add_argument("--qa-root", type=Path, required=True)
    batch.add_argument("--summary", type=Path, required=True)
    batch.set_defaults(handler=batch_command)

    prepare = commands.add_parser("prepare-geometry")
    prepare.add_argument("--overpass-json", type=Path, required=True)
    prepare.add_argument("--relation-id", type=int, required=True)
    prepare.add_argument("--lake-id", required=True)
    prepare.add_argument("--retrieved-at", required=True)
    prepare.add_argument("--output", type=Path, required=True)
    prepare.set_defaults(handler=prepare_geometry)

    arguments = parser.parse_args()
    try:
        arguments.handler(arguments)
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()
