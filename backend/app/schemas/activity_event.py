from datetime import datetime

from pydantic import BaseModel, Field


class ActivityEventRead(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    event_type: str
    payload: dict
    created_at: datetime | None = None


class ActivityEventCreate(BaseModel):
    entity_type: str
    entity_id: int
    event_type: str
    payload: dict = Field(default_factory=dict)
