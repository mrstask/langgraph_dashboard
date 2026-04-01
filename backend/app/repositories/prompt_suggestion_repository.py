from sqlalchemy.orm import Session

from app.models.prompt_suggestion import PromptSuggestion


class PromptSuggestionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[PromptSuggestion]:
        return self.db.query(PromptSuggestion).order_by(PromptSuggestion.id.desc()).all()

    def list_by_status(self, status: str) -> list[PromptSuggestion]:
        return (
            self.db.query(PromptSuggestion)
            .filter(PromptSuggestion.status == status)
            .order_by(PromptSuggestion.id.desc())
            .all()
        )

    def get_by_id(self, suggestion_id: int) -> PromptSuggestion | None:
        return self.db.query(PromptSuggestion).filter(PromptSuggestion.id == suggestion_id).first()

    def create(self, suggestion: PromptSuggestion) -> PromptSuggestion:
        self.db.add(suggestion)
        self.db.commit()
        self.db.refresh(suggestion)
        return suggestion

    def update(self, suggestion: PromptSuggestion, **fields) -> PromptSuggestion:
        for key, value in fields.items():
            setattr(suggestion, key, value)
        self.db.add(suggestion)
        self.db.commit()
        self.db.refresh(suggestion)
        return suggestion
