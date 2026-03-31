from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.task import TaskCreate, TaskRead, TaskStatusMove, TaskUpdate
from app.services.task_service import create_task, delete_task, list_tasks, move_task, update_task

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


@router.patch("/{task_id}", response_model=TaskRead)
def update_task_route(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
) -> TaskRead:
    return update_task(db=db, task_id=task_id, payload=payload)


@router.delete("/{task_id}", status_code=204)
def delete_task_route(task_id: int, db: Session = Depends(get_db)) -> Response:
    delete_task(db=db, task_id=task_id)
    return Response(status_code=204)
