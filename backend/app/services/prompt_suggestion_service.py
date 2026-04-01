import json

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.prompt_suggestion import PromptSuggestion
from app.repositories.prompt_suggestion_repository import PromptSuggestionRepository
from app.schemas.prompt_suggestion import PromptSuggestionCreate, PromptSuggestionRead, PromptSuggestionUpdate


def list_suggestions(db: Session, status: str | None = None) -> list[PromptSuggestionRead]:
    repo = PromptSuggestionRepository(db)
    rows = repo.list_by_status(status) if status else repo.list_all()
    return [_serialize(r) for r in rows]


def create_suggestion(db: Session, payload: PromptSuggestionCreate) -> PromptSuggestionRead:
    repo = PromptSuggestionRepository(db)
    suggestion = PromptSuggestion(
        task_id=payload.task_id,
        agent_role=payload.agent_role,
        issue_pattern=payload.issue_pattern,
        suggested_instruction=payload.suggested_instruction,
        evidence=json.dumps(payload.evidence),
        status="open",
    )
    return _serialize(repo.create(suggestion))


def update_suggestion(db: Session, suggestion_id: int, payload: PromptSuggestionUpdate) -> PromptSuggestionRead:
    repo = PromptSuggestionRepository(db)
    suggestion = repo.get_by_id(suggestion_id)
    if suggestion is None:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    fields = payload.model_dump(exclude_none=True)
    return _serialize(repo.update(suggestion, **fields))


def _serialize(s: PromptSuggestion) -> PromptSuggestionRead:
    return PromptSuggestionRead(
        id=s.id,
        task_id=s.task_id,
        agent_role=s.agent_role,
        issue_pattern=s.issue_pattern,
        suggested_instruction=s.suggested_instruction,
        evidence=json.loads(s.evidence or "[]"),
        status=s.status,
        created_at=s.created_at,
    )
