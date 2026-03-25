from sqlalchemy import Column, Integer, String

from app.db.base import Base


class Owner(Base):
    __tablename__ = "owners"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False, index=True)

