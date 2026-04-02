from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import backref, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Task(TimestampMixin, Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text(), nullable=True)
    short_description = Column(Text(), nullable=True)
    implementation_description = Column(Text(), nullable=True)
    status = Column(Integer, nullable=False, index=True)
    priority = Column(Integer, nullable=False)
    assigned_agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("owners.id"), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    story_id = Column(Integer, ForeignKey("stories.id"), nullable=True)
    definition_of_done = Column(Text(), nullable=True)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    queue_position = Column(Integer, nullable=True)

    owner_ref = relationship("Owner")
    task_labels = relationship("TaskLabel", cascade="all, delete-orphan")
    story_ref = relationship("Story")
    subtasks = relationship("Task", backref=backref("parent", remote_side="Task.id"))
