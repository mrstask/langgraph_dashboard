from datetime import datetime

from pydantic import BaseModel, Field


class TaskRead(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None = None
    short_description: str | None = None
    implementation_description: str | None = None
    definition_of_done: str | None = None
    status: str
    priority: str
    assigned_agent_id: int | None = None
    human_owner: str | None = None
    labels: list[str]
    due_date: datetime | None = None
    story_id: int | None = None
    parent_task_id: int | None = None
    created_at: datetime
    updated_at: datetime


class TaskStatusMove(BaseModel):
    status: str


class TaskCreate(BaseModel):
    project_id: int
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    short_description: str | None = None
    implementation_description: str | None = None
    definition_of_done: str | None = None
    status: str
    priority: str
    assigned_agent_id: int | None = None
    human_owner: str | None = None
    labels: list[str] = Field(default_factory=list)
    due_date: datetime | None = None
    story_id: int | None = None
    parent_task_id: int | None = None


class TaskUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    short_description: str | None = None
    implementation_description: str | None = None
    definition_of_done: str | None = None
    status: str
    priority: str
    assigned_agent_id: int | None = None
    human_owner: str | None = None
    labels: list[str] = Field(default_factory=list)
    due_date: datetime | None = None
    story_id: int | None = None
    parent_task_id: int | None = None
