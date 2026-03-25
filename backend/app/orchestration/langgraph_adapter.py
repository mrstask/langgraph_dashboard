from app.orchestration.base import AgentOrchestrator


class LangGraphOrchestrator(AgentOrchestrator):
    def enqueue_task(self, task_id: int, agent_id: int):
        raise NotImplementedError("LangGraph integration is not implemented yet.")

    def get_run(self, run_id: int):
        raise NotImplementedError("LangGraph integration is not implemented yet.")

    def cancel_run(self, run_id: int):
        raise NotImplementedError("LangGraph integration is not implemented yet.")

