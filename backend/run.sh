#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_PYTHON="$ROOT_DIR/backend/.venv/bin/python"

if [[ ! -x "$VENV_PYTHON" ]]; then
  echo "Missing virtualenv interpreter at $VENV_PYTHON" >&2
  exit 1
fi

cd "$ROOT_DIR/backend"
exec "$VENV_PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 "$@"
