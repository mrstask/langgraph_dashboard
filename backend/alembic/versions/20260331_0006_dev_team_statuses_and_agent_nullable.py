"""Add dev_team pipeline status codes; make task_runs.agent_id nullable

Revision ID: 20260331_0006
Revises: 20260329_0005
Create Date: 2026-03-31 00:00:00
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision = "20260331_0006"
down_revision = "20260329_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # No DDL needed for new status codes (7=architect, 8=develop, 9=testing) —
    # the status column is already an unconstrained Integer.
    # This migration makes task_runs.agent_id nullable so run creation works
    # even when agent lookup fails temporarily.
    bind = op.get_bind()
    inspector = inspect(bind)

    if "task_runs" in inspector.get_table_names():
        # SQLite does not support ALTER COLUMN; recreate the table instead.
        op.execute(
            "CREATE TABLE IF NOT EXISTS task_runs_new ("
            "  id INTEGER NOT NULL PRIMARY KEY, "
            "  task_id INTEGER NOT NULL REFERENCES tasks(id), "
            "  agent_id INTEGER REFERENCES agents(id), "
            "  pipeline_type VARCHAR(64) NOT NULL DEFAULT 'mock', "
            "  status VARCHAR(32) NOT NULL DEFAULT 'queued', "
            "  started_at DATETIME, "
            "  finished_at DATETIME, "
            "  output_summary TEXT, "
            "  output_payload_json TEXT NOT NULL DEFAULT '{}', "
            "  error_message TEXT, "
            "  logs_text TEXT, "
            "  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "
            "  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
            ")"
        )
        op.execute(
            "INSERT INTO task_runs_new SELECT "
            "  id, task_id, agent_id, pipeline_type, status, "
            "  started_at, finished_at, output_summary, output_payload_json, "
            "  error_message, logs_text, created_at, updated_at "
            "FROM task_runs"
        )
        op.execute("DROP TABLE task_runs")
        op.execute("ALTER TABLE task_runs_new RENAME TO task_runs")


def downgrade() -> None:
    pass
