from abc import ABC, abstractmethod

from app.schemas.run import RunRead


class AgentOrchestrator(ABC):
    @abstractmethod
    def enqueue_task(self, task_id: int, agent_id: int) -> RunRead:
        raise NotImplementedError

    @abstractmethod
    def get_run(self, run_id: int) -> RunRead | None:
        raise NotImplementedError

    @abstractmethod
    def cancel_run(self, run_id: int) -> RunRead | None:
        raise NotImplementedError

