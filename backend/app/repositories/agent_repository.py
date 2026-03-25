from sqlalchemy.orm import Session

from app.models.agent import Agent


class AgentRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[Agent]:
        return self.db.query(Agent).order_by(Agent.updated_at.desc()).all()

    def get_by_slug(self, slug: str) -> Agent | None:
        return self.db.query(Agent).filter(Agent.slug == slug).first()

    def create(self, agent: Agent) -> Agent:
        self.db.add(agent)
        self.db.commit()
        self.db.refresh(agent)
        return agent
