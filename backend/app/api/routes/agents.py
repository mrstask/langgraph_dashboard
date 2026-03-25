from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.agent import AgentCreate, AgentRead
from app.services.agent_service import create_agent, list_agents

router = APIRouter()


@router.get("", response_model=list[AgentRead])
def list_agents_route(db: Session = Depends(get_db)) -> list[AgentRead]:
    return list_agents(db)


@router.post("", response_model=AgentRead)
def create_agent_route(payload: AgentCreate, db: Session = Depends(get_db)) -> AgentRead:
    return create_agent(db=db, payload=payload)
