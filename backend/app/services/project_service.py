from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.project import Project
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectRead


def list_projects(db: Session) -> list[ProjectRead]:
    repository = ProjectRepository(db)
    return [serialize_project(project) for project in repository.list_all()]


def create_project(db: Session, payload: ProjectCreate) -> ProjectRead:
    repository = ProjectRepository(db)

    name = payload.name.strip()
    key = payload.key.strip().upper()
    if not name:
        raise HTTPException(status_code=400, detail="Project name is required")
    if not key:
        raise HTTPException(status_code=400, detail="Project key is required")
    if repository.get_by_key(key) is not None:
        raise HTTPException(status_code=400, detail="Project key already exists")

    project = Project(
        key=key,
        name=name,
        description=payload.description.strip() if payload.description else None,
    )
    return serialize_project(repository.create(project))


def serialize_project(project: Project) -> ProjectRead:
    return ProjectRead(
        id=project.id,
        key=project.key,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )
