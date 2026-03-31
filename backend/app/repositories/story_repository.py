from sqlalchemy.orm import Session

from app.models.story import Story


class StoryRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[Story]:
        return self.db.query(Story).order_by(Story.updated_at.desc()).all()

    def get_by_id(self, story_id: int) -> Story | None:
        return self.db.query(Story).filter(Story.id == story_id).first()

    def create(self, story: Story) -> Story:
        self.db.add(story)
        self.db.commit()
        self.db.refresh(story)
        return story

    def update(self, story: Story, title: str, description: str | None) -> Story:
        story.title = title
        story.description = description
        self.db.add(story)
        self.db.commit()
        self.db.refresh(story)
        return story

    def delete(self, story: Story) -> None:
        self.db.delete(story)
        self.db.commit()
