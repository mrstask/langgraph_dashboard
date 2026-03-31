from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.story import StoryCreate, StoryRead, StoryUpdate
from app.services.story_service import create_story, delete_story, list_stories, update_story

router = APIRouter()


@router.get("", response_model=list[StoryRead])
def get_stories(db: Session = Depends(get_db)) -> list[StoryRead]:
    return list_stories(db)


@router.post("", response_model=StoryRead)
def create_story_route(payload: StoryCreate, db: Session = Depends(get_db)) -> StoryRead:
    return create_story(db=db, payload=payload)


@router.patch("/{story_id}", response_model=StoryRead)
def update_story_route(story_id: int, payload: StoryUpdate, db: Session = Depends(get_db)) -> StoryRead:
    return update_story(db=db, story_id=story_id, payload=payload)


@router.delete("/{story_id}", status_code=204)
def delete_story_route(story_id: int, db: Session = Depends(get_db)) -> Response:
    delete_story(db=db, story_id=story_id)
    return Response(status_code=204)
