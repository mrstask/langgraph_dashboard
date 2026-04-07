from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

RunStatus = Literal["queued", "running", "completed", "failed", "cancelled"]
PipelineType = Literal["mock", "dev_team", "langchain", "langgraph"]


class RunCreate(BaseModel):
    task_id: int = Field(gt=0)
    agent_id: int | None = Field(default=None, gt=0)
    pipeline_type: PipelineType = "dev_team"
    status: RunStatus = "running"
    started_at: datetime | None = None
    output_summary: str | None = None
    output_payload: dict[str, Any] = Field(default_factory=dict)
    logs_text: str | None = None


class RunUpdate(BaseModel):
    status: RunStatus | None = None
    finished_at: datetime | None = None
    output_summary: str | None = None
    output_payload: dict[str, Any] | None = None
    error_message: str | None = None
    logs_text: str | None = None


class RunRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    agent_id: int | None = None
    pipeline_type: PipelineType
    status: RunStatus
    started_at: datetime | None = None
    finished_at: datetime | None = None
    output_summary: str | None = None
    output_payload: dict[str, Any]
    error_message: str | None = None
    logs_text: str | None = None
    created_at: datetime
    updated_at: datetime
