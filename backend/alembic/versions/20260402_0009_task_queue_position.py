"""Add queue_position to tasks

Revision ID: 20260402_0009
Revises: 20260401_0008
Create Date: 2026-04-02 00:00:00
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision = "20260402_0009"
down_revision = "20260401_0008"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_columns = [c["name"] for c in inspector.get_columns("tasks")]

    if "queue_position" not in existing_columns:
        op.add_column("tasks", sa.Column("queue_position", sa.Integer(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_columns = [c["name"] for c in inspector.get_columns("tasks")]

    if "queue_position" in existing_columns:
        op.drop_column("tasks", "queue_position")
