from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.activity_event import ActivityEventCreate, ActivityEventRead
from app.services.activity_event_service import create_event, list_task_events

router = APIRouter()


@router.get("", response_model=list[ActivityEventRead])
def list_task_events_route(task_id: int, db: Session = Depends(get_db)) -> list[ActivityEventRead]:
    return list_task_events(db, task_id)


@router.post("", response_model=ActivityEventRead, status_code=201)
def create_event_route(payload: ActivityEventCreate, db: Session = Depends(get_db)) -> ActivityEventRead:
    return create_event(db, payload)
