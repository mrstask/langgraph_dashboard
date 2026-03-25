from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.project import ProjectCreate, ProjectRead
from app.services.project_service import create_project, list_projects

router = APIRouter()


@router.get("", response_model=list[ProjectRead])
def list_projects_route(db: Session = Depends(get_db)) -> list[ProjectRead]:
    return list_projects(db)


@router.post("", response_model=ProjectRead)
def create_project_route(payload: ProjectCreate, db: Session = Depends(get_db)) -> ProjectRead:
    return create_project(db=db, payload=payload)
