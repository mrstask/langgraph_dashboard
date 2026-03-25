from sqlalchemy import Column, Integer, String, Text

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Agent(TimestampMixin, Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(64), unique=True, index=True, nullable=False)
    description = Column(Text(), nullable=True)
    status = Column(String(32), default="online", nullable=False)
    agent_type = Column(String(64), default="mock", nullable=False)
    capabilities_json = Column(Text(), default="[]", nullable=False)
    config_json = Column(Text(), default="{}", nullable=False)
