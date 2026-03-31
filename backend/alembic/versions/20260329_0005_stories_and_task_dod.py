"""Add stories table and definition_of_done + story_id to tasks

Revision ID: 20260329_0005
Revises: 20260326_0004
Create Date: 2026-03-29 10:00:00
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision = "20260329_0005"
down_revision = "20260326_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_tables = inspector.get_table_names()
    task_columns = {col["name"] for col in inspector.get_columns("tasks")}
    task_indexes = {idx["name"] for idx in inspector.get_indexes("tasks")}
    story_indexes = {idx["name"] for idx in inspector.get_indexes("stories")} if "stories" in existing_tables else set()

    if "stories" not in existing_tables:
        op.create_table(
            "stories",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    if "ix_stories_id" not in story_indexes:
        op.create_index("ix_stories_id", "stories", ["id"])

    if "definition_of_done" not in task_columns:
        op.add_column("tasks", sa.Column("definition_of_done", sa.Text(), nullable=True))

    if "story_id" not in task_columns:
        op.add_column("tasks", sa.Column("story_id", sa.Integer(), sa.ForeignKey("stories.id"), nullable=True))

    if "ix_tasks_story_id" not in task_indexes:
        op.create_index("ix_tasks_story_id", "tasks", ["story_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    task_columns = {col["name"] for col in inspector.get_columns("tasks")}
    task_indexes = {idx["name"] for idx in inspector.get_indexes("tasks")}

    if "ix_tasks_story_id" in task_indexes:
        op.drop_index("ix_tasks_story_id", "tasks")
    if "story_id" in task_columns:
        op.drop_column("tasks", "story_id")
    if "definition_of_done" in task_columns:
        op.drop_column("tasks", "definition_of_done")
    op.drop_index("ix_stories_id", "stories")
    op.drop_table("stories")
