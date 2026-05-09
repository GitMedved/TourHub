#!/bin/bash
API_URL="http://localhost:5001/api"
PASS=0
FAIL=0
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_endpoint() {
  local description=$1 method=$2 url=$3 data=$4 token=$5 expected=$6
  echo -n "  Testing: $description... "
  
  if [ -n "$token" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" -d "$data" 2>/dev/null)
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$url" \
      -H "Content-Type: application/json" -d "$data" 2>/dev/null)
  fi
  
  http_code=$(echo "$response" | tail -n1)
  
  # Для бронирования принимаем 200 и 201
  if echo "$description" | grep -q "Бронирование:"; then
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
      echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
      PASS=$((PASS + 1))
      return 0
    fi
  fi
  
  if [ "$http_code" = "$expected" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    PASS=$((PASS + 1))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected, got $http_code)"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

save_token() {
  echo "$1" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

echo "========================================="
echo "  TourHub E2E Test Suite (Fixed)"
echo "========================================="
echo ""

# Проверка сервера
if ! curl -s "$API_URL/events" > /dev/null 2>&1; then
  echo -e "${RED}✗ Сервер недоступен!${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Сервер доступен${NC}"
echo ""

# Публичные
echo -e "${YELLOW}>>> Публичные эндпоинты${NC}"
test_endpoint "События" "GET" "/events" "" "" "200"
test_endpoint "Событие по ID" "GET" "/events/1" "" "" "200"
test_endpoint "Отзывы события" "GET" "/reviews/event/1" "" "" "200"
test_endpoint "Профиль продавца" "GET" "/sellers/1" "" "" "200"
test_endpoint "События продавца" "GET" "/sellers/1/events" "" "" "200"
test_endpoint "Отзывы продавца" "GET" "/reviews/seller/1" "" "" "200"
echo ""

# Авторизация
echo -e "${YELLOW}>>> Авторизация${NC}"
USER_TOKEN=$(save_token "$(curl -s -X POST "$API_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"123456"}')")
SELLER_TOKEN=$(save_token "$(curl -s -X POST "$API_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"seller@example.com","password":"seller123"}')")
MANAGER_TOKEN=$(save_token "$(curl -s -X POST "$API_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"manager@example.com","password":"manager123"}')")
ADMIN_TOKEN=$(save_token "$(curl -s -X POST "$API_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin123"}')")

[ -n "$USER_TOKEN" ] && echo -e "  ${GREEN}✓ USER токен${NC}" && PASS=$((PASS+1)) || { echo -e "  ${RED}✗ USER токен${NC}"; FAIL=$((FAIL+1)); }
[ -n "$SELLER_TOKEN" ] && echo -e "  ${GREEN}✓ SELLER токен${NC}" && PASS=$((PASS+1)) || { echo -e "  ${RED}✗ SELLER токен${NC}"; FAIL=$((FAIL+1)); }
[ -n "$MANAGER_TOKEN" ] && echo -e "  ${GREEN}✓ MANAGER токен${NC}" && PASS=$((PASS+1)) || { echo -e "  ${RED}✗ MANAGER токен${NC}"; FAIL=$((FAIL+1)); }
[ -n "$ADMIN_TOKEN" ] && echo -e "  ${GREEN}✓ ADMIN токен${NC}" && PASS=$((PASS+1)) || { echo -e "  ${RED}✗ ADMIN токен${NC}"; FAIL=$((FAIL+1)); }
echo ""

# USER тесты
echo -e "${YELLOW}>>> USER тесты${NC}"
test_endpoint "Профиль" "GET" "/auth/me" "" "$USER_TOKEN" "200"
test_endpoint "Мои бронирования" "GET" "/bookings/my" "" "$USER_TOKEN" "200"
test_endpoint "Бронирование:" "POST" "/bookings" '{"eventId":1,"participants":2,"contactPhone":"+7 (999) 123-45-67","contactName":"Test","contactEmail":"user@example.com","eventDate":"2026-05-01"}' "$USER_TOKEN" "201"
test_endpoint "Сообщение менеджеру" "POST" "/messages/to-manager" '{"message":"E2E test"}' "$USER_TOKEN" "201"
echo ""

# SELLER тесты
echo -e "${YELLOW}>>> SELLER тесты${NC}"
test_endpoint "Профиль продавца" "GET" "/sellers/profile" "" "$SELLER_TOKEN" "200"
test_endpoint "Мои события" "GET" "/events/seller/my" "" "$SELLER_TOKEN" "200"
test_endpoint "Продажи" "GET" "/bookings/seller" "" "$SELLER_TOKEN" "200"
echo ""

# MANAGER тесты
echo -e "${YELLOW}>>> MANAGER тесты${NC}"
test_endpoint "Отзывы на модерации" "GET" "/reviews/pending" "" "$MANAGER_TOKEN" "200"
test_endpoint "Чаты" "GET" "/messages/admin/chats" "" "$MANAGER_TOKEN" "200"
test_endpoint "Бронирования" "GET" "/admin/bookings" "" "$MANAGER_TOKEN" "200"
echo ""

# ADMIN тесты
echo -e "${YELLOW}>>> ADMIN тесты${NC}"
test_endpoint "Пользователи" "GET" "/admin/users" "" "$ADMIN_TOKEN" "200"
test_endpoint "Продавцы" "GET" "/admin/sellers" "" "$ADMIN_TOKEN" "200"
test_endpoint "Статистика" "GET" "/admin/stats" "" "$ADMIN_TOKEN" "200"
echo ""

# Итоги
echo "========================================="
echo "  РЕЗУЛЬТАТ: $PASS / $((PASS + FAIL))"
echo "========================================="
[ $FAIL -eq 0 ] && echo -e "${GREEN}✓ Все тесты пройдены!${NC}" || echo -e "${RED}✗ Провалено: $FAIL${NC}"
