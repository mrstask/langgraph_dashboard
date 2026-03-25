from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    key: str
    name: str
    description: str | None = None


class ProjectRead(BaseModel):
    id: int
    key: str
    name: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime
