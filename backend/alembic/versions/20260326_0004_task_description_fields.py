"""Add short_description and implementation_description to tasks

Revision ID: 20260326_0004
Revises: 20260325_0003
Create Date: 2026-03-26 10:00:00
"""

import sqlalchemy as sa
from alembic import op

revision = "20260326_0004"
down_revision = "20260325_0003"
branch_labels = None
depends_on = None

# Status codes as defined in task_metadata
STATUS_BACKLOG = 1
STATUS_READY = 2


def upgrade() -> None:
    op.add_column("tasks", sa.Column("short_description", sa.Text(), nullable=True))
    op.add_column("tasks", sa.Column("implementation_description", sa.Text(), nullable=True))

    connection = op.get_bind()

    # Backlog tasks: description → short_description
    connection.execute(
        sa.text(
            "UPDATE tasks SET short_description = description WHERE status = :backlog"
        ),
        {"backlog": STATUS_BACKLOG},
    )

    # Ready tasks: description → implementation_description
    #              first 200 chars of description → short_description (auto-generated)
    connection.execute(
        sa.text(
            "UPDATE tasks SET"
            "  implementation_description = description,"
            "  short_description = SUBSTR(description, 1, 200)"
            " WHERE status = :ready"
        ),
        {"ready": STATUS_READY},
    )

    # All other statuses: copy description to short_description
    connection.execute(
        sa.text(
            "UPDATE tasks SET short_description = description"
            " WHERE status NOT IN (:backlog, :ready)"
        ),
        {"backlog": STATUS_BACKLOG, "ready": STATUS_READY},
    )


def downgrade() -> None:
    op.drop_column("tasks", "implementation_description")
    op.drop_column("tasks", "short_description")
