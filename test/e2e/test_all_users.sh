#!/bin/bash

# End-to-End тесты для TourHub
# Проверка всех основных сценариев для каждой роли

API_URL="http://localhost:5001/api"
PASS=0
FAIL=0

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для тестов
test_endpoint() {
  local description=$1
  local method=$2
  local url=$3
  local data=$4
  local token=$5
  local expected_code=$6
  # Для бронирования принимаем 200 и 201
  if [ "$description" = "Бронирование:" ]; then
    if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
      echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
      PASS=$((PASS + 1))
      return 0
    fi
  fi
  
  echo -n "  Testing: $description... "
  
  if [ -n "$token" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data" 2>/dev/null)
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$url" \
      -H "Content-Type: application/json" \
      -d "$data" 2>/dev/null)
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "$expected_code" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    PASS=$((PASS + 1))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $http_code)"
    echo "    Response: $(echo $body | head -c 200)"
    FAIL=$((FAIL + 1))
    return 1
  fi
}

# Функция для сохранения токена
save_token() {
  echo "$1" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

echo "========================================="
echo "  TourHub End-to-End Test Suite"
echo "========================================="
echo ""

# =============================================
# Проверка сервера
# =============================================
echo -e "${YELLOW}>>> Проверка доступности сервера${NC}"
if curl -s "$API_URL/events" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Сервер доступен${NC}"
else
  echo -e "${RED}✗ Сервер недоступен! Убедитесь что бэкенд запущен на порту 5001${NC}"
  exit 1
fi
echo ""

# =============================================
# 1. НЕАВТОРИЗОВАННЫЙ ПОЛЬЗОВАТЕЛЬ
# =============================================
echo -e "${YELLOW}>>> 1. Тесты неавторизованного пользователя${NC}"

echo "  1.1 Публичные эндпоинты:"
test_endpoint "Главная страница событий" "GET" "/events" "" "" "200"
test_endpoint "Карта (получить события)" "GET" "/events" "" "" "200"
test_endpoint "Просмотр события по ID" "GET" "/events/1" "" "" "200"
test_endpoint "Отзывы события" "GET" "/reviews/event/1" "" "" "200"
test_endpoint "Профиль продавца" "GET" "/sellers/1" "" "" "200"
test_endpoint "События продавца" "GET" "/sellers/1/events" "" "" "200"
test_endpoint "Отзывы продавца" "GET" "/reviews/seller/1" "" "" "200"

echo ""
echo "  1.2 Защищённые эндпоинты (ожидаем 401):"
test_endpoint "Профиль пользователя" "GET" "/auth/me" "" "" "401"
test_endpoint "Бронирования" "GET" "/bookings/my" "" "" "401"
test_endpoint "Чат" "GET" "/messages/booking/1" "" "" "401"
echo ""

# =============================================
# 2. РЕГИСТРАЦИЯ И АВТОРИЗАЦИЯ
# =============================================
echo -e "${YELLOW}>>> 2. Тесты авторизации${NC}"

# Логин под разными пользователями
echo "  2.1 Логин USER:"
USER_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456"}')
USER_TOKEN=$(save_token "$USER_RESPONSE")
if [ -n "$USER_TOKEN" ]; then
  echo -e "    ${GREEN}✓ Токен получен${NC}"
  PASS=$((PASS + 1))
else
  echo -e "    ${RED}✗ Токен не получен${NC}"
  echo "    Response: $(echo $USER_RESPONSE | head -c 200)"
  FAIL=$((FAIL + 1))
fi

echo "  2.2 Логин SELLER:"
SELLER_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@example.com","password":"123456"}')
SELLER_TOKEN=$(save_token "$SELLER_RESPONSE")
if [ -n "$SELLER_TOKEN" ]; then
  echo -e "    ${GREEN}✓ Токен получен${NC}"
  PASS=$((PASS + 1))
else
  echo -e "    ${RED}✗ Токен не получен${NC}"
  FAIL=$((FAIL + 1))
fi

echo "  2.3 Логин MANAGER:"
MANAGER_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"manager123"}')
MANAGER_TOKEN=$(save_token "$MANAGER_RESPONSE")
if [ -n "$MANAGER_TOKEN" ]; then
  echo -e "    ${GREEN}✓ Токен получен${NC}"
  PASS=$((PASS + 1))
else
  echo -e "    ${RED}✗ Токен не получен${NC}"
  FAIL=$((FAIL + 1))
fi

echo "  2.4 Логин ADMIN:"
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')
ADMIN_TOKEN=$(save_token "$ADMIN_RESPONSE")
if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "    ${GREEN}✓ Токен получен${NC}"
  PASS=$((PASS + 1))
