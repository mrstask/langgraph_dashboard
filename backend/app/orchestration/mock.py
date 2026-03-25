from datetime import datetime, timezone

from app.orchestration.base import AgentOrchestrator
from app.schemas.run import RunRead


class MockAgentOrchestrator(AgentOrchestrator):
    def enqueue_task(self, task_id: int, agent_id: int) -> RunRead:
        timestamp = datetime.now(timezone.utc)
        return RunRead(
            id=999,
            task_id=task_id,
            agent_id=agent_id,
            pipeline_type="mock",
            status="completed",
            started_at=timestamp,
            finished_at=timestamp,
            output_summary="Mock run completed with placeholder output.",
            output_payload={"result": "ok"},
            error_message=None,
            logs_text="Initialized mock pipeline\nCompleted mock pipeline",
        )

    def get_run(self, run_id: int) -> RunRead | None:
        return None

    def cancel_run(self, run_id: int) -> RunRead | None:
        return None
