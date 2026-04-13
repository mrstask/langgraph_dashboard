from pydantic import BaseModel, Field

from app.schemas.task import TaskRead


class QueueGroup(BaseModel):
    parent: TaskRead
    subtasks: list[TaskRead]
    total: int = Field(ge=0)
    done: int = Field(ge=0)
