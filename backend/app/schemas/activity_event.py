from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

EntityType = Literal["task", "project", "agent", "run", "story"]


class ActivityEventCreate(BaseModel):
    entity_type: EntityType
    entity_id: int = Field(gt=0)
    event_type: str = Field(min_length=1, max_length=64)
    payload: dict[str, Any] = Field(default_factory=dict)


class ActivityEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entity_type: EntityType
    entity_id: int
    event_type: str
    payload: dict[str, Any]
    created_at: datetime | None = None
