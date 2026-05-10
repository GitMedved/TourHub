#!/bin/bash
set -e
GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}Starting TourHub...${NC}"

echo -e "${CYAN}[1/3] Checking PostgreSQL...${NC}"
if ! sudo /Library/PostgreSQL/15/bin/psql -U postgres -d travel_aggregator -c "SELECT 1" > /dev/null 2>&1; then
  echo "Starting PostgreSQL..."
  sudo /Library/PostgreSQL/15/bin/pg_ctl start -D /Library/PostgreSQL/15/data -l /tmp/pg.log
  sleep 3
fi
echo -e "${GREEN}PostgreSQL OK${NC}"

echo -e "${CYAN}[2/3] Starting backend...${NC}"
cd "$(dirname "$0")/../backend"
node src/app.js &
BACKEND_PID=$!
echo -e "${GREEN}Backend PID: $BACKEND_PID${NC}"
sleep 2

echo -e "${CYAN}[3/3] Starting frontend...${NC}"
cd "$(dirname "$0")/../frontend"
npm start &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend PID: $FRONTEND_PID${NC}"

echo ""
echo -e "${GREEN}TourHub running!${NC}"
echo "  Backend:  http://localhost:5001"
echo "  Frontend: http://localhost:3000"
echo ""
echo "PIDs: backend=$BACKEND_PID frontend=$FRONTEND_PID"
echo "Stop: kill $BACKEND_PID $FRONTEND_PID"

wait
