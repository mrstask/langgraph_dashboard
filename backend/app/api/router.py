from fastapi import APIRouter

from app.api.routes import activity_events, agents, counts, health, projects, prompt_suggestions, runs, stories, tasks

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(stories.router, prefix="/stories", tags=["stories"])
api_router.include_router(runs.router, prefix="/runs", tags=["runs"])
api_router.include_router(counts.router, prefix="/counts", tags=["counts"])
api_router.include_router(activity_events.router, prefix="/activity-events", tags=["activity-events"])
api_router.include_router(prompt_suggestions.router, prefix="/prompt-suggestions", tags=["prompt-suggestions"])

