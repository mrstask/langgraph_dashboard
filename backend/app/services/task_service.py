from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.constants.task_metadata import (
    TASK_PRIORITIES,
    TASK_PRIORITY_TO_CODE,
    TASK_STATUSES,
    TASK_STATUS_TO_CODE,
)
from app.models.task import Task
from app.repositories.task_repository import TaskRepository
from app.schemas.task import TaskCreate, TaskRead, TaskStatusMove, TaskUpdate


def delete_task(db: Session, task_id: int) -> None:
    repository = TaskRepository(db)
    task = repository.get_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    repository.delete(task)


def list_tasks(db: Session) -> list[TaskRead]:
    repository = TaskRepository(db)
    return [serialize_task(task) for task in repository.list_all()]


def move_task(db: Session, task_id: int, payload: TaskStatusMove) -> TaskRead:
    repository = TaskRepository(db)
    task = repository.get_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    updated_task = repository.update_status(task=task, status=TASK_STATUS_TO_CODE[payload.status])
    return serialize_task(updated_task)


def create_task(db: Session, payload: TaskCreate) -> TaskRead:
    repository = TaskRepository(db)

    owner = repository.get_or_create_owner(payload.human_owner)

    task = Task(
        project_id=payload.project_id,
        title=payload.title,
        description=payload.description,
        short_description=payload.short_description,
        implementation_description=payload.implementation_description,
        definition_of_done=payload.definition_of_done,
        status=TASK_STATUS_TO_CODE[payload.status],
        priority=TASK_PRIORITY_TO_CODE[payload.priority],
        assigned_agent_id=payload.assigned_agent_id,
        owner_id=owner.id if owner else None,
        due_date=payload.due_date,
        story_id=payload.story_id,
        parent_task_id=payload.parent_task_id,
        queue_position=payload.queue_position,
    )
    created_task = repository.create(task=task, label_names=payload.labels)
    return serialize_task(created_task)


def update_task(db: Session, task_id: int, payload: TaskUpdate) -> TaskRead:
    repository = TaskRepository(db)
    task = repository.get_by_id(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    owner = repository.get_or_create_owner(payload.human_owner)

    updated_task = repository.update(
        task=task,
        title=payload.title,
        description=payload.description,
        short_description=payload.short_description,
        implementation_description=payload.implementation_description,
        definition_of_done=payload.definition_of_done,
        status=TASK_STATUS_TO_CODE[payload.status],
        priority=TASK_PRIORITY_TO_CODE[payload.priority],
        assigned_agent_id=payload.assigned_agent_id,
        owner_id=owner.id if owner else None,
        label_names=payload.labels,
        story_id=payload.story_id,
        parent_task_id=payload.parent_task_id,
        queue_position=payload.queue_position,
    )
    return serialize_task(updated_task)


def serialize_task(task) -> TaskRead:
    if task.status not in TASK_STATUSES:
        raise HTTPException(status_code=500, detail=f"Invalid stored task status: {task.status}")
    if task.priority not in TASK_PRIORITIES:
        raise HTTPException(status_code=500, detail=f"Invalid stored task priority: {task.priority}")

    return TaskRead(
        id=task.id,
        project_id=task.project_id,
        title=task.title,
        description=task.description,
        short_description=task.short_description,
        implementation_description=task.implementation_description,
        definition_of_done=task.definition_of_done,
        status=TASK_STATUSES[task.status],
        priority=TASK_PRIORITIES[task.priority],
        assigned_agent_id=task.assigned_agent_id,
        human_owner=task.owner_ref.name if task.owner_ref else None,
        labels=[task_label.label.name for task_label in task.task_labels if task_label.label],
        due_date=task.due_date,
        story_id=task.story_id,
        parent_task_id=task.parent_task_id,
        queue_position=task.queue_position,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )
