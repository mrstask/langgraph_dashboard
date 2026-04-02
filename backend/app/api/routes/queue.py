from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_db
from app.models.task import Task
from app.models.task_label import TaskLabel
from app.services.task_service import serialize_task
from app.schemas.task import TaskRead

router = APIRouter()


class QueueGroup(BaseModel):
    parent: TaskRead
    subtasks: list[TaskRead]
    total: int
    done: int


@router.get("", response_model=list[QueueGroup])
def get_queue(db: Session = Depends(get_db)) -> list[QueueGroup]:
    """Return all active subtask groups (parent + pending subtasks), ordered for processing."""
    all_tasks = (
        db.query(Task)
        .options(
            joinedload(Task.owner_ref),
            joinedload(Task.task_labels).joinedload(TaskLabel.label),
        )
        .filter(Task.parent_task_id.isnot(None))
        .all()
    )

    # Group subtasks by parent_task_id
    from collections import defaultdict
    groups: dict[int, list[Task]] = defaultdict(list)
    for task in all_tasks:
        groups[task.parent_task_id].append(task)

    if not groups:
        return []

    # Fetch parent tasks
    parent_ids = list(groups.keys())
    parents = (
        db.query(Task)
        .options(
            joinedload(Task.owner_ref),
            joinedload(Task.task_labels).joinedload(TaskLabel.label),
        )
        .filter(Task.id.in_(parent_ids))
        .all()
    )
    parent_map = {p.id: p for p in parents}

    # Build queue groups, ordered by parent priority desc, then parent id asc
    result: list[QueueGroup] = []
    for parent_task in sorted(parents, key=lambda p: (-p.priority, p.id)):
        subtasks = groups[parent_task.id]
        # Order subtasks: queue_position asc (nulls last), then created_at asc
        subtasks_sorted = sorted(
            subtasks,
            key=lambda t: (t.queue_position is None, t.queue_position or 0, t.created_at),
        )
        done_count = sum(1 for t in subtasks if t.status == 5)  # 5 = done
        result.append(QueueGroup(
            parent=serialize_task(parent_task),
            subtasks=[serialize_task(t) for t in subtasks_sorted],
            total=len(subtasks),
            done=done_count,
        ))

    return result
