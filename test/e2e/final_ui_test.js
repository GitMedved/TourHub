const { chromium } = require('playwright');

const FRONT = 'http://localhost:3000';
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try { await fn(); passed++; console.log(`✅ ${name}`); }
  catch (e) { failed++; console.log(`❌ ${name} - ${e.message}`); }
}

async function loginAs(page, email, pass) {
  await page.goto(`${FRONT}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', pass);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

(async () => {
  console.log('\n=========================================');
  console.log('  TourHub Final UI Test');
  console.log('=========================================\n');

  const browser = await chromium.launch({ headless: true });

  // 1. Публичные страницы
  console.log('>>> 1. Публичные страницы');
  
  const pubPages = [
    ['Главная', '/'],
    ['События', '/events'],
    ['Карта', '/map'],
    ['Логин', '/login'],
    ['Регистрация', '/register'],
  ];
  
  for (const [name, path] of pubPages) {
    const page = await browser.newPage();
    await page.goto(`${FRONT}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    await test(`${name} (${path})`, async () => {
      const body = await page.textContent('body');
      if (body.length < 100) throw new Error('Пустая страница');
    });
    await page.close();
  }
  
  // Проверка существующего события
  const eventPage = await browser.newPage();
  await eventPage.goto(`${FRONT}/event/1`, { waitUntil: 'networkidle', timeout: 15000 });
  await eventPage.waitForTimeout(2000);
  await test('Событие /event/1', async () => {
    const body = await eventPage.textContent('body');
    if (body.length < 100) throw new Error('Пусто');
  });
  await eventPage.close();
  
  console.log('');

  // 2. USER
  console.log('>>> 2. USER');
  const userPage = await browser.newPage();
  await loginAs(userPage, 'user@example.com', '123456');
  
  await test('Профиль (/profile)', async () => {
    await userPage.goto(`${FRONT}/profile`, { waitUntil: 'networkidle' });
    await userPage.waitForTimeout(2000);
    const body = await userPage.textContent('body');
    if (body.length < 200) throw new Error('Пусто');
  });
  await userPage.close();
  console.log('');

  // 3. SELLER
  console.log('>>> 3. SELLER');
  const sellerPage = await browser.newPage();
  await loginAs(sellerPage, 'seller@example.com', 'seller123');
  
  await test('Дашборд (/seller)', async () => {
    await sellerPage.goto(`${FRONT}/seller`, { waitUntil: 'networkidle' });
    await sellerPage.waitForTimeout(2000);
    const body = await sellerPage.textContent('body');
    if (body.length < 200) throw new Error('Пусто');
  });
  await sellerPage.close();
  console.log('');

  // 4. MANAGER
  console.log('>>> 4. MANAGER');
  const mgrPage = await browser.newPage();
  await loginAs(mgrPage, 'manager@example.com', 'manager123');
  
  await test('Менеджер (/manager)', async () => {
    await mgrPage.goto(`${FRONT}/manager`, { waitUntil: 'networkidle' });
    await mgrPage.waitForTimeout(2000);
    const body = await mgrPage.textContent('body');
    if (body.length < 200) throw new Error('Пусто');
  });
  await mgrPage.close();
  console.log('');

  // 5. ADMIN
  console.log('>>> 5. ADMIN');
  const adminPage = await browser.newPage();
  await loginAs(adminPage, 'admin@example.com', 'admin123');
  
  await test('Админ (/admin)', async () => {
    await adminPage.goto(`${FRONT}/admin`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(2000);
    const body = await adminPage.textContent('body');
    if (body.length < 200) throw new Error('Пусто');
  });
  
  await test('Чат (/chat)', async () => {
    await adminPage.goto(`${FRONT}/chat`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(2000);
    const body = await adminPage.textContent('body');
    if (body.length < 200) throw new Error('Пусто');
  });
  await adminPage.close();
  console.log('');

  await browser.close();
  
  console.log('=========================================');
  console.log(`  РЕЗУЛЬТАТ: ${passed} / ${passed + failed}`);
  console.log('=========================================');
  if (failed === 0) console.log('✅ Все UI тесты пройдены!\n');
  else console.log(`❌ Провалено: ${failed}\n`);
})();
