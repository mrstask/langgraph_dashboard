# Agent Task Dashboard

## Goal

Build a Jira-like operations dashboard for human-managed and agent-executed work.

The app must:

- manage projects, agents, tasks, and runs from one UI
- expose a Kanban board as the primary workflow surface
- use Python, FastAPI, SQLAlchemy, Alembic, and SQLite in v1
- keep orchestration behind a stable boundary so LangChain or LangGraph can be added later

## Current Product State

Implemented:

- task board with drag-and-drop status movement
- task creation from the main action and per-column `+`
- SQLite-backed task persistence
- agent registry page with live backend data and agent creation
- projects page with live backend data and project creation
- run history page backed by the backend API
- shared sidebar search for task board and task list
- collapsible sidebar UI

Still incomplete:

- task edit and delete flows
- agent edit and delete flows
- project edit and delete flows
- task details drawer/page
- comments and activity timeline UI
- real persisted task runs instead of seeded mock run records
- LangChain and LangGraph runtime adapters beyond placeholders

## Architecture

### Frontend

- React + Vite
- app shell in `frontend/src/app`
- reusable components in `frontend/src/components`
- page features in `frontend/src/features`
- API client in `frontend/src/lib/api.ts`

### Backend

- FastAPI routes in `backend/app/api/routes`
- Pydantic schemas in `backend/app/schemas`
- DB repositories in `backend/app/repositories`
- use-case services in `backend/app/services`
- SQLAlchemy models in `backend/app/models`
- orchestration boundary in `backend/app/orchestration`

### Orchestration Boundary

The dashboard must not depend directly on LangChain or LangGraph internals.

Current adapters:

- `MockAgentOrchestrator`
- `langchain_adapter.py` placeholder
- `langgraph_adapter.py` placeholder

Rule:

- task lifecycle and run lifecycle are separate
- task status is a planning/execution board concern
- run status is an orchestration attempt concern

## Data Model

### Projects

- stored in `projects`
- fields: `id`, `key`, `name`, `description`, `created_at`, `updated_at`

### Agents

- stored in `agents`
- fields: `id`, `name`, `slug`, `description`, `status`, `agent_type`, `capabilities_json`, `config_json`, `created_at`, `updated_at`

### Tasks

- stored in `tasks`
- fields: `id`, `project_id`, `title`, `description`, `status`, `priority`, `assigned_agent_id`, `owner_id`, `due_date`, `created_at`, `updated_at`
- `status` is numeric in SQLite and mapped through backend constants
- `priority` is numeric in SQLite and mapped through backend constants

### Owners

- stored in `owners`
- fields: `id`, `name`

### Labels

- stored in `labels`
- task linkage stored in `task_labels`

### Runs

- schema exists for `task_runs`
- current UI reads seeded run API responses
- full DB-backed run lifecycle is still pending

## Constants

Task statuses are stored numerically in the database and mapped in `backend/app/constants/task_metadata.py`.

- `1 = backlog`
- `2 = ready`
- `3 = running`
- `4 = review`
- `5 = done`
- `6 = failed`

Task priorities are stored numerically in the database and mapped in `backend/app/constants/task_metadata.py`.

- `1 = low`
- `2 = medium`
- `3 = high`
- `4 = critical`

## API

### Health

- `GET /api/health`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `POST /api/tasks/{task_id}/move`

### Agents

- `GET /api/agents`
- `POST /api/agents`

### Projects

- `GET /api/projects`
- `POST /api/projects`

### Runs

- `GET /api/runs`
- `GET /api/runs/{run_id}`

## UI Surfaces

### Dashboard

- board columns for `backlog`, `ready`, `running`, `review`, `done`, `failed`
- drag/drop movement
- task creation
- summary cards

### Tasks

- flat table index
- shared search filtering

### Agents

- live registry cards
- create agent modal

### Projects

- live project cards
- create project modal

### Runs

- run history table backed by API

### Settings

- still informational only

## Implementation Rules

- use Alembic migrations for schema changes
- do not reset or recreate the SQLite database to apply normal schema changes
- backend should run from the root `.venv`
- frontend should consume the API instead of local mock lists wherever an endpoint exists
- preserve the orchestration abstraction even when future agent execution is added

## Build Order

### Phase 1

- app shell
- sidebar and topbar
- task board
- SQLite wiring
- seeded demo data

### Phase 2

- DB-backed tasks
- task creation
- task movement persistence
- normalized owner and labels
- numeric status and priority storage

### Phase 3

- DB-backed agents and projects
- creation flows for agents and projects
- live runs page consumption
- shared task search and sidebar collapse

### Phase 4

- task details
- comments
- activity timeline
- edit/delete flows
- real task run persistence

### Phase 5

- LangChain adapter implementation
- LangGraph adapter implementation
- background worker and queue
- richer agent execution controls
