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

## Domain Rules

### Tasks

- tasks belong to a project
- tasks may be assigned to an agent or left unassigned
- tasks have a board status and a priority
- owners and labels must be normalized through backend logic, not duplicated manually

### Agents

- agents represent runtime identities, not human users
- agent `slug` must be unique
- `capabilities` describe what an agent can do, not what it is currently doing
- `agent_type` should stay aligned with supported runtimes such as `mock`, `langchain`, or `langgraph`

### Projects

- projects are top-level containers
- project `key` must be unique and uppercase

## Create Rules

### Create Task

Required:

- `project_id`
- `title`
- `status`
- `priority`

Optional:

- `description`
- `assigned_agent_id`
- `human_owner`
- `labels`
- `due_date`

Behavior:

- use existing project ids and agent ids only
- normalize labels by trimming whitespace and removing duplicates
- choose a default status of `backlog` unless the user explicitly requests another lane
- choose a default priority of `medium` unless urgency is clear

### Create Agent

Required:

- `name`

Optional:

- `slug`
- `description`
- `status`
- `agent_type`
- `capabilities`
- `config`

Behavior:

- if `slug` is omitted, derive it from the name
- if a slug collision exists, the backend should suffix it
- default `status` to `online`
- default `agent_type` to `mock` unless a real runtime is configured

### Create Project

Required:

- `key`
- `name`

Optional:

- `description`

Behavior:

- uppercase the project key
- reject duplicates instead of silently mutating keys

## Update Rules

### Update Task

When changing a task:

- preserve existing fields that were not explicitly changed
- change only the intended status, priority, assignment, labels, owner, or description
- status changes should follow board semantics:
  - `backlog` for not yet prepared work
  - `ready` for work that can be picked up
  - `running` for active execution
  - `review` for waiting on human review
  - `done` for completed accepted work
  - `failed` for blocked or failed execution

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
