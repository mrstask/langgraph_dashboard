from datetime import datetime

from pydantic import BaseModel


class RunRead(BaseModel):
    id: int
    task_id: int
    agent_id: int
    pipeline_type: str
    status: str
    started_at: datetime | None = None
    finished_at: datetime | None = None
    output_summary: str | None = None
    output_payload: dict
    error_message: str | None = None
    logs_text: str | None = None

