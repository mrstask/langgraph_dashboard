from datetime import datetime

from pydantic import BaseModel, Field


class AgentCreate(BaseModel):
    name: str
    slug: str | None = None
    description: str | None = None
    status: str = "online"
    agent_type: str = "mock"
    capabilities: list[str] = Field(default_factory=list)
    config: dict | None = None


class AgentRead(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    status: str
    agent_type: str
    capabilities: list[str]
    created_at: datetime
    updated_at: datetime
