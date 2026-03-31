from datetime import datetime

from pydantic import BaseModel, Field


class RunRead(BaseModel):
    id: int
    task_id: int
    agent_id: int | None
    pipeline_type: str
    status: str
    started_at: datetime | None = None
    finished_at: datetime | None = None
    output_summary: str | None = None
    output_payload: dict
    error_message: str | None = None
    logs_text: str | None = None


class RunCreate(BaseModel):
    task_id: int
    agent_id: int | None = None
    pipeline_type: str = "dev_team"
    status: str = "running"
    started_at: datetime | None = None
    output_summary: str | None = None
    output_payload: dict = Field(default_factory=dict)
    logs_text: str | None = None


class RunUpdate(BaseModel):
    status: str | None = None
    finished_at: datetime | None = None
    output_summary: str | None = None
    output_payload: dict | None = None
    error_message: str | None = None
    logs_text: str | None = None

