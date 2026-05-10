#!/bin/bash
set -euo pipefail

GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PID=""
FRONTEND_PID=""
BACKEND_PORT="5001"
FRONTEND_PORT="3000"
ENV_FILE="$ROOT_DIR/backend/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

BACKEND_PORT="${PORT:-$BACKEND_PORT}"
FRONTEND_PORT="${FRONTEND_PORT:-$FRONTEND_PORT}"

cleanup() {
  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

require_dir() {
  if [[ ! -d "$1" ]]; then
    echo -e "${RED}Missing directory: $1${NC}" >&2
    exit 1
  fi
}

port_pids() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true
  fi
}

require_free_port() {
  local port="$1"
  local service="$2"
  local pids
  pids="$(port_pids "$port" | tr '\n' ' ' | sed 's/[[:space:]]*$//')"

  if [[ -n "$pids" ]]; then
    echo -e "${RED}$service port $port is already in use by PID(s): $pids${NC}" >&2
    echo -e "${YELLOW}Run: bash scripts/stop-all.sh${NC}" >&2
    echo -e "${YELLOW}Or manually: lsof -tiTCP:$port -sTCP:LISTEN | xargs kill${NC}" >&2
    exit 1
  fi
}

require_dir "$ROOT_DIR/backend"
require_dir "$ROOT_DIR/frontend"

if [[ ! -d "$ROOT_DIR/backend/node_modules" ]]; then
  echo -e "${RED}backend/node_modules not found. Run: cd backend && npm install${NC}" >&2
  exit 1
fi

if [[ ! -d "$ROOT_DIR/frontend/node_modules" ]]; then
  echo -e "${RED}frontend/node_modules not found. Run: cd frontend && npm install${NC}" >&2
  exit 1
fi

require_free_port "$BACKEND_PORT" "Backend"
require_free_port "$FRONTEND_PORT" "Frontend"

echo -e "${CYAN}Starting TourHub...${NC}"

echo -e "${CYAN}[1/3] Checking PostgreSQL...${NC}"
"$ROOT_DIR/scripts/start-db.sh"
echo -e "${GREEN}PostgreSQL OK${NC}"

echo -e "${CYAN}[2/3] Starting backend...${NC}"
(cd "$ROOT_DIR/backend" && node src/app.js) &
BACKEND_PID=$!
echo "$BACKEND_PID" > "$ROOT_DIR/.backend.pid"
echo -e "${GREEN}Backend PID: $BACKEND_PID${NC}"
sleep 2

if ! kill -0 "$BACKEND_PID" >/dev/null 2>&1; then
  echo -e "${RED}Backend failed to stay running. Check the error above.${NC}" >&2
  exit 1
fi

echo -e "${CYAN}[3/3] Starting frontend...${NC}"
(cd "$ROOT_DIR/frontend" && npm start) &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > "$ROOT_DIR/.frontend.pid"
echo -e "${GREEN}Frontend PID: $FRONTEND_PID${NC}"

echo ""
echo -e "${GREEN}TourHub running!${NC}"
echo "  Backend:  http://localhost:$BACKEND_PORT"
echo "  Frontend: http://localhost:$FRONTEND_PORT"
echo ""
echo "PIDs: backend=$BACKEND_PID frontend=$FRONTEND_PID"
echo "Stop: bash scripts/stop-all.sh"

wait
