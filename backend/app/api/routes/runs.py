from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.run import RunRead
from app.services.run_service import get_run, list_runs

router = APIRouter()


@router.get("", response_model=list[RunRead])
def list_runs_route(db: Session = Depends(get_db)) -> list[RunRead]:
    return list_runs(db)


@router.get("/{run_id}", response_model=RunRead)
def get_run_route(run_id: int, db: Session = Depends(get_db)) -> RunRead:
    return get_run(db, run_id)
