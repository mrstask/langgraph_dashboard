from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.run import RunCreate, RunRead, RunUpdate
from app.services.run_service import create_run, get_run, list_runs, update_run

router = APIRouter()


@router.get("", response_model=list[RunRead])
def list_runs_route(db: Session = Depends(get_db)) -> list[RunRead]:
    return list_runs(db)


@router.get("/{run_id}", response_model=RunRead)
def get_run_route(run_id: int, db: Session = Depends(get_db)) -> RunRead:
    return get_run(db, run_id)


@router.post("", response_model=RunRead, status_code=201)
def create_run_route(payload: RunCreate, db: Session = Depends(get_db)) -> RunRead:
    return create_run(db, payload)


@router.patch("/{run_id}", response_model=RunRead)
def update_run_route(run_id: int, payload: RunUpdate, db: Session = Depends(get_db)) -> RunRead:
    return update_run(db, run_id, payload)
