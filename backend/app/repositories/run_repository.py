from sqlalchemy.orm import Session

from app.models.task_run import TaskRun


class RunRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[TaskRun]:
        return self.db.query(TaskRun).order_by(TaskRun.id.desc()).all()

    def get_by_id(self, run_id: int) -> TaskRun | None:
        return self.db.query(TaskRun).filter(TaskRun.id == run_id).first()
