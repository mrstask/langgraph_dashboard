from sqlalchemy import Column, Integer, String, Text

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Project(TimestampMixin, Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(32), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text(), nullable=True)
    root_path = Column(Text(), nullable=True)
