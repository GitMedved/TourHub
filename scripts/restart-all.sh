#!/bin/bash

echo "========================================"
echo "  RESTARTING ALL SERVICES"
echo "========================================"

cd ~/travel-aggregator-node

echo "1. Stopping all services..."
./stop-all.sh 2>/dev/null

echo "2. Restarting PostgreSQL..."
docker restart travel_postgres 2>/dev/null

sleep 3

echo "3. Starting backend..."
cd ~/travel-aggregator-node/backend
node src/app.js &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

sleep 5

echo "4. Starting frontend..."
cd ~/travel-aggregator-node/frontend
PORT=3000 npm start &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "========================================"
echo "✅ SERVICES STARTED!"
echo "   Backend: http://localhost:5001"
echo "   Frontend: http://localhost:3000"
echo "========================================"
