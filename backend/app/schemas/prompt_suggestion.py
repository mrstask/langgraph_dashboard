from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

SuggestionStatus = Literal["open", "applied", "dismissed"]


class PromptSuggestionCreate(BaseModel):
    task_id: int = Field(gt=0)
    agent_role: str = Field(min_length=1, max_length=64)
    issue_pattern: str = Field(min_length=1)
    suggested_instruction: str = Field(min_length=1)
    evidence: list[dict[str, Any]] = Field(default_factory=list)


class PromptSuggestionUpdate(BaseModel):
    status: SuggestionStatus | None = None


class PromptSuggestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    agent_role: str
    issue_pattern: str
    suggested_instruction: str
    evidence: list[dict[str, Any]]
    status: SuggestionStatus
    created_at: datetime | None = None
