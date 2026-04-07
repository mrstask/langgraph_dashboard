# LLM Operations Guide

## Purpose

This document defines how an LLM should create, edit, and update tasks, agents, and projects for this app.

Use it as the operational contract for future agentic workflows.

## Core Rules

- always treat the backend API as the source of truth
- never invent task, project, or agent ids
- never rewrite task status strings directly in SQLite
- rely on backend mappings for numeric task status and priority codes
- do not couple task changes to run changes unless a workflow explicitly requires both
- preserve user-entered descriptions and labels unless there is a specific instruction to modify them
- the API enforces strict `Literal` types for status, priority, agent_type, and similar fields — sending an invalid value will return a 422 validation error, not a 400 from service logic
- string fields are auto-stripped by the API — no need to pre-trim values before sending
- empty-string optional fields are normalized to `null` by the API
- labels are auto-deduplicated and sorted by the API

## Domain Rules

### Tasks

- tasks belong to a project
- tasks may be assigned to an agent or left unassigned
- tasks have a board status and a priority
- valid statuses: `backlog`, `ready`, `running`, `review`, `done`, `failed`, `architect`, `develop`, `testing`
- valid priorities: `low`, `medium`, `high`, `critical`
- owners and labels must be normalized through backend logic, not duplicated manually
- tasks can form hierarchies via `parent_task_id` and be ordered via `queue_position`

### Agents

- agents represent runtime identities, not human users
- agent `slug` must be unique
- `capabilities` describe what an agent can do, not what it is currently doing
- valid `agent_type` values: `mock`, `langchain`, `langgraph`, `custom`
- valid `status` values: `online`, `offline`, `busy`, `error`

### Projects

- projects are top-level containers
- project `key` must be unique, uppercase, and match `^[A-Z][A-Z0-9_]*$`

### Stories

- stories group related tasks
- tasks link to stories via `story_id`

### Runs

- runs represent execution attempts, separate from task lifecycle
- valid `status` values: `queued`, `running`, `completed`, `failed`, `cancelled`
- valid `pipeline_type` values: `mock`, `dev_team`, `langchain`, `langgraph`

## Create Rules

### Create Task

Required:

- `project_id` (must be > 0)
- `title` (1–255 chars, auto-stripped)
- `status` (must be a valid `TaskStatusName`)
- `priority` (must be a valid `TaskPriorityName`)

Optional:

- `description`, `short_description`, `implementation_description`, `definition_of_done` (auto-stripped, empty becomes `null`)
- `assigned_agent_id` (must be > 0 if set)
- `human_owner` (auto-stripped, empty becomes `null`)
- `labels` (auto-deduplicated, sorted, stripped)
- `due_date`
- `story_id`, `parent_task_id` (must be > 0 if set)
- `queue_position` (must be >= 0 if set)

Behavior:

- use existing project ids and agent ids only
- labels are normalized automatically by the API
- choose a default status of `backlog` unless the user explicitly requests another lane
- choose a default priority of `medium` unless urgency is clear

### Create Agent

Required:

- `name` (1–255 chars, auto-stripped)

Optional:

- `slug` (auto-stripped, must be lowercase alphanumeric with hyphens if provided)
- `description` (auto-stripped, empty becomes `null`)
- `status` (must be a valid `AgentStatus`, default `online`)
- `agent_type` (must be a valid `AgentType`, default `mock`)
- `capabilities` (list of strings)
- `config` (typed as `dict[str, Any]`)

Behavior:

- if `slug` is omitted, derive it from the name
- if a slug collision exists, the backend will auto-suffix it
- default `status` to `online`
- default `agent_type` to `mock` unless a real runtime is configured

### Create Project

Required:

- `key` (1–32 chars, must match `^[A-Z][A-Z0-9_]*$`, auto-uppercased)
- `name` (1–255 chars, auto-stripped)

Optional:

- `description` (auto-stripped, empty becomes `null`)
- `root_path` (auto-stripped, empty becomes `null`)

Behavior:

- the API auto-uppercases the project key
- reject duplicates instead of silently mutating keys

## Update Rules

### Update Task

When changing a task:

- preserve existing fields that were not explicitly changed
- change only the intended status, priority, assignment, labels, owner, or description
- all string fields are auto-stripped; empty optional fields become `null`
- labels are auto-deduplicated and sorted
- status changes should follow board semantics:
  - `backlog` for not yet prepared work
  - `ready` for work that can be picked up
  - `running` for active execution
  - `review` for waiting on human review
  - `done` for completed accepted work
  - `failed` for blocked or failed execution
  - `architect` for design/planning phase
  - `develop` for active development
  - `testing` for test/QA phase

### Update Agent

When changing an agent:

- update capabilities as a deliberate list, not append-only text
- keep `agent_type` stable unless the runtime model actually changed
- use `offline` or `busy` only when the agent state truly changed

### Update Project

When changing a project:

- keep the `key` stable unless the user explicitly asks to rename it
- prefer changing `name` and `description` over changing identity fields

## Delete Rules

- do not delete tasks, agents, or projects without explicit user intent
- avoid destructive operations when reassignment or archiving would preserve history better

## Run Separation

- a task can move to `review` even if the latest run is `completed`
- a task can stay `failed` while future runs are retried
- run records should describe execution attempts, not replace task planning state

## Future LangChain and LangGraph Guidance

- keep agent configuration serializable through the backend API
- treat `config` as adapter-specific payload
- do not leak LangChain or LangGraph internal graph structure into generic task fields
- runtime-specific settings belong on the agent or run configuration side of the model
