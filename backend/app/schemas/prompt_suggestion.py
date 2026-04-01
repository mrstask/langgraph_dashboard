from datetime import datetime

from pydantic import BaseModel, Field


class PromptSuggestionRead(BaseModel):
    id: int
    task_id: int
    agent_role: str
    issue_pattern: str
    suggested_instruction: str
    evidence: list
    status: str
    created_at: datetime | None = None


class PromptSuggestionCreate(BaseModel):
    task_id: int
    agent_role: str
    issue_pattern: str
    suggested_instruction: str
    evidence: list = Field(default_factory=list)


class PromptSuggestionUpdate(BaseModel):
    status: str | None = None
