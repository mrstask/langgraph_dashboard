from sqlalchemy import Column, ForeignKey, Integer, String, Text

from app.db.base import Base
from app.models.mixins import TimestampMixin


class PromptSuggestion(TimestampMixin, Base):
    __tablename__ = "prompt_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, index=True)
    agent_role = Column(String(64), nullable=False, index=True)
    issue_pattern = Column(Text(), nullable=False)
    suggested_instruction = Column(Text(), nullable=False)
    evidence = Column(Text(), default="[]", nullable=False)  # JSON list of event summaries
    status = Column(String(32), default="open", nullable=False, index=True)  # open | applied | dismissed
