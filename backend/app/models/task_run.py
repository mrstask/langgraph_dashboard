from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.db.base import Base
from app.models.mixins import TimestampMixin


class TaskRun(TimestampMixin, Base):
    __tablename__ = "task_runs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False)
    pipeline_type = Column(String(64), default="mock", nullable=False)
    status = Column(String(32), default="queued", index=True, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    output_summary = Column(Text(), nullable=True)
    output_payload_json = Column(Text(), default="{}", nullable=False)
    error_message = Column(Text(), nullable=True)
    logs_text = Column(Text(), nullable=True)
