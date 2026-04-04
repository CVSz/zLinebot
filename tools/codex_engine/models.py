from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, ConfigDict


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class Finding(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    layer: str
    severity: Severity
    file: str
    symbol: str | None = None
    message: str
    evidence: dict[str, Any] = Field(default_factory=dict)
    autofix_available: bool = False


class LLMReview(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str
    risk_score: int = Field(ge=0, le=100)
    findings: list[Finding] = Field(default_factory=list)


class PipelineReport(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mode: str
    scanned_files: list[str]
    findings: list[Finding]
    llm_review: LLMReview | None = None

    @property
    def blocking_findings(self) -> list[Finding]:
        return [f for f in self.findings if f.severity in {Severity.CRITICAL, Severity.HIGH}]
