from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.constants.task_metadata import TaskPriorityName, TaskStatusName
from app.schemas._validators import NormalizedLabels, StrippedStr, StrippedStrOrNone


class TaskCreate(BaseModel):
    project_id: int = Field(gt=0)
    title: StrippedStr = Field(min_length=1, max_length=255)
    description: StrippedStrOrNone = None
    short_description: StrippedStrOrNone = None
    implementation_description: StrippedStrOrNone = None
    definition_of_done: StrippedStrOrNone = None
    status: TaskStatusName
    priority: TaskPriorityName
    assigned_agent_id: int | None = Field(default=None, gt=0)
    human_owner: StrippedStrOrNone = None
    labels: NormalizedLabels = Field(default_factory=list)
    due_date: datetime | None = None
    story_id: int | None = Field(default=None, gt=0)
    parent_task_id: int | None = Field(default=None, gt=0)
    queue_position: int | None = Field(default=None, ge=0)


class TaskUpdate(BaseModel):
    title: StrippedStr = Field(min_length=1, max_length=255)
    description: StrippedStrOrNone = None
    short_description: StrippedStrOrNone = None
    implementation_description: StrippedStrOrNone = None
    definition_of_done: StrippedStrOrNone = None
    status: TaskStatusName
    priority: TaskPriorityName
    assigned_agent_id: int | None = Field(default=None, gt=0)
    human_owner: StrippedStrOrNone = None
    labels: NormalizedLabels = Field(default_factory=list)
    due_date: datetime | None = None
    story_id: int | None = Field(default=None, gt=0)
    parent_task_id: int | None = Field(default=None, gt=0)
    queue_position: int | None = Field(default=None, ge=0)


class TaskStatusMove(BaseModel):
    status: TaskStatusName


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    title: str
    description: str | None = None
    short_description: str | None = None
    implementation_description: str | None = None
    definition_of_done: str | None = None
    status: TaskStatusName
    priority: TaskPriorityName
    assigned_agent_id: int | None = None
    human_owner: str | None = None
    labels: list[str]
    due_date: datetime | None = None
    story_id: int | None = None
    parent_task_id: int | None = None
    queue_position: int | None = None
    created_at: datetime
    updated_at: datetime
