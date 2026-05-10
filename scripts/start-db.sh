#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/backend/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-travel_aggregator}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_PORT="${DB_PORT:-5432}"
PG_BIN="/Library/PostgreSQL/15/bin"
PG_DATA="/Library/PostgreSQL/15/data"
PG_LOG="$PG_DATA/pg_log/startup.log"

pg_cmd() {
  local command_name="$1"
  if command -v "$command_name" >/dev/null 2>&1; then
    command -v "$command_name"
  elif [[ -x "$PG_BIN/$command_name" ]]; then
    echo "$PG_BIN/$command_name"
  else
    return 1
  fi
}

check_tcp_ready() {
  local pg_isready_bin
  pg_isready_bin="$(pg_cmd pg_isready 2>/dev/null || true)"
  [[ -n "$pg_isready_bin" ]] || return 1
  PGPASSWORD="$DB_PASSWORD" "$pg_isready_bin" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1
}

print_db_ok() {
  local psql_bin
  psql_bin="$(pg_cmd psql 2>/dev/null || true)"
  if [[ -n "$psql_bin" ]]; then
    PGPASSWORD="$DB_PASSWORD" "$psql_bin" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 'DB OK' as status;"
  else
    echo "PostgreSQL OK"
  fi
}

if check_tcp_ready; then
  echo "PostgreSQL already running on $DB_HOST:$DB_PORT."
  print_db_ok
  exit 0
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "Starting PostgreSQL with Docker Compose..."
  (cd "$ROOT_DIR" && DB_NAME="$DB_NAME" DB_USER="$DB_USER" DB_PASSWORD="$DB_PASSWORD" DB_PORT="$DB_PORT" docker compose up -d postgres)
  echo "Done. Checking connection..."
  (cd "$ROOT_DIR" && docker compose exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME")
  exit 0
fi

if [[ -f /Library/LaunchDaemons/com.edb.launchd.postgresql-15.plist ]]; then
  echo "Starting local PostgreSQL 15 with launchctl..."
  sudo launchctl load -w /Library/LaunchDaemons/com.edb.launchd.postgresql-15.plist 2>/dev/null || true
  sleep 3
  if check_tcp_ready; then
    print_db_ok
    exit 0
  fi
fi

if [[ -x "$PG_BIN/pg_ctl" ]]; then
  echo "Starting local PostgreSQL 15 with pg_ctl..."
  if [[ -w "$PG_DATA" ]]; then
    "$PG_BIN/pg_ctl" start -D "$PG_DATA" -l "$PG_LOG"
  else
    sudo -u postgres "$PG_BIN/pg_ctl" start -D "$PG_DATA" -l "$PG_LOG"
  fi
  sleep 3
  if check_tcp_ready; then
    print_db_ok
    exit 0
  fi
fi

echo "Cannot start PostgreSQL automatically." >&2
echo "Install Docker Desktop, start PostgreSQL manually, or update DB_* variables in backend/.env." >&2
exit 1
