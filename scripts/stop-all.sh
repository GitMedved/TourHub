#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/backend/.env"
BACKEND_PORT="5001"
FRONTEND_PORT="3000"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

BACKEND_PORT="${PORT:-$BACKEND_PORT}"
FRONTEND_PORT="${FRONTEND_PORT:-$FRONTEND_PORT}"

echo "🛑 Stopping TourHub services..."

stop_pid_file() {
  local file="$1"
  local label="$2"

  if [[ -f "$file" ]]; then
    local pid
    pid="$(cat "$file")"
    if [[ -n "$pid" ]] && kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" 2>/dev/null || true
      echo "✓ $label stopped (PID: $pid)"
    fi
    rm -f "$file"
  fi
}

stop_port() {
  local port="$1"
  local label="$2"

  if ! command -v lsof >/dev/null 2>&1; then
    return 0
  fi

  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill 2>/dev/null || true
    echo "✓ $label port $port released (PID(s): $(echo "$pids" | tr '\n' ' ' | sed 's/[[:space:]]*$//'))"
  fi
}

stop_pid_file "$ROOT_DIR/.frontend.pid" "Frontend"
stop_pid_file "$ROOT_DIR/.backend.pid" "Backend"
stop_pid_file "$ROOT_DIR/frontend/.frontend.pid" "Frontend"
stop_pid_file "$ROOT_DIR/frontend/.backend.pid" "Backend"

stop_port "$FRONTEND_PORT" "Frontend"
stop_port "$BACKEND_PORT" "Backend"

echo "✅ TourHub services stopped"
