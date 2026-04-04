from __future__ import annotations

import ast
import json
import os
import re
import subprocess
from collections import defaultdict, deque
from pathlib import Path

import numpy as np
from sklearn.ensemble import IsolationForest

from .models import Finding, Severity

SINK_PATTERNS = (
    "execute",
    "exec",
    "eval",
    "subprocess",
    "requests",
    "httpx",
)
SOURCE_PATTERNS = ("request", "input", "query", "payload", "body", "params")


class PythonAstAnalyzer:
    layer = "ast-python"

    def run(self, file_path: Path, source: str) -> list[Finding]:
        findings: list[Finding] = []
        try:
            tree = ast.parse(source)
        except SyntaxError as exc:
            findings.append(
                Finding(
                    id="PY-SYNTAX",
                    layer=self.layer,
                    severity=Severity.HIGH,
                    file=str(file_path),
                    message=f"Syntax error prevents static analysis: {exc.msg}",
                    evidence={"line": exc.lineno},
                )
            )
            return findings

        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "eval":
                findings.append(
                    Finding(
                        id="PY-EVAL",
                        layer=self.layer,
                        severity=Severity.CRITICAL,
                        file=str(file_path),
                        symbol="eval",
                        message="Dynamic eval detected; replace with safe parser.",
                        evidence={"line": node.lineno},
                        autofix_available=False,
                    )
                )
        return findings


class TypeScriptAstAnalyzer:
    layer = "ast-typescript"

    def run(self, file_path: Path, source: str) -> list[Finding]:
        findings: list[Finding] = []
        if re.search(r"\beval\s*\(", source):
            findings.append(
                Finding(
                    id="TS-EVAL",
                    layer=self.layer,
                    severity=Severity.CRITICAL,
                    file=str(file_path),
                    symbol="eval",
                    message="eval() usage in TypeScript/JS file.",
                )
            )
        if re.search(r"new\s+Function\s*\(", source):
            findings.append(
                Finding(
                    id="TS-FUNCTION-CONSTRUCTOR",
                    layer=self.layer,
                    severity=Severity.HIGH,
                    file=str(file_path),
                    symbol="Function",
                    message="Function constructor creates code injection risk.",
                )
            )
        return findings


class SsaAnalyzer:
    layer = "ssa"

    def run(self, file_path: Path, source: str) -> list[Finding]:
        # Lightweight SSA signal: frequent variable reassignments in a function are risk indicators.
        findings: list[Finding] = []
        if file_path.suffix != ".py":
            return findings

        tree = ast.parse(source)
        for node in [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]:
            versions: defaultdict[str, int] = defaultdict(int)
            for child in ast.walk(node):
                if isinstance(child, ast.Assign):
                    for target in child.targets:
                        if isinstance(target, ast.Name):
                            versions[target.id] += 1
            noisy = {k: v for k, v in versions.items() if v > 5}
            if noisy:
                findings.append(
                    Finding(
                        id="SSA-HIGH-MUTATION",
                        layer=self.layer,
                        severity=Severity.MEDIUM,
                        file=str(file_path),
                        symbol=node.name,
                        message="High variable mutation count detected; review for logic race or hidden state.",
                        evidence={"mutations": noisy},
                    )
                )
        return findings


class InterproceduralTaintAnalyzer:
    layer = "taint"

    def run(self, file_path: Path, source: str) -> list[Finding]:
        findings: list[Finding] = []
        lines = source.splitlines()
        tainted: set[str] = set()
        calls: deque[tuple[int, str]] = deque()

        for i, line in enumerate(lines, 1):
            if any(src in line for src in SOURCE_PATTERNS) and "=" in line:
                name = line.split("=", 1)[0].strip()
                if name.isidentifier():
                    tainted.add(name)
            for sink in SINK_PATTERNS:
                if sink in line:
                    calls.append((i, line))

        for line_no, line in calls:
            if any(name in line for name in tainted):
                findings.append(
                    Finding(
                        id="TAINT-TO-SINK",
                        layer=self.layer,
                        severity=Severity.HIGH,
                        file=str(file_path),
                        message="Potential untrusted data flow into dangerous sink.",
                        evidence={"line": line_no, "code": line.strip()},
                        autofix_available=False,
                    )
                )
        return findings


class MlAnomalyAnalyzer:
    layer = "ml-anomaly"

    def run(self, findings: list[Finding]) -> list[Finding]:
        if len(findings) < 8:
            return []

        features = np.array([
            [
                4 if f.severity == Severity.CRITICAL else 3 if f.severity == Severity.HIGH else 2 if f.severity == Severity.MEDIUM else 1,
                len(f.message),
                len(json.dumps(f.evidence)),
            ]
            for f in findings
        ])
        model = IsolationForest(random_state=42, contamination=0.15)
        labels = model.fit_predict(features)

        anomalies: list[Finding] = []
        for idx, label in enumerate(labels):
            if label == -1:
                base = findings[idx]
                anomalies.append(
                    Finding(
                        id="ML-ANOMALY",
                        layer=self.layer,
                        severity=Severity.MEDIUM,
                        file=base.file,
                        symbol=base.symbol,
                        message="Anomalous risk pattern detected across analysis layers.",
                        evidence={"source_finding": base.id},
                    )
                )
        return anomalies


class OpaAnalyzer:
    layer = "opa"

    def __init__(self, bundle_path: str = "policy") -> None:
        self.bundle_path = bundle_path

    def run(self, tenant_id: str, input_doc: dict) -> list[Finding]:
        if not os.path.exists(self.bundle_path):
            return [
                Finding(
                    id="OPA-BUNDLE-MISSING",
                    layer=self.layer,
                    severity=Severity.HIGH,
                    file=self.bundle_path,
                    message="OPA policy bundle missing; tenant RBAC cannot be enforced.",
                )
            ]
        try:
            proc = subprocess.run(
                [
                    "opa",
                    "eval",
                    "--fail",
                    "--data",
                    self.bundle_path,
                    "--input",
                    "-",
                    f"data.tenants.{tenant_id}.allow",
                ],
                input=json.dumps(input_doc),
                text=True,
                capture_output=True,
                check=False,
            )
        except FileNotFoundError:
            return [
                Finding(
                    id="OPA-NOT-INSTALLED",
                    layer=self.layer,
                    severity=Severity.HIGH,
                    file="opa",
                    message="OPA binary not found; policy gate bypass risk.",
                )
            ]

        if proc.returncode != 0:
            return [
                Finding(
                    id="OPA-DENY",
                    layer=self.layer,
                    severity=Severity.HIGH,
                    file=self.bundle_path,
                    message="OPA policy denied the action or failed to evaluate.",
                    evidence={"stderr": proc.stderr.strip()},
                )
            ]
        return []