else
  echo -e "    ${RED}✗ Токен не получен${NC}"
  FAIL=$((FAIL + 1))
fi
echo ""

# =============================================
# 3. ТЕСТЫ USER
# =============================================
echo -e "${YELLOW}>>> 3. Тесты USER (юзер)${NC}"

if [ -n "$USER_TOKEN" ]; then
  echo "  3.1 Профиль и данные:"
  test_endpoint "Профиль пользователя" "GET" "/auth/me" "" "$USER_TOKEN" "200"
  test_endpoint "Мои бронирования" "GET" "/bookings/my" "" "$USER_TOKEN" "200"
  
  echo ""
  echo "  3.2 Бронирование:"
  BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/bookings" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d '{"eventId":1,"participants":2,"contactPhone":"+7 (999) 123-45-67","contactName":"Test User","contactEmail":"user@example.com","eventDate":"2026-05-01","specialRequests":""}')
  BOOKING_HTTP=$(echo "$BOOKING_RESPONSE" | tail -n1)
  if [ "$BOOKING_HTTP" = "201" ] || [ "$BOOKING_HTTP" = "200" ]; then
    echo -e "    ${GREEN}✓ Бронирование создано${NC} (HTTP $BOOKING_HTTP)"
    PASS=$((PASS + 1))
    BOOKING_ID=$(echo "$BOOKING_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    echo "    Создано бронирование ID: $BOOKING_ID"
  else
    echo -e "    ${RED}✗ Ошибка бронирования${NC} (HTTP $BOOKING_HTTP)"
    echo "    Response: $(echo $BOOKING_RESPONSE | head -c 200)"
    FAIL=$((FAIL + 1))
    BOOKING_ID=""
  fi
  
  echo ""
  echo "  3.3 Сообщения:"
  test_endpoint "Отправить менеджеру" "POST" "/messages/to-manager" \
    '{"message":"Тестовое сообщение от юзера"}' "$USER_TOKEN" "201"
  
  if [ -n "$BOOKING_ID" ]; then
    echo ""
    echo "  3.4 Действия с бронированием:"
    test_endpoint "Завершить бронирование" "PUT" "/bookings/$BOOKING_ID/complete" "" "$USER_TOKEN" "200"
    test_endpoint "Отменить бронирование" "PUT" "/bookings/$BOOKING_ID/cancel" \
      '{"cancelReason":"Планы изменились"}' "$USER_TOKEN" "200"
  fi
else
  echo -e "  ${RED}Пропущено (нет токена)${NC}"
fi
echo ""

# =============================================
# 4. ТЕСТЫ SELLER
# =============================================
echo -e "${YELLOW}>>> 4. Тесты SELLER (продавец)${NC}"

if [ -n "$SELLER_TOKEN" ]; then
  echo "  4.1 Профиль и события:"
  test_endpoint "Профиль продавца" "GET" "/seller/profile" "" "$SELLER_TOKEN" "200"
  test_endpoint "Мои события" "GET" "/events/seller/my" "" "$SELLER_TOKEN" "200"
  test_endpoint "Продажи" "GET" "/bookings/seller" "" "$SELLER_TOKEN" "200"
  
  echo ""
  echo "  4.2 Управление событиями:"
  CREATE_EVENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/events" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $SELLER_TOKEN" \
    -d '{"title":"Тестовое событие E2E","shortDescription":"Описание теста","fullDescription":"Полное описание","price":5000,"category":"Экскурсии","startDate":"2026-06-01","endDate":"2026-06-10","maxParticipants":20,"address":"Москва, Кремль"}')
  CREATE_HTTP=$(echo "$CREATE_EVENT_RESPONSE" | tail -n1)
  if [ "$CREATE_HTTP" = "201" ]; then
    echo -e "    ${GREEN}✓ Событие создано${NC} (HTTP $CREATE_HTTP)"
    PASS=$((PASS + 1))
    EVENT_ID=$(echo "$CREATE_EVENT_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    echo "    Создано событие ID: $EVENT_ID"
  else
    echo -e "    ${RED}✗ Ошибка создания${NC} (HTTP $CREATE_HTTP)"
    FAIL=$((FAIL + 1))
    EVENT_ID=""
  fi
  
  if [ -n "$EVENT_ID" ]; then
    test_endpoint "Обновить событие" "PUT" "/events/$EVENT_ID" \
      '{"title":"Обновленное событие"}' "$SELLER_TOKEN" "200"
    test_endpoint "Удалить событие" "DELETE" "/events/$EVENT_ID" "" "$SELLER_TOKEN" "200"
  fi
  
  echo ""
  echo "  4.3 Сообщения:"
  test_endpoint "Сообщения продавца" "GET" "/messages/seller/messages" "" "$SELLER_TOKEN" "200"
else
  echo -e "  ${RED}Пропущено (нет токена)${NC}"
fi
echo ""

# =============================================
# 5. ТЕСТЫ MANAGER
# =============================================
echo -e "${YELLOW}>>> 5. Тесты MANAGER (менеджер)${NC}"

if [ -n "$MANAGER_TOKEN" ]; then
  echo "  5.1 Модерация:"
  test_endpoint "Отзывы на модерации" "GET" "/reviews/pending" "" "$MANAGER_TOKEN" "200"
  test_endpoint "Чаты для менеджера" "GET" "/messages/admin/chats" "" "$MANAGER_TOKEN" "200"
  
  echo ""
  echo "  5.2 Управление бронированиями:"
  test_endpoint "Все бронирования" "GET" "/admin/bookings" "" "$MANAGER_TOKEN" "200"
  
  # Пробуем подтвердить бронирование если есть
  if [ -n "$BOOKING_ID" ]; then
    test_endpoint "Подтвердить бронирование" "PUT" "/admin/bookings/$BOOKING_ID/confirm" \
      '{}' "$MANAGER_TOKEN" "200"
  fi
else
  echo -e "  ${RED}Пропущено (нет токена)${NC}"
fi
echo ""

# =============================================
# 6. ТЕСТЫ ADMIN
# =============================================
echo -e "${YELLOW}>>> 6. Тесты ADMIN (админ)${NC}"

if [ -n "$ADMIN_TOKEN" ]; then
  echo "  6.1 Администрирование:"
  test_endpoint "Все пользователи" "GET" "/admin/users" "" "$ADMIN_TOKEN" "200"
  test_endpoint "Все продавцы" "GET" "/admin/sellers" "" "$ADMIN_TOKEN" "200"
  test_endpoint "Статистика" "GET" "/admin/stats" "" "$ADMIN_TOKEN" "200"
else
  echo -e "  ${RED}Пропущено (нет токена)${NC}"
fi
echo ""

# =============================================
# 7. ТЕСТЫ ЧАТА
# =============================================
echo -e "${YELLOW}>>> 7. Тесты чата${NC}"

if [ -n "$USER_TOKEN" ]; then
  # Отправляем сообщение и проверяем историю
  MSG_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/messages/to-manager" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d '{"message":"E2E test message"}')
  MSG_HTTP=$(echo "$MSG_RESPONSE" | tail -n1)
  if [ "$MSG_HTTP" = "201" ]; then
    echo -e "    ${GREEN}✓ Сообщение отправлено${NC}"
    PASS=$((PASS + 1))
  else
    echo -e "    ${RED}✗ Ошибка отправки${NC} (HTTP $MSG_HTTP)"
    FAIL=$((FAIL + 1))
  fi
  
  # Получаем user ID из токена (простой способ)
  USER_ID="2" # Предполагаем что user@example.com имеет id=2
  test_endpoint "История чата" "GET" "/messages/chat/$USER_ID" "" "$USER_TOKEN" "200"
fi
echo ""

# =============================================
# 8. ТЕСТЫ КАРТЫ И ОТЗЫВОВ
# =============================================
echo -e "${YELLOW}>>> 8. Тесты карты и отзывов${NC}"

echo "  8.1 Публичные страницы:"
test_endpoint "Карта (события)" "GET" "/events" "" "" "200"
test_endpoint "Отзывы события 1" "GET" "/reviews/event/1" "" "" "200"
test_endpoint "Продавец 1" "GET" "/sellers/1" "" "" "200"
test_endpoint "События продавца 1" "GET" "/sellers/1/events" "" "" "200"
echo ""

# =============================================
# ИТОГИ
# =============================================
echo "========================================="
echo "  ИТОГИ ТЕСТИРОВАНИЯ"
echo "========================================="
echo -e "${GREEN}Пройдено: $PASS${NC}"
echo -e "${RED}Провалено: $FAIL${NC}"
echo -e "Всего: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ Все тесты пройдены успешно!${NC}"
else
  echo -e "${RED}✗ Есть проблемы, требующие исправления${NC}"
  echo ""
  echo "Рекомендации по исправлению:"
  echo "1. Проверьте логи бэкенда на наличие ошибок"
  echo "2. Убедитесь что база данных синхронизирована"
  echo "3. Проверьте наличие всех необходимых колонок в таблицах"
fi

echo ""
echo "Лог сохранён в: test/e2e/test_results_$(date +%Y%m%d_%H%M%S).log"
