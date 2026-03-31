import json
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.task_run import TaskRun
from app.repositories.run_repository import RunRepository
from app.schemas.run import RunCreate, RunRead, RunUpdate


def list_runs(db: Session) -> list[RunRead]:
    repository = RunRepository(db)
    return [serialize_run(run) for run in repository.list_all()]


def get_run(db: Session, run_id: int) -> RunRead:
    repository = RunRepository(db)
    run = repository.get_by_id(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return serialize_run(run)


def create_run(db: Session, payload: RunCreate) -> RunRead:
    repository = RunRepository(db)
    run = TaskRun(
        task_id=payload.task_id,
        agent_id=payload.agent_id,
        pipeline_type=payload.pipeline_type,
        status=payload.status,
        started_at=payload.started_at or datetime.now(timezone.utc),
        output_summary=payload.output_summary,
        output_payload_json=json.dumps(payload.output_payload),
        logs_text=payload.logs_text,
    )
    return serialize_run(repository.create(run))


def update_run(db: Session, run_id: int, payload: RunUpdate) -> RunRead:
    repository = RunRepository(db)
    run = repository.get_by_id(run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    fields = payload.model_dump(exclude_none=True)
    if "output_payload" in fields:
        fields["output_payload_json"] = json.dumps(fields.pop("output_payload"))
    return serialize_run(repository.update(run, **fields))


def serialize_run(run: TaskRun) -> RunRead:
    return RunRead(
        id=run.id,
        task_id=run.task_id,
        agent_id=run.agent_id,
        pipeline_type=run.pipeline_type,
        status=run.status,
        started_at=run.started_at,
        finished_at=run.finished_at,
        output_summary=run.output_summary,
        output_payload=json.loads(run.output_payload_json or "{}"),
        error_message=run.error_message,
        logs_text=run.logs_text,
    )
