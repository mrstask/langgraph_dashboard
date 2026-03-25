from sqlalchemy.orm import Session, joinedload

from app.models.label import Label
from app.models.owner import Owner
from app.models.task import Task
from app.models.task_label import TaskLabel


class TaskRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[Task]:
        return (
            self.db.query(Task)
            .options(
                joinedload(Task.owner_ref),
                joinedload(Task.task_labels).joinedload(TaskLabel.label),
            )
            .order_by(Task.updated_at.desc())
            .all()
        )

    def get_by_id(self, task_id: int) -> Task | None:
        return (
            self.db.query(Task)
            .options(
                joinedload(Task.owner_ref),
                joinedload(Task.task_labels).joinedload(TaskLabel.label),
            )
            .filter(Task.id == task_id)
            .first()
        )

    def get_or_create_owner(self, name: str | None) -> Owner | None:
        if not name:
            return None
        owner = self.db.query(Owner).filter(Owner.name == name).first()
        if owner is None:
            owner = Owner(name=name)
            self.db.add(owner)
            self.db.flush()
        return owner

    def get_or_create_label(self, name: str) -> Label:
        label = self.db.query(Label).filter(Label.name == name).first()
        if label is None:
            label = Label(name=name)
            self.db.add(label)
            self.db.flush()
        return label

    def update_status(self, task: Task, status: str) -> Task:
        task.status = status
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def create(self, task: Task, label_names: list[str]) -> Task:
        self.db.add(task)
        self.db.flush()

        for label_name in label_names:
            label = self.get_or_create_label(label_name)
            task.task_labels.append(TaskLabel(label_id=label.id))

        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return self.get_by_id(task.id) or task
