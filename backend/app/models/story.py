from sqlalchemy import Column, Integer, String, Text

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Story(TimestampMixin, Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text(), nullable=True)
