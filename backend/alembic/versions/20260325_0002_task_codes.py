"""store task status and priority as integer codes

Revision ID: 20260325_0002
Revises: 20260325_0001
Create Date: 2026-03-25 14:35:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260325_0002"
down_revision = "20260325_0001"
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
    connection.execute(sa.text("PRAGMA foreign_keys=OFF"))

    op.create_table(
        "tasks_new",
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

    status_case = " ".join([f"WHEN '{name}' THEN {code}" for name, code in STATUS_TO_CODE.items()])
    priority_case = " ".join([f"WHEN '{name}' THEN {code}" for name, code in PRIORITY_TO_CODE.items()])

    connection.execute(
        sa.text(
            f"""
            INSERT INTO tasks_new (
                id, project_id, title, description, status, priority,
                assigned_agent_id, owner_id, due_date, created_at, updated_at
            )
            SELECT
                id,
                project_id,
                title,
                description,
                CASE status {status_case} END,
                CASE priority {priority_case} END,
                assigned_agent_id,
                owner_id,
                due_date,
                created_at,
                updated_at
            FROM tasks
            """
        )
    )

    op.drop_index("ix_tasks_status", table_name="tasks")
    op.drop_index("ix_tasks_id", table_name="tasks")
    op.drop_table("tasks")
    op.rename_table("tasks_new", "tasks")
    op.create_index("ix_tasks_id", "tasks", ["id"])
    op.create_index("ix_tasks_status", "tasks", ["status"])

    connection.execute(sa.text("PRAGMA foreign_keys=ON"))


def downgrade() -> None:
    connection = op.get_bind()
    connection.execute(sa.text("PRAGMA foreign_keys=OFF"))

    op.create_table(
        "tasks_old",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("priority", sa.String(length=32), nullable=False),
        sa.Column("assigned_agent_id", sa.Integer(), sa.ForeignKey("agents.id"), nullable=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("owners.id"), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    status_case = " ".join([f"WHEN {code} THEN '{name}'" for name, code in STATUS_TO_CODE.items()])
    priority_case = " ".join([f"WHEN {code} THEN '{name}'" for name, code in PRIORITY_TO_CODE.items()])

    connection.execute(
        sa.text(
            f"""
            INSERT INTO tasks_old (
                id, project_id, title, description, status, priority,
                assigned_agent_id, owner_id, due_date, created_at, updated_at
            )
            SELECT
                id,
                project_id,
                title,
                description,
                CASE status {status_case} END,
                CASE priority {priority_case} END,
                assigned_agent_id,
                owner_id,
                due_date,
                created_at,
                updated_at
            FROM tasks
            """
        )
    )

    op.drop_index("ix_tasks_status", table_name="tasks")
    op.drop_index("ix_tasks_id", table_name="tasks")
    op.drop_table("tasks")
    op.rename_table("tasks_old", "tasks")
    op.create_index("ix_tasks_id", "tasks", ["id"])
    op.create_index("ix_tasks_status", "tasks", ["status"])

    connection.execute(sa.text("PRAGMA foreign_keys=ON"))
