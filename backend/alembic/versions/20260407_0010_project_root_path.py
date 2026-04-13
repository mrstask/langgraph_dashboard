"""Add root_path to projects

Revision ID: 20260407_0010
Revises: 20260402_0009
Create Date: 2026-04-07 00:00:00
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision = "20260407_0010"
down_revision = "20260402_0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_columns = [c["name"] for c in inspector.get_columns("projects")]

    if "root_path" not in existing_columns:
        op.add_column("projects", sa.Column("root_path", sa.Text(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = inspect(bind)
    existing_columns = [c["name"] for c in inspector.get_columns("projects")]

    if "root_path" in existing_columns:
        op.drop_column("projects", "root_path")
