"""repair task code schema

Revision ID: 20260325_0003
Revises: 20260325_0002
Create Date: 2026-03-25 14:50:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260325_0003"
down_revision = "20260325_0002"
branch_labels = None
depends_on = None


STATUS_TO_CODE = {
    "backlog": 1,
    "ready": 2,
    "running": 3,
    "review": 4,
    "done": 5,
    "failed": 6,
}

PRIORITY_TO_CODE = {
    "low": 1,
    "medium": 2,
    "high": 3,
    "critical": 4,
}


def upgrade() -> None:
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    task_columns = {column["name"]: column for column in inspector.get_columns("tasks")}

    status_expr = "status"
    if "status_code" in task_columns:
        status_expr = (
            "COALESCE(status_code, CASE status "
            + " ".join([f"WHEN '{name}' THEN {code}" for name, code in STATUS_TO_CODE.items()])
            + " END)"
        )
    elif task_columns["status"]["type"].python_type is str:
        status_expr = (
            "CASE status "
            + " ".join([f"WHEN '{name}' THEN {code}" for name, code in STATUS_TO_CODE.items()])
            + " END"
        )

    priority_expr = "priority"
    if "priority_code" in task_columns:
        priority_expr = (
            "COALESCE(priority_code, CASE priority "
            + " ".join([f"WHEN '{name}' THEN {code}" for name, code in PRIORITY_TO_CODE.items()])
            + " END)"
        )
    elif task_columns["priority"]["type"].python_type is str:
        priority_expr = (
            "CASE priority "
            + " ".join([f"WHEN '{name}' THEN {code}" for name, code in PRIORITY_TO_CODE.items()])
            + " END"
        )

    connection.execute(sa.text("PRAGMA foreign_keys=OFF"))

    op.create_table(
        "tasks_v3",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.Integer(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("assigned_agent_id", sa.Integer(), sa.ForeignKey("agents.id"), nullable=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("owners.id"), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    connection.execute(
        sa.text(
            f"""
            INSERT INTO tasks_v3 (
                id, project_id, title, description, status, priority,
                assigned_agent_id, owner_id, due_date, created_at, updated_at
            )
            SELECT
                id,
                project_id,
                title,
                description,
                {status_expr},
                {priority_expr},
                assigned_agent_id,
                owner_id,
                due_date,
                created_at,
                updated_at
            FROM tasks
            """
        )
    )

    try:
        op.drop_index("ix_tasks_status", table_name="tasks")
    except Exception:
        pass
    try:
        op.drop_index("ix_tasks_id", table_name="tasks")
    except Exception:
        pass

    op.drop_table("tasks")
    op.rename_table("tasks_v3", "tasks")
    op.create_index("ix_tasks_id", "tasks", ["id"])
    op.create_index("ix_tasks_status", "tasks", ["status"])

    connection.execute(sa.text("PRAGMA foreign_keys=ON"))


def downgrade() -> None:
    raise NotImplementedError("Downgrade is not supported for the schema repair revision.")
