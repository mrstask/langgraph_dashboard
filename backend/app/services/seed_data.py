import json
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.constants.task_metadata import TASK_PRIORITY_TO_CODE, TASK_STATUS_TO_CODE
from app.models.agent import Agent
from app.models.label import Label
from app.models.owner import Owner
from app.models.project import Project
from app.models.task import Task
from app.models.task_label import TaskLabel
from app.schemas.agent import AgentRead
from app.schemas.project import ProjectRead
from app.schemas.run import RunRead
from app.schemas.task import TaskRead

NOW = datetime.now(timezone.utc)

_PROJECTS = [
    ProjectRead(
        id=1,
        key="OPS",
        name="Operations Console",
        description="Core delivery dashboard for agent-backed execution.",
        created_at=NOW - timedelta(days=12),
        updated_at=NOW - timedelta(hours=4),
    ),
    ProjectRead(
        id=2,
        key="RND",
        name="Research Pipelines",
        description="Pipeline experiments and future graph orchestration work.",
        created_at=NOW - timedelta(days=21),
        updated_at=NOW - timedelta(days=1),
    ),
]

_AGENTS = [
    AgentRead(
        id=1,
        name="PM",
        slug="pm:architect-review",
        description="Project Manager — user stories, strategic reviews, and task lifecycle decisions.",
        status="online",
        agent_type="dev_team",
        capabilities=["user-story", "architect-review", "dev-review", "testing-review"],
        created_at=NOW - timedelta(days=10),
        updated_at=NOW - timedelta(minutes=40),
    ),
    AgentRead(
        id=2,
        name="Architect",
        slug="architect:design",
        description="Produces skeleton files and reviews developer implementation for correctness.",
        status="online",
        agent_type="dev_team",
        capabilities=["design", "dev-review"],
        created_at=NOW - timedelta(days=9),
        updated_at=NOW - timedelta(minutes=5),
    ),
    AgentRead(
        id=3,
        name="Developer",
        slug="developer:implement",
        description="Implements skeleton files produced by the Architect.",
        status="busy",
        agent_type="dev_team",
        capabilities=["implement", "review"],
        created_at=NOW - timedelta(days=8),
        updated_at=NOW - timedelta(hours=1),
    ),
    AgentRead(
        id=4,
        name="Tester",
        slug="tester:unit-tests",
        description="Writes pytest unit and integration tests, runs CI, and commits on green.",
        status="online",
        agent_type="dev_team",
        capabilities=["unit-tests", "integration-tests", "ci"],
        created_at=NOW - timedelta(days=7),
        updated_at=NOW - timedelta(hours=2),
    ),
]

_TASKS = [
    TaskRead(
        id=1,
        project_id=1,
        title="Define Kanban shell layout",
        description="Create sidebar, top bar, and board framing.",
        status="running",
        priority="high",
        assigned_agent_id=2,
        human_owner="Stanislav",
        labels=["ui", "layout"],
        due_date=NOW + timedelta(days=2),
        created_at=NOW - timedelta(days=3),
        updated_at=NOW - timedelta(minutes=20),
    ),
    TaskRead(
        id=2,
        project_id=1,
        title="Model agent run boundaries",
        description="Separate task lifecycle from orchestration lifecycle.",
        status="review",
        priority="critical",
        assigned_agent_id=2,
        human_owner="Stanislav",
        labels=["backend", "architecture"],
        due_date=NOW + timedelta(days=1),
        created_at=NOW - timedelta(days=5),
        updated_at=NOW - timedelta(minutes=55),
    ),
    TaskRead(
        id=3,
        project_id=2,
        title="Prepare LangGraph adapter placeholder",
        description="Define adapter seam without implementing the runtime.",
        status="backlog",
        priority="medium",
        assigned_agent_id=2,
        human_owner="Stanislav",
        labels=["orchestration"],
        due_date=None,
        created_at=NOW - timedelta(days=1),
        updated_at=NOW - timedelta(hours=2),
    ),
    TaskRead(
        id=4,
        project_id=1,
        title="Seed board with demo tasks",
        description="Provide realistic density for the first dashboard pass.",
        status="done",
        priority="low",
        assigned_agent_id=1,
        human_owner="Stanislav",
        labels=["demo-data"],
        due_date=None,
        created_at=NOW - timedelta(days=7),
        updated_at=NOW - timedelta(days=1),
    ),
    TaskRead(
        id=5,
        project_id=1,
        title="Add failed run diagnostics panel",
        description="Surface output, error, and logs in one place.",
        status="failed",
        priority="high",
        assigned_agent_id=4,
        human_owner="Stanislav",
        labels=["runs", "diagnostics"],
        due_date=NOW + timedelta(days=3),
        created_at=NOW - timedelta(days=2),
        updated_at=NOW - timedelta(minutes=10),
    ),
    TaskRead(
        id=6,
        project_id=1,
        title="Prepare ready queue",
        description="List tasks that can be picked up by available agents.",
        status="ready",
        priority="medium",
        assigned_agent_id=None,
        human_owner="Stanislav",
        labels=["workflow"],
        due_date=NOW + timedelta(days=4),
        created_at=NOW - timedelta(hours=20),
        updated_at=NOW - timedelta(hours=3),
    ),
]

