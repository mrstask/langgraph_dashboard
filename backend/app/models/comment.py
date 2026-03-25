from sqlalchemy import Column, ForeignKey, Integer, String, Text

from app.db.base import Base


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    author_type = Column(String(32), default="human", nullable=False)
    author_name = Column(String(255), nullable=False)
    body = Column(Text(), nullable=False)
