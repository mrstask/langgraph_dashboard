# Backend

## Run

```bash
../.venv/bin/python -m pip install -r requirements.txt
./run.sh --reload
```

The backend must be started with the root project virtualenv at [/.venv](/Users/Stanislav_Lazarenko/PycharmProjects/test_projects/ai-ui/.venv), not with a global `python` or `uvicorn`.

## Architecture

- FastAPI app with versioned Alembic migrations
- SQLAlchemy ORM models in `app/models`
- Pydantic v2 schemas in `app/schemas` with strict validation
- Repository pattern in `app/repositories`
- Service layer in `app/services` for business logic
- Orchestration boundary in `app/orchestration`

## Schema Validation

All input validation is handled by Pydantic schemas at the API boundary:

- **Literal types** constrain status, priority, agent_type, and similar fields to fixed valid values
- **Annotated validators** (`app/schemas/_validators.py`) auto-strip strings, normalize empty strings to `None`, and deduplicate/sort label lists
- **Field constraints** enforce `min_length`, `max_length`, `gt=0`, `ge=0`, and regex patterns
- **`ConfigDict(from_attributes=True)`** on all Read schemas for ORM compatibility
- **Typed dicts** (`dict[str, Any]`) replace untyped `dict` fields

Services contain only business logic that requires database access (uniqueness checks, entity lookups, ID-to-code mappings). They do not duplicate stripping, empty checks, or type validation.

## Adding a New Literal Value

When a new status, type, or similar value is needed:

1. Add it to the `Literal` type in the relevant schema (e.g. `AgentStatus` in `app/schemas/agent.py`)
2. If it maps to a numeric code (task status/priority), also add it to `app/constants/task_metadata.py`
3. Update `PROJECT_DOC.md` and `LLM_OPERATIONS.md` to document the new value
