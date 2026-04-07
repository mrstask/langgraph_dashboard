from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas._validators import StrippedStr, StrippedStrOrNone

AgentStatus = Literal["online", "offline", "busy", "error"]
AgentType = Literal["mock", "langchain", "langgraph", "custom"]


class AgentCreate(BaseModel):
    name: StrippedStr = Field(min_length=1, max_length=255)
    slug: StrippedStrOrNone = None
    description: StrippedStrOrNone = None
    status: AgentStatus = "online"
    agent_type: AgentType = "mock"
    capabilities: list[str] = Field(default_factory=list)
    config: dict[str, Any] | None = None


class AgentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    description: str | None = None
    status: AgentStatus
    agent_type: AgentType
    capabilities: list[str]
    config: dict[str, Any]
    created_at: datetime
    updated_at: datetime
