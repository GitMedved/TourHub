#!/bin/bash

echo "========================================"
echo "  TRAVEL AGGREGATOR - CREATE USERS"
echo "========================================"
echo ""

# Цвета
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:5001"

echo -e "${BLUE}📋 STEP 1: CHECK SERVER${NC}"
echo "----------------------------------------"

if curl -s ${BASE_URL}/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running. Please start the application first.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 STEP 2: CREATE REGULAR USER${NC}"
echo "----------------------------------------"

echo "Creating regular user..."
REGULAR_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"123456","firstName":"Regular","lastName":"User"}')

if echo "$REGULAR_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Regular user created: user@example.com / 123456${NC}"
else
    echo -e "${YELLOW}⚠ Regular user may already exist${NC}"
fi

echo ""
echo -e "${BLUE}📋 STEP 3: CREATE SELLER${NC}"
echo "----------------------------------------"

echo "Creating seller user..."
SELLER_USER_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"seller@example.com","password":"seller123","firstName":"Seller","lastName":"User"}')

if echo "$SELLER_USER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Seller user created: seller@example.com / seller123${NC}"
    SELLER_TOKEN=$(echo "$SELLER_USER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
else
    echo -e "${YELLOW}⚠ Seller user may already exist${NC}"
    SELLER_TOKEN=$(curl -s -X POST ${BASE_URL}/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"seller@example.com","password":"seller123"}' | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
fi

echo "Registering seller business account..."
SELLER_REGISTER_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/seller/register \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${SELLER_TOKEN}" \
    -d '{
        "companyName": "Travel Agency Pro",
        "description": "Professional travel agency offering unique tours",
        "phone": "+7 (495) 123-45-67",
        "address": "Moscow, Tverskaya str., 1",
        "inn": "123456789012",
        "ogrn": "123456789012345"
    }')

if echo "$SELLER_REGISTER_RESPONSE" | grep -q "companyName"; then
    echo -e "${GREEN}✓ Seller business account registered${NC}"
else
    echo -e "${YELLOW}⚠ Seller business account may already exist${NC}"
fi

echo ""
echo -e "${BLUE}📋 STEP 4: CREATE MANAGER${NC}"
echo "----------------------------------------"

echo "Creating manager user..."
MANAGER_USER_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"manager@example.com","password":"manager123","firstName":"Manager","lastName":"User"}')

if echo "$MANAGER_USER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Manager user created: manager@example.com / manager123${NC}"
    MANAGER_TOKEN=$(echo "$MANAGER_USER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
else
    echo -e "${YELLOW}⚠ Manager user may already exist${NC}"
    MANAGER_TOKEN=$(curl -s -X POST ${BASE_URL}/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"manager@example.com","password":"manager123"}' | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
fi

echo ""
echo -e "${BLUE}📋 STEP 5: CREATE ADMIN${NC}"
echo "----------------------------------------"

echo "Creating admin user..."
ADMIN_USER_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"admin123","firstName":"Super","lastName":"Admin"}')

if echo "$ADMIN_USER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✓ Admin user created: admin@example.com / admin123${NC}"
    ADMIN_TOKEN=$(echo "$ADMIN_USER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
else
    echo -e "${YELLOW}⚠ Admin user may already exist${NC}"
    ADMIN_TOKEN=$(curl -s -X POST ${BASE_URL}/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@example.com","password":"admin123"}' | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)
fi

echo ""
echo -e "${BLUE}📋 STEP 6: UPDATE ROLES IN DATABASE${NC}"
echo "----------------------------------------"

echo "Updating roles in database..."

docker exec -it travel_postgres psql -U postgres -d travel_aggregator -c "UPDATE \"Users\" SET role = 'MANAGER' WHERE email = 'manager@example.com';" 2>/dev/null
docker exec -it travel_postgres psql -U postgres -d travel_aggregator -c "UPDATE \"Users\" SET role = 'SELLER' WHERE email = 'seller@example.com';" 2>/dev/null
docker exec -it travel_postgres psql -U postgres -d travel_aggregator -c "UPDATE \"Users\" SET role = 'ADMIN' WHERE email = 'admin@example.com';" 2>/dev/null

echo -e "${GREEN}✓ Roles updated in database${NC}"

echo ""
echo "========================================"
echo -e "${GREEN}✅ USERS CREATED SUCCESSFULLY!${NC}"
echo "========================================"
echo ""
echo "📋 User credentials:"
echo ""
echo "┌─────────────────┬────────────────────────────┬──────────────────┐"
echo "│ Role            │ Email                      │ Password         │"
echo "├─────────────────┼────────────────────────────┼──────────────────┤"
echo "│ 👤 User         │ user@example.com           │ 123456           │"
echo "├─────────────────┼────────────────────────────┼──────────────────┤"
echo "│ 🏪 Seller       │ seller@example.com         │ seller123        │"
echo "├─────────────────┼────────────────────────────┼──────────────────┤"
echo "│ 👑 Manager      │ manager@example.com        │ manager123       │"
echo "├─────────────────┼────────────────────────────┼──────────────────┤"
echo "│ 🚀 Admin        │ admin@example.com          │ admin123         │"
echo "└─────────────────┴────────────────────────────┴──────────────────┘"
echo ""
echo "🔗 Access links:"
echo "   - Main page: http://localhost:3000"
echo "   - Seller dashboard: http://localhost:3000/seller"
echo "   - Manager dashboard: http://localhost:3000/manager"
echo "   - Admin dashboard: http://localhost:3000/admin"
echo ""
echo "========================================"
