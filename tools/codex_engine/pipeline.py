from __future__ import annotations

import json
import subprocess
from pathlib import Path

from pydantic import ValidationError

from .analyzers import (
    InterproceduralTaintAnalyzer,
    MlAnomalyAnalyzer,
    OpaAnalyzer,
    PythonAstAnalyzer,
    SsaAnalyzer,
    TypeScriptAstAnalyzer,
)
from .models import Finding, LLMReview, PipelineReport


class CodexPipeline:
    def __init__(self, mode: str, tenant_id: str = "default") -> None:
        self.mode = mode
        self.tenant_id = tenant_id
        self.py_ast = PythonAstAnalyzer()
        self.ts_ast = TypeScriptAstAnalyzer()
        self.ssa = SsaAnalyzer()
        self.taint = InterproceduralTaintAnalyzer()
        self.ml = MlAnomalyAnalyzer()
        self.opa = OpaAnalyzer()

    def _target_files(self) -> list[Path]:
        if self.mode == "incremental":
            proc = subprocess.run(
                ["git", "diff", "--name-only", "HEAD~1..HEAD"],
                text=True,
                capture_output=True,
                check=False,
            )
            names = [n.strip() for n in proc.stdout.splitlines() if n.strip()]
            return [Path(n) for n in names if Path(n).suffix in {".py", ".ts", ".tsx", ".js", ".jsx"}]

        return [
            p
            for p in Path(".").rglob("*")
            if p.suffix in {".py", ".ts", ".tsx", ".js", ".jsx"} and ".git" not in p.parts and "node_modules" not in p.parts
        ]

    def _ollama_review(self, findings: list[Finding]) -> LLMReview | None:
        prompt = {
            "task": "security and architecture review",
            "constraints": "return strict JSON matching schema",
            "findings": [f.model_dump() for f in findings[:50]],
        }
        try:
            proc = subprocess.run(
                ["ollama", "run", "llama3.1:8b", json.dumps(prompt)],
                text=True,
                capture_output=True,
                check=False,
            )
        except FileNotFoundError:
            return None
        if proc.returncode != 0:
            return None
        try:
            payload = json.loads(proc.stdout)
            return LLMReview.model_validate(payload)
        except (json.JSONDecodeError, ValidationError):
            return None

    def run(self) -> PipelineReport:
        findings: list[Finding] = []
        scanned = []

        for file_path in self._target_files():
            if not file_path.exists():
                continue
            scanned.append(str(file_path))
            src = file_path.read_text(encoding="utf-8", errors="ignore")
            if file_path.suffix == ".py":
                findings.extend(self.py_ast.run(file_path, src))
                findings.extend(self.ssa.run(file_path, src))
            else:
                findings.extend(self.ts_ast.run(file_path, src))
            findings.extend(self.taint.run(file_path, src))

        findings.extend(self.ml.run(findings))
        findings.extend(
            self.opa.run(
                tenant_id=self.tenant_id,
                input_doc={"tenant_id": self.tenant_id, "action": "repo.scan", "mode": self.mode},
            )
        )

        report = PipelineReport(mode=self.mode, scanned_files=scanned, findings=findings, llm_review=self._ollama_review(findings))
        return report
