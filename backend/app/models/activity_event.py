from sqlalchemy import Column, Integer, String, Text

from app.db.base import Base
from app.models.mixins import TimestampMixin


class ActivityEvent(TimestampMixin, Base):
    __tablename__ = "activity_events"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(64), index=True, nullable=False)
    entity_id = Column(Integer, index=True, nullable=False)
    event_type = Column(String(64), nullable=False)
    payload_json = Column(Text(), default="{}", nullable=False)
