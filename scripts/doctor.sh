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

check_file() {
  local file="$1"
  local label="$2"
  if [[ -e "$file" ]]; then
    echo "✓ $label: $file"
  else
    echo "✗ $label missing: $file"
  fi
}

print_port() {
  local port="$1"
  local label="$2"
  if command -v lsof >/dev/null 2>&1; then
    local rows
    rows="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$rows" ]]; then
      echo "⚠ $label port $port is busy:"
      echo "$rows"
    else
      echo "✓ $label port $port is free"
    fi
  else
    echo "? Cannot check $label port $port: lsof not installed"
  fi
}

echo "TourHub doctor"
echo "=============="
echo "Repo: $ROOT_DIR"
echo "Git HEAD: $(git -C "$ROOT_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown)"
echo "Branch: $(git -C "$ROOT_DIR" branch --show-current 2>/dev/null || echo unknown)"
echo ""

check_file "$ROOT_DIR/backend/.env" "Backend env"
check_file "$ROOT_DIR/frontend/.env" "Frontend env"
check_file "$ROOT_DIR/backend/node_modules" "Backend dependencies"
check_file "$ROOT_DIR/frontend/node_modules" "Frontend dependencies"

echo ""
print_port "$BACKEND_PORT" "Backend"
print_port "$FRONTEND_PORT" "Frontend"

echo ""
echo "If a TourHub port is busy, run: bash scripts/stop-all.sh"
echo "To start everything, run: bash scripts/full-start.sh"
