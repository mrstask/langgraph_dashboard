from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas._validators import StrippedStr, StrippedStrOrNone, UppercaseStr


class ProjectCreate(BaseModel):
    key: UppercaseStr = Field(min_length=1, max_length=32, pattern=r"^[A-Z][A-Z0-9_]*$")
    name: StrippedStr = Field(min_length=1, max_length=255)
    description: StrippedStrOrNone = None
    root_path: StrippedStrOrNone = None


class ProjectUpdate(BaseModel):
    name: StrippedStr | None = Field(default=None, min_length=1, max_length=255)
    description: StrippedStrOrNone = None
    root_path: StrippedStrOrNone = None


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    key: str
    name: str
    description: str | None = None
    root_path: str | None = None
    created_at: datetime
    updated_at: datetime
