import json

from sqlalchemy.orm import Session

from app.models.activity_event import ActivityEvent
from app.repositories.activity_event_repository import ActivityEventRepository
from app.schemas.activity_event import ActivityEventCreate, ActivityEventRead


def create_event(db: Session, payload: ActivityEventCreate) -> ActivityEventRead:
    repo = ActivityEventRepository(db)
    event = ActivityEvent(
        entity_type=payload.entity_type,
        entity_id=payload.entity_id,
        event_type=payload.event_type,
        payload_json=json.dumps(payload.payload),
    )
    return _serialize(repo.create(event))


def list_task_events(db: Session, task_id: int) -> list[ActivityEventRead]:
    repo = ActivityEventRepository(db)
    return [_serialize(e) for e in repo.list_by_entity("task", task_id)]


def _serialize(event: ActivityEvent) -> ActivityEventRead:
    return ActivityEventRead(
        id=event.id,
        entity_type=event.entity_type,
        entity_id=event.entity_id,
        event_type=event.event_type,
        payload=json.loads(event.payload_json or "{}"),
        created_at=event.created_at,
    )
