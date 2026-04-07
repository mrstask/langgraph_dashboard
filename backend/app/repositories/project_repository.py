from sqlalchemy.orm import Session

from app.models.project import Project


class ProjectRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[Project]:
        return self.db.query(Project).order_by(Project.updated_at.desc()).all()

    def get_by_key(self, key: str) -> Project | None:
        return self.db.query(Project).filter(Project.key == key).first()

    def get_by_id(self, project_id: int) -> Project | None:
        return self.db.query(Project).filter(Project.id == project_id).first()

    def create(self, project: Project) -> Project:
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def update(self, project: Project) -> Project:
        self.db.commit()
        self.db.refresh(project)
        return project
