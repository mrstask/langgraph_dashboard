from app.orchestration.base import AgentOrchestrator


class LangChainOrchestrator(AgentOrchestrator):
    def enqueue_task(self, task_id: int, agent_id: int):
        raise NotImplementedError("LangChain integration is not implemented yet.")

    def get_run(self, run_id: int):
        raise NotImplementedError("LangChain integration is not implemented yet.")

    def cancel_run(self, run_id: int):
        raise NotImplementedError("LangChain integration is not implemented yet.")

