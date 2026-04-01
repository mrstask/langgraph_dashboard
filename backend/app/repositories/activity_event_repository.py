from sqlalchemy.orm import Session

from app.models.activity_event import ActivityEvent


class ActivityEventRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_entity(self, entity_type: str, entity_id: int) -> list[ActivityEvent]:
        return (
            self.db.query(ActivityEvent)
            .filter(ActivityEvent.entity_type == entity_type, ActivityEvent.entity_id == entity_id)
            .order_by(ActivityEvent.id.asc())
            .all()
        )

    def create(self, event: ActivityEvent) -> ActivityEvent:
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event