_RUNS = [
    RunRead(
        id=1,
        task_id=1,
        agent_id=2,
        pipeline_type="mock",
        status="in_progress",
        started_at=NOW - timedelta(minutes=18),
        finished_at=None,
        output_summary="Building the dashboard shell.",
        output_payload={"phase": "layout"},
        error_message=None,
        logs_text="Starting layout pass\nCreating sidebar primitives",
    ),
    RunRead(
        id=2,
        task_id=2,
        agent_id=2,
        pipeline_type="mock",
        status="completed",
        started_at=NOW - timedelta(hours=5),
        finished_at=NOW - timedelta(hours=4, minutes=30),
        output_summary="Architecture review complete.",
        output_payload={"result": "approved"},
        error_message=None,
        logs_text="Reviewed orchestration seam\nNo blocking issues",
    ),
    RunRead(
        id=3,
        task_id=5,
        agent_id=4,
        pipeline_type="mock",
        status="failed",
        started_at=NOW - timedelta(hours=2),
        finished_at=NOW - timedelta(hours=1, minutes=44),
        output_summary="Diagnostics panel failed on missing run payload.",
        output_payload={"result": "error"},
        error_message="Run payload schema mismatch.",
        logs_text="Fetched run payload\nValidation failed at output_payload",
    ),
]


def seeded_projects() -> list[ProjectRead]:
    return _PROJECTS


def seeded_agents() -> list[AgentRead]:
    return _AGENTS


def seeded_tasks() -> list[TaskRead]:
    return _TASKS


def seeded_runs() -> list[RunRead]:
    return _RUNS


def move_seeded_task(task_id: int, status: str) -> TaskRead:
    for index, task in enumerate(_TASKS):
        if task.id == task_id:
            updated_task = task.model_copy(
                update={"status": status, "updated_at": datetime.now(timezone.utc)}
            )
            _TASKS[index] = updated_task
            return updated_task
    raise HTTPException(status_code=404, detail="Task not found")


def seed_database(db: Session) -> None:
    if db.query(Project).count() > 0:
        return

    owner_names = sorted({task.human_owner for task in _TASKS if task.human_owner})
    for index, owner_name in enumerate(owner_names, start=1):
        db.merge(Owner(id=index, name=owner_name))

    for project in _PROJECTS:
        db.merge(
            Project(
                id=project.id,
                key=project.key,
                name=project.name,
                description=project.description,
                created_at=project.created_at,
                updated_at=project.updated_at,
            )
        )

    db.flush()

    for agent in _AGENTS:
        db.merge(
            Agent(
                id=agent.id,
                name=agent.name,
                slug=agent.slug,
                description=agent.description,
                status=agent.status,
                agent_type=agent.agent_type,
                capabilities_json=json.dumps(agent.capabilities),
                config_json="{}",
                created_at=agent.created_at,
                updated_at=agent.updated_at,
            )
        )

    db.flush()

    for task in _TASKS:
        owner = db.query(Owner).filter(Owner.name == task.human_owner).first() if task.human_owner else None
        db.merge(
            Task(
                id=task.id,
                project_id=task.project_id,
                title=task.title,
                description=task.description,
                status=TASK_STATUS_TO_CODE[task.status],
                priority=TASK_PRIORITY_TO_CODE[task.priority],
                assigned_agent_id=task.assigned_agent_id,
                owner_id=owner.id if owner else None,
                due_date=task.due_date,
                created_at=task.created_at,
                updated_at=task.updated_at,
            )
        )

    db.flush()

    label_names = sorted({label for task in _TASKS for label in task.labels})
    for index, name in enumerate(label_names, start=1):
        db.merge(Label(id=index, name=name))

    db.flush()

    existing_task_labels = {
        (task_id, label_id)
        for task_id, label_id in db.query(TaskLabel.task_id, TaskLabel.label_id).all()
    }
    for task in _TASKS:
        for label_name in task.labels:
            label = db.query(Label).filter(Label.name == label_name).first()
            if label is not None and (task.id, label.id) not in existing_task_labels:
                db.add(TaskLabel(task_id=task.id, label_id=label.id))
                existing_task_labels.add((task.id, label.id))

    db.commit()
