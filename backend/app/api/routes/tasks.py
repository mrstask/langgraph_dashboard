from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.task import TaskCreate, TaskRead, TaskStatusMove
from app.services.task_service import create_task, list_tasks, move_task

router = APIRouter()


@router.get("", response_model=list[TaskRead])
def get_tasks(db: Session = Depends(get_db)) -> list[TaskRead]:
    return list_tasks(db)


@router.post("", response_model=TaskRead)
def create_task_route(
    payload: TaskCreate,
    db: Session = Depends(get_db),
) -> TaskRead:
    return create_task(db=db, payload=payload)


@router.post("/{task_id}/move", response_model=TaskRead)
def move_task_route(
    task_id: int,
    payload: TaskStatusMove,
    db: Session = Depends(get_db),
) -> TaskRead:
    return move_task(db=db, task_id=task_id, status=payload.status)
