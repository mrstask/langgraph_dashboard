import json
import re

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.repositories.agent_repository import AgentRepository
from app.schemas.agent import AgentCreate, AgentRead


def list_agents(db: Session) -> list[AgentRead]:
    repository = AgentRepository(db)
    return [serialize_agent(agent) for agent in repository.list_all()]


def create_agent(db: Session, payload: AgentCreate) -> AgentRead:
    repository = AgentRepository(db)

    slug = build_unique_slug(repository, payload.slug or payload.name)
    capabilities = sorted({item.strip() for item in payload.capabilities if item.strip()})

    agent = Agent(
        name=payload.name,
        slug=slug,
        description=payload.description,
        status=payload.status,
        agent_type=payload.agent_type,
        capabilities_json=json.dumps(capabilities),
        config_json=json.dumps(payload.config or {}),
    )
    return serialize_agent(repository.create(agent))


def serialize_agent(agent: Agent) -> AgentRead:
    return AgentRead(
        id=agent.id,
        name=agent.name,
        slug=agent.slug,
        description=agent.description,
        status=agent.status,
        agent_type=agent.agent_type,
        capabilities=json.loads(agent.capabilities_json or "[]"),
        config=json.loads(agent.config_json or "{}"),
        created_at=agent.created_at,
        updated_at=agent.updated_at,
    )


def build_unique_slug(repository: AgentRepository, value: str) -> str:
    base_slug = slugify(value)
    slug = base_slug
    counter = 2
    while repository.get_by_slug(slug) is not None:
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "-", value.strip().lower())
    return cleaned.strip("-") or "agent"
