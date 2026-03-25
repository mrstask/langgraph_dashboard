from alembic import command
from alembic.config import Config

from app.db.session import BASE_DIR, SessionLocal
from app.models import (
    ActivityEvent,
    Agent,
    Comment,
    Label,
    Owner,
    Project,
    Task,
    TaskLabel,
    TaskRun,
)
from app.services.seed_data import seed_database


def init_db() -> None:
    alembic_config = Config(str(BASE_DIR / "alembic.ini"))
    command.upgrade(alembic_config, "head")

    with SessionLocal() as db:
        seed_database(db)
