"""Add parent_task_id to tasks for subtask hierarchy

Revision ID: 20260331_0007
Revises: 20260331_0006
Create Date: 2026-03-31 00:00:00
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision = "20260331_0007"
down_revision = "20260331_0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    task_columns = {col["name"] for col in inspector.get_columns("tasks")}
    task_indexes = {idx["name"] for idx in inspector.get_indexes("tasks")}

    if "parent_task_id" not in task_columns:
        op.add_column(
            "tasks",
            sa.Column("parent_task_id", sa.Integer(), sa.ForeignKey("tasks.id"), nullable=True),
        )

    if "ix_tasks_parent_task_id" not in task_indexes:
        op.create_index("ix_tasks_parent_task_id", "tasks", ["parent_task_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    task_indexes = {idx["name"] for idx in inspector.get_indexes("tasks")}
    task_columns = {col["name"] for col in inspector.get_columns("tasks")}

    if "ix_tasks_parent_task_id" in task_indexes:
        op.drop_index("ix_tasks_parent_task_id", "tasks")
    if "parent_task_id" in task_columns:
        op.drop_column("tasks", "parent_task_id")
