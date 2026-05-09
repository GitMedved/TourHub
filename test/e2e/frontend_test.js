// End-to-End тесты фронтенда TourHub
// Запуск: node test/e2e/frontend_test.js

const API = 'http://localhost:5001/api';
const FRONT = 'http://localhost:3000';

const results = [];
let passed = 0;
let failed = 0;

function log(icon, msg) {
  console.log(`${icon} ${msg}`);
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    log('✅', name);
  } catch (e) {
    failed++;
    log('❌', `${name} - ${e.message}`);
  }
}

async function api(method, url, token, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, data: await res.json() };
}

async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  return data.token;
}

(async () => {
  console.log('\n=========================================');
  console.log('  TourHub Frontend E2E Tests');
  console.log('=========================================\n');

  // ==========================================
  // 1. Проверка доступности
  // ==========================================
  console.log('>>> 1. Доступность сервисов');
  
  await test('Бэкенд доступен', async () => {
    const res = await fetch(`${API}/events`);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  await test('Фронтенд доступен', async () => {
    const res = await fetch(FRONT);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  console.log('');

  // ==========================================
  // 2. Публичные страницы
  // ==========================================
  console.log('>>> 2. Публичные страницы (без авторизации)');
  
  const publicPages = [
    { name: 'Главная', path: '/' },
    { name: 'События', path: '/events' },
    { name: 'Карта', path: '/map' },
    { name: 'Логин', path: '/login' },
    { name: 'Регистрация', path: '/register' }
  ];
  
  for (const page of publicPages) {
    await test(`Страница "${page.name}"`, async () => {
      const res = await fetch(`${FRONT}${page.path}`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      if (html.length < 100) throw new Error('Пустой ответ');
    });
  }
  
  console.log('');

  // ==========================================
  // 3. Авторизация
  // ==========================================
  console.log('>>> 3. Авторизация');
  
  let userToken, sellerToken, managerToken, adminToken;
  
  await test('Логин USER', async () => {
    userToken = await login('user@example.com', '123456');
    if (!userToken) throw new Error('Токен не получен');
  });
  
  await test('Логин SELLER', async () => {
    sellerToken = await login('seller@example.com', 'seller123');
    if (!sellerToken) throw new Error('Токен не получен');
  });
  
  await test('Логин MANAGER', async () => {
    managerToken = await login('manager@example.com', 'manager123');
    if (!managerToken) throw new Error('Токен не получен');
  });
  
  await test('Логин ADMIN', async () => {
    adminToken = await login('admin@example.com', 'admin123');
    if (!adminToken) throw new Error('Токен не получен');
  });
  
  console.log('');

  // ==========================================
  // 4. USER API
  // ==========================================
  console.log('>>> 4. USER API');
  
  await test('Профиль', async () => {
    const res = await api('GET', '/auth/me', userToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (res.data.role !== 'USER') throw new Error('Неверная роль');
  });
  
  await test('Мои бронирования', async () => {
    const res = await api('GET', '/bookings/my', userToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  await test('Создать бронирование', async () => {
    const res = await api('POST', '/bookings', userToken, {
      eventId: 1,
      participants: 2,
      contactPhone: '+7 (999) 123-45-67',
      contactName: 'Test User',
      contactEmail: 'user@example.com',
      eventDate: '2026-05-01'
    });
    if (res.status !== 201 && res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  await test('Отправить сообщение менеджеру', async () => {
    const res = await api('POST', '/messages/to-manager', userToken, {
      message: 'E2E тест сообщение'
    });
    if (res.status !== 201) throw new Error(`HTTP ${res.status}`);
  });
  
  console.log('');

  // ==========================================
  // 5. SELLER API
  // ==========================================
  console.log('>>> 5. SELLER API');
  
  await test('Профиль продавца', async () => {
    const res = await api('GET', '/sellers/profile', sellerToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (!res.data.companyName) throw new Error('Нет companyName');
  });
  
  await test('Мои события', async () => {
    const res = await api('GET', '/events/seller/my', sellerToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  await test('Продажи', async () => {
    const res = await api('GET', '/bookings/seller', sellerToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  console.log('');

  // ==========================================
  // 6. MANAGER API
  // ==========================================
  console.log('>>> 6. MANAGER API');
  
  await test('Отзывы на модерации', async () => {
    const res = await api('GET', '/reviews/pending', managerToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  await test('Чаты', async () => {
    const res = await api('GET', '/messages/admin/chats', managerToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  await test('Бронирования', async () => {
    const res = await api('GET', '/admin/bookings', managerToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  console.log('');

  // ==========================================
  // 7. ADMIN API
  // ==========================================
  console.log('>>> 7. ADMIN API');
  
  await test('Пользователи', async () => {
    const res = await api('GET', '/admin/users', adminToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Не массив');
  });
  
  await test('Продавцы', async () => {
    const res = await api('GET', '/admin/sellers', adminToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  await test('Статистика', async () => {
    const res = await api('GET', '/admin/stats', adminToken);
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (typeof res.data.users !== 'number') throw new Error('Нет users');
  });
  
  console.log('');

  // ==========================================
  // 8. Публичные API
  // ==========================================
  console.log('>>> 8. Публичные API');
  
  await test('Отзывы события', async () => {
    const res = await api('GET', '/reviews/event/1');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  await test('Профиль продавца (публичный)', async () => {
    const res = await api('GET', '/sellers/1');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    if (!res.data.companyName) throw new Error('Нет companyName');
  });
  
  await test('События продавца', async () => {
    const res = await api('GET', '/sellers/1/events');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  await test('Отзывы продавца', async () => {
    const res = await api('GET', '/reviews/seller/1');
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });
  
  console.log('');

  // ==========================================
  // ИТОГИ
  // ==========================================
  console.log('=========================================');
  console.log(`  РЕЗУЛЬТАТ: ${passed} / ${passed + failed}`);
  console.log('=========================================');
  
  if (failed === 0) {
    console.log('✅ Все тесты пройдены!');
  } else {
    console.log(`❌ Провалено: ${failed}`);
    console.log('\nНеобходимо исправить:');
    console.log('1. Проверить логи фронтенда');
    console.log('2. Проверить CORS настройки');
    console.log('3. Проверить работу API эндпоинтов');
  }
  
  console.log('');
})();
