from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.prompt_suggestion import PromptSuggestionCreate, PromptSuggestionRead, PromptSuggestionUpdate
from app.services.prompt_suggestion_service import create_suggestion, list_suggestions, update_suggestion

router = APIRouter()


@router.get("", response_model=list[PromptSuggestionRead])
def list_suggestions_route(
    status: str | None = None,
    db: Session = Depends(get_db),
) -> list[PromptSuggestionRead]:
    return list_suggestions(db, status)


@router.post("", response_model=PromptSuggestionRead, status_code=201)
def create_suggestion_route(payload: PromptSuggestionCreate, db: Session = Depends(get_db)) -> PromptSuggestionRead:
    return create_suggestion(db, payload)


@router.patch("/{suggestion_id}", response_model=PromptSuggestionRead)
def update_suggestion_route(
    suggestion_id: int,
    payload: PromptSuggestionUpdate,
    db: Session = Depends(get_db),
) -> PromptSuggestionRead:
    return update_suggestion(db, suggestion_id, payload)
