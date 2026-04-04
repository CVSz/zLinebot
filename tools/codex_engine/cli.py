#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

from .pipeline import CodexPipeline


def main() -> int:
    parser = argparse.ArgumentParser(description="Codex analysis engine")
    parser.add_argument("--mode", choices=["full", "incremental", "distributed"], default="full")
    parser.add_argument("--tenant", default="default")
    parser.add_argument("--output", default="artifacts/codex-report.json")
    args = parser.parse_args()

    pipeline = CodexPipeline(mode=args.mode, tenant_id=args.tenant)
    report = pipeline.run()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        f.write(json.dumps(report.model_dump(), indent=2))

    blocking = report.blocking_findings
    print(f"Scanned files: {len(report.scanned_files)}")
    print(f"Findings: {len(report.findings)}")
    print(f"Blocking findings: {len(blocking)}")
    if blocking:
        for item in blocking[:20]:
            print(f" - [{item.severity}] {item.id} {item.file}: {item.message}")
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
