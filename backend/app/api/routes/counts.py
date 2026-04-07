from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.agent import Agent
from app.models.project import Project
from app.models.story import Story
from app.models.task import Task
from app.models.task_run import TaskRun
from app.schemas.counts import CountsRead

router = APIRouter()


@router.get("", response_model=CountsRead)
def get_counts(db: Session = Depends(get_db)) -> CountsRead:
    return CountsRead(
        tasks=db.query(Task).count(),
        agents=db.query(Agent).count(),
        runs=db.query(TaskRun).count(),
        projects=db.query(Project).count(),
        stories=db.query(Story).count(),
    )
