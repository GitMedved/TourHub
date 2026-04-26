#!/bin/bash

echo "========================================"
echo "  TRAVEL AGGREGATOR - FULL START"
echo "========================================"
echo ""

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Параметры
BACKEND_PORT=5001
FRONTEND_PORT=3000
BACKEND_DIR="$HOME/travel-aggregator-node/backend"
FRONTEND_DIR="$HOME/travel-aggregator-node/frontend"

echo -e "${BLUE}📋 STEP 1: CHECK PORTS${NC}"
echo "----------------------------------------"

# Проверка портов
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠ Port $1 is in use${NC}"
        return 1
    else
        echo -e "${GREEN}✓ Port $1 is free${NC}"
        return 0
    fi
}

check_port $BACKEND_PORT
check_port $FRONTEND_PORT

echo ""
echo -e "${BLUE}📋 STEP 2: START DOCKER DATABASE${NC}"
echo "----------------------------------------"

# Проверка и запуск PostgreSQL контейнера
if docker ps | grep -q travel_postgres; then
    echo -e "${GREEN}✓ PostgreSQL container is already running${NC}"
else
    echo "Starting PostgreSQL container..."
    docker run -d \
        --name travel_postgres \
        -e POSTGRES_DB=travel_aggregator \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -p 5435:5432 \
        postgres:15-alpine
    echo -e "${GREEN}✓ PostgreSQL container started${NC}"
fi

echo ""
echo -e "${BLUE}📋 STEP 3: START BACKEND${NC}"
echo "----------------------------------------"

# Запуск backend в фоне
cd $BACKEND_DIR

if [ -f "src/app.js" ]; then
    echo "Starting backend server on port $BACKEND_PORT..."
    PORT=$BACKEND_PORT node src/app.js &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    echo "  API URL: http://localhost:$BACKEND_PORT"
    echo "  Health: http://localhost:$BACKEND_PORT/api/health"
else
    echo -e "${RED}✗ Backend not found at $BACKEND_DIR${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 STEP 4: START FRONTEND${NC}"
echo "----------------------------------------"

# Запуск frontend в фоне
cd $FRONTEND_DIR

if [ -d "node_modules" ] && [ -f "node_modules/.bin/react-scripts" ]; then
    echo "Starting frontend on port $FRONTEND_PORT..."
    PORT=$FRONTEND_PORT npm start &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
    echo "  App URL: http://localhost:$FRONTEND_PORT"
else
    echo -e "${RED}✗ Frontend not found or not installed at $FRONTEND_DIR${NC}"
    echo "  Please run: npm install"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 STEP 5: WAITING FOR SERVICES${NC}"
echo "----------------------------------------"

# Ожидание готовности backend
echo -n "Waiting for backend"
for i in {1..10}; do
    if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        echo -e "\n${GREEN}✓ Backend is ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Ожидание готовности frontend
echo -n "Waiting for frontend"
for i in {1..20}; do
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        echo -e "\n${GREEN}✓ Frontend is ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "========================================"
echo -e "${GREEN}✅ ALL SERVICES STARTED SUCCESSFULLY!${NC}"
echo "========================================"
echo ""
echo "📍 Access the application:"
echo "   Web App: http://localhost:$FRONTEND_PORT"
echo "   API: http://localhost:$BACKEND_PORT"
echo "   Health: http://localhost:$BACKEND_PORT/api/health"
echo "   Events: http://localhost:$BACKEND_PORT/api/events"
echo ""
echo "📝 To stop all services, run: ./stop-all.sh"
echo "========================================"

# Сохраняем PID для остановки
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# Ожидание завершения (Ctrl+C)
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Обработка Ctrl+C
trap cleanup INT

cleanup() {
    echo ""
    echo -e "${BLUE}🛑 Stopping services...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    rm -f .backend.pid .frontend.pid
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Ждем завершения
wait
