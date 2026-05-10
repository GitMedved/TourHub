#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "========================================"
echo "  RESTARTING TOURHUB SERVICES"
echo "========================================"

echo "1. Stopping existing services..."
"$ROOT_DIR/scripts/stop-all.sh"

echo "2. Starting services..."
"$ROOT_DIR/scripts/full-start.sh"
