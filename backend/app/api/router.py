from fastapi import APIRouter

from app.api.routes import agents, counts, health, projects, runs, stories, tasks

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(stories.router, prefix="/stories", tags=["stories"])
api_router.include_router(runs.router, prefix="/runs", tags=["runs"])
api_router.include_router(counts.router, prefix="/counts", tags=["counts"])

