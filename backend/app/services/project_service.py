from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.project import Project
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate


def list_projects(db: Session) -> list[ProjectRead]:
    repository = ProjectRepository(db)
    return [serialize_project(project) for project in repository.list_all()]


def create_project(db: Session, payload: ProjectCreate) -> ProjectRead:
    repository = ProjectRepository(db)

    if repository.get_by_key(payload.key) is not None:
        raise HTTPException(status_code=400, detail="Project key already exists")

    project = Project(
        key=payload.key,
        name=payload.name,
        description=payload.description,
        root_path=payload.root_path,
    )
    return serialize_project(repository.create(project))


def update_project(db: Session, project_id: int, payload: ProjectUpdate) -> ProjectRead:
    repository = ProjectRepository(db)
    project = repository.get_by_id(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.name is not None:
        project.name = payload.name
    if payload.description is not None:
        project.description = payload.description
    if payload.root_path is not None:
        project.root_path = payload.root_path

    return serialize_project(repository.update(project))


def serialize_project(project: Project) -> ProjectRead:
    return ProjectRead(
        id=project.id,
        key=project.key,
        name=project.name,
        description=project.description,
        root_path=project.root_path,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )
