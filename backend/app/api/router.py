from fastapi import APIRouter

from app.api.routes import agents, health, projects, runs, tasks

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(runs.router, prefix="/runs", tags=["runs"])

