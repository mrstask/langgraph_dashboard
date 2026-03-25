from fastapi import APIRouter, HTTPException

from app.schemas.run import RunRead
from app.services.seed_data import seeded_runs

router = APIRouter()


@router.get("", response_model=list[RunRead])
def list_runs() -> list[RunRead]:
    return seeded_runs()


@router.get("/{run_id}", response_model=RunRead)
def get_run(run_id: int) -> RunRead:
    run = next((candidate for candidate in seeded_runs() if candidate.id == run_id), None)
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

