from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas._validators import StrippedStr, StrippedStrOrNone


class StoryCreate(BaseModel):
    title: StrippedStr = Field(min_length=1, max_length=255)
    description: StrippedStrOrNone = None


class StoryUpdate(BaseModel):
    title: StrippedStr = Field(min_length=1, max_length=255)
    description: StrippedStrOrNone = None


class StoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime
