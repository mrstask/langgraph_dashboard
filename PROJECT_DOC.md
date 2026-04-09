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
- task creation, editing, and deletion
- SQLite-backed task persistence with subtask hierarchy and queue positioning
- agent registry page with live backend data and agent creation
- projects page with live backend data, project creation and editing (including root path)
- stories page with creation, editing, deletion, and linked task views
- run history page with detail panel backed by the backend API
- queue page with grouped subtask view
- activity events and prompt suggestions APIs
- shared sidebar search for task board and task list
- collapsible sidebar UI with entity counts

Still incomplete:

- agent edit and delete flows
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
- Pydantic v2 schemas in `backend/app/schemas` with strict validation (see Schema Contracts below)
- Shared validators and annotated types in `backend/app/schemas/_validators.py`
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
- fields: `id`, `key`, `name`, `description`, `root_path`, `created_at`, `updated_at`

### Agents

- stored in `agents`
- fields: `id`, `name`, `slug`, `description`, `status`, `agent_type`, `capabilities_json`, `config_json`, `created_at`, `updated_at`
- API exposes `capabilities` (list) and `config` (dict) by deserializing the JSON columns

### Tasks

- stored in `tasks`
- fields: `id`, `project_id`, `title`, `description`, `short_description`, `implementation_description`, `definition_of_done`, `status`, `priority`, `assigned_agent_id`, `owner_id`, `due_date`, `story_id`, `parent_task_id`, `queue_position`, `created_at`, `updated_at`
- `status` is numeric in SQLite and mapped through backend constants
- `priority` is numeric in SQLite and mapped through backend constants
- `parent_task_id` enables subtask hierarchy
- `queue_position` orders tasks in the queue view

### Stories

- stored in `stories`
- fields: `id`, `title`, `description`, `created_at`, `updated_at`
- tasks link to stories via `story_id`

### Owners

- stored in `owners`
- fields: `id`, `name`

### Labels

- stored in `labels`
- task linkage stored in `task_labels`

### Runs

- stored in `task_runs`
- fields: `id`, `task_id`, `agent_id`, `pipeline_type`, `status`, `started_at`, `finished_at`, `output_summary`, `output_payload_json`, `error_message`, `logs_text`, `created_at`, `updated_at`

### Activity Events

- stored in `activity_events`
- fields: `id`, `entity_type`, `entity_id`, `event_type`, `payload_json`, `created_at`, `updated_at`

### Prompt Suggestions

- stored in `prompt_suggestions`
- fields: `id`, `task_id`, `agent_role`, `issue_pattern`, `suggested_instruction`, `evidence`, `status`, `created_at`, `updated_at`

## Schema Contracts

All Pydantic schemas enforce strict validation at the API boundary. Services do not duplicate these checks.

### Literal Types

Domain values are constrained with `Literal` types instead of plain `str`:

- `TaskStatusName` — `"backlog"`, `"ready"`, `"running"`, `"review"`, `"done"`, `"failed"`, `"architect"`, `"develop"`, `"testing"`
- `TaskPriorityName` — `"low"`, `"medium"`, `"high"`, `"critical"`
- `AgentStatus` — `"online"`, `"offline"`, `"busy"`, `"error"`
- `AgentType` — `"mock"`, `"langchain"`, `"langgraph"`, `"custom"`
- `RunStatus` — `"queued"`, `"running"`, `"completed"`, `"failed"`, `"cancelled"`
- `PipelineType` — `"mock"`, `"dev_team"`, `"langchain"`, `"langgraph"`
- `EntityType` — `"task"`, `"project"`, `"agent"`, `"run"`, `"story"`
- `SuggestionStatus` — `"open"`, `"applied"`, `"dismissed"`

Invalid values are rejected by Pydantic before reaching service or repository code.

### Annotated Validators (`_validators.py`)

Reusable annotated types applied to Create/Update schemas:

- `StrippedStr` — auto-strips leading/trailing whitespace
- `StrippedStrOrNone` — strips whitespace, converts empty strings to `None`
- `NormalizedLabels` — deduplicates, sorts, and strips label lists
- `UppercaseStr` — strips and uppercases (used for project keys)

### Field Constraints

- Foreign key IDs use `Field(gt=0)` to reject zero or negative values
- `queue_position` uses `Field(ge=0)` to allow zero-based positions
- String fields use `Field(min_length=1, max_length=N)` where appropriate
- Project `key` is validated with `pattern=r"^[A-Z][A-Z0-9_]*$"`
- Count and total fields use `Field(ge=0)` to guarantee non-negative values
- `dict` fields are typed as `dict[str, Any]` instead of untyped `dict`

### ORM Integration

All `*Read` schemas use `model_config = ConfigDict(from_attributes=True)` for SQLAlchemy compatibility.

### Standalone Schemas

`QueueGroup` and `CountsRead` are defined in `backend/app/schemas/queue.py` and `backend/app/schemas/counts.py` respectively, not inline in route files.

## Constants

Task statuses are stored numerically in the database and mapped in `backend/app/constants/task_metadata.py`.

- `1 = backlog`
- `2 = ready`
- `3 = running`
- `4 = review`
- `5 = done`
- `6 = failed`
- `7 = architect`
- `8 = develop`
- `9 = testing`

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
- `GET /api/tasks/{task_id}`
- `POST /api/tasks`
- `POST /api/tasks/{task_id}/move`
- `PATCH /api/tasks/{task_id}`
- `DELETE /api/tasks/{task_id}`

### Agents

- `GET /api/agents`
- `POST /api/agents`

### Projects

- `GET /api/projects`
- `POST /api/projects`
- `PATCH /api/projects/{project_id}`

### Stories

- `GET /api/stories`
- `POST /api/stories`
- `PATCH /api/stories/{story_id}`
- `DELETE /api/stories/{story_id}`

### Runs

- `GET /api/runs`
- `GET /api/runs/{run_id}`
- `POST /api/runs`
- `PATCH /api/runs/{run_id}`

### Activity Events

- `GET /api/activity-events?task_id={task_id}`
- `POST /api/activity-events`

### Prompt Suggestions

- `GET /api/prompt-suggestions`
- `POST /api/prompt-suggestions`
- `PATCH /api/prompt-suggestions/{suggestion_id}`

### Queue

- `GET /api/queue`

### Counts

- `GET /api/counts`

## UI Surfaces

### Dashboard

- board columns for `backlog`, `architect`, `develop`, `testing`, `done`
- drag/drop movement
- task creation and editing
- summary cards

### Tasks

- flat table index
- shared search filtering

### Agents

- live registry cards
- create agent modal

### Projects

- live project cards
- create and edit project modals (including root path)

### Stories

- story list with linked task counts
- create and edit story modals

### Runs

- run history table backed by API
- run detail panel

### Queue

- grouped subtask queue view ordered by priority and position

### Settings

- still informational only

## Implementation Rules

- use Alembic migrations for schema changes
- do not reset or recreate the SQLite database to apply normal schema changes
- backend should run from the root `.venv`
- frontend should consume the API instead of local mock lists wherever an endpoint exists
- preserve the orchestration abstraction even when future agent execution is added
- all input validation (stripping, normalization, type constraints) belongs in Pydantic schemas, not in services
- use `Literal` types for any field with a fixed set of valid values
- services should only contain business logic that requires database access (e.g. uniqueness checks, entity lookups)

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
