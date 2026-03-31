from datetime import datetime

from pydantic import BaseModel, Field


class StoryRead(BaseModel):
    id: int
    title: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime


class StoryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None


class StoryUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
