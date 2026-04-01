"""Add prompt_suggestions table

Revision ID: 20260401_0008
Revises: 20260331_0007
Create Date: 2026-04-01 00:00:00
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision = "20260401_0008"
down_revision = "20260331_0007"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_tables = inspector.get_table_names()

    if "prompt_suggestions" not in existing_tables:
        op.create_table(
            "prompt_suggestions",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("task_id", sa.Integer(), sa.ForeignKey("tasks.id"), nullable=False),
            sa.Column("agent_role", sa.String(length=64), nullable=False),
            sa.Column("issue_pattern", sa.Text(), nullable=False),
            sa.Column("suggested_instruction", sa.Text(), nullable=False),
            sa.Column("evidence", sa.Text(), nullable=False, server_default="[]"),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="open"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
        op.create_index("ix_prompt_suggestions_id", "prompt_suggestions", ["id"])
        op.create_index("ix_prompt_suggestions_task_id", "prompt_suggestions", ["task_id"])
        op.create_index("ix_prompt_suggestions_agent_role", "prompt_suggestions", ["agent_role"])
        op.create_index("ix_prompt_suggestions_status", "prompt_suggestions", ["status"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_tables = inspector.get_table_names()

    if "prompt_suggestions" in existing_tables:
        op.drop_index("ix_prompt_suggestions_status", table_name="prompt_suggestions")
        op.drop_index("ix_prompt_suggestions_agent_role", table_name="prompt_suggestions")
        op.drop_index("ix_prompt_suggestions_task_id", table_name="prompt_suggestions")
        op.drop_index("ix_prompt_suggestions_id", table_name="prompt_suggestions")
        op.drop_table("prompt_suggestions")
