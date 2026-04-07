from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.story import Story
from app.repositories.story_repository import StoryRepository
from app.schemas.story import StoryCreate, StoryRead, StoryUpdate


def serialize_story(story: Story) -> StoryRead:
    return StoryRead(
        id=story.id,
        title=story.title,
        description=story.description,
        created_at=story.created_at,
        updated_at=story.updated_at,
    )


def list_stories(db: Session) -> list[StoryRead]:
    repo = StoryRepository(db)
    return [serialize_story(s) for s in repo.list_all()]


def create_story(db: Session, payload: StoryCreate) -> StoryRead:
    repo = StoryRepository(db)
    story = Story(
        title=payload.title,
        description=payload.description,
    )
    return serialize_story(repo.create(story))


def update_story(db: Session, story_id: int, payload: StoryUpdate) -> StoryRead:
    repo = StoryRepository(db)
    story = repo.get_by_id(story_id)
    if story is None:
        raise HTTPException(status_code=404, detail="Story not found")
    updated = repo.update(
        story=story,
        title=payload.title,
        description=payload.description,
    )
    return serialize_story(updated)


def delete_story(db: Session, story_id: int) -> None:
    repo = StoryRepository(db)
    story = repo.get_by_id(story_id)
    if story is None:
        raise HTTPException(status_code=404, detail="Story not found")
    repo.delete(story)
