# Backend

## Run

```bash
../.venv/bin/python -m pip install -r requirements.txt
./run.sh --reload
```

The backend must be started with the root project virtualenv at [/.venv](/Users/Stanislav_Lazarenko/PycharmProjects/test_projects/ai-ui/.venv), not with a global `python` or `uvicorn`.

The current backend is a Phase 1 scaffold:

- FastAPI app
- SQLite connection wiring
- ORM model definitions
- seeded placeholder API responses
- orchestration boundary with a mock implementation

The next backend step is to replace seeded responses with repository-backed services and add Alembic migrations.
