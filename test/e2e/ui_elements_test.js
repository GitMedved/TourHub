const { chromium } = require('playwright');

const FRONT = 'http://localhost:3000';
let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`✅ ${name}`);
  } catch (e) {
    failed++;
    console.log(`❌ ${name} - ${e.message}`);
  }
}

(async () => {
  console.log('\n=========================================');
  console.log('  TourHub UI Elements Test v2');
  console.log('=========================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Главная
  console.log('>>> 1. Главная страница');
  await page.goto(FRONT, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await test('Заголовок', async () => {
    const title = await page.title();
    if (!title) throw new Error('Нет заголовка');
  });
  await test('Навигация', async () => {
    if (!(await page.$('nav, header'))) throw new Error('Не найдена');
  });
  await test('Есть контент', async () => {
    const body = await page.textContent('body');
    if (body.length < 300) throw new Error('Страница пустая');
  });
  console.log('');

  // 2. Логин
  console.log('>>> 2. Логин');
  await page.goto(`${FRONT}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  await test('Форма', async () => {
    if (!(await page.$('form'))) throw new Error('Нет формы');
  });
  await test('Поля ввода', async () => {
    if (!(await page.$('input[type="email"]'))) throw new Error('Нет email');
    if (!(await page.$('input[type="password"]'))) throw new Error('Нет password');
  });
  await test('Успешный логин', async () => {
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    if (page.url().includes('/login')) throw new Error('Не вошли');
  });
  console.log('');

  // 3. Событие
  console.log('>>> 3. Страница события (/event/1)');
  await page.goto(`${FRONT}/event/1`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await test('Заголовок', async () => {
    if (!(await page.$('h1'))) throw new Error('Не найден');
  });
  await test('Контент загружен', async () => {
    const body = await page.textContent('body');
    if (body.length < 500) throw new Error('Мало контента');
  });
  console.log('');

  // 4. Карта
  console.log('>>> 4. Карта (/map)');
  await page.goto(`${FRONT}/map`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await test('Заголовок', async () => {
    if (!(await page.$('h1'))) throw new Error('Не найден');
  });
  await test('Контент', async () => {
    const body = await page.textContent('body');
    if (body.length < 300) throw new Error('Пусто');
  });
  console.log('');

  // 5. Профиль
  console.log('>>> 5. Профиль (/profile)');
  await page.goto(`${FRONT}/profile`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await test('Контент профиля', async () => {
    const body = await page.textContent('body');
    if (body.length < 300) throw new Error('Пусто');
  });
  console.log('');

  // 6. Продавец
  console.log('>>> 6. Продавец (/seller/1)');
  await page.goto(`${FRONT}/seller/1`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await test('Контент продавца', async () => {
    const body = await page.textContent('body');
    if (body.length < 300) throw new Error('Пусто');
  });
  console.log('');

  // 7. Дашборд продавца
  console.log('>>> 7. Дашборд (/seller)');
  await page.goto(`${FRONT}/seller`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await test('Контент дашборда', async () => {
    const body = await page.textContent('body');
    if (body.length < 300) throw new Error('Пусто');
  });
  console.log('');

  // 8. Менеджер
  console.log('>>> 8. Менеджер (/manager)');
  await page.goto(`${FRONT}/manager`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await test('Контент', async () => {
    const body = await page.textContent('body');
    if (body.length < 200) throw new Error('Пусто');
  });
  console.log('');

  // 9. Админ
  console.log('>>> 9. Админ (/admin)');
  await page.goto(`${FRONT}/admin`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await test('Контент', async () => {
    const body = await page.textContent('body');
    if (body.length < 200) throw new Error('Пусто');
  });
  console.log('');

  // 10. Чат
  console.log('>>> 10. Чат (/chat)');
  await page.goto(`${FRONT}/chat`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await test('Контент', async () => {
    const body = await page.textContent('body');
    if (body.length < 200) throw new Error('Пусто');
  });
  console.log('');

  await browser.close();
  
  console.log('=========================================');
  console.log(`  РЕЗУЛЬТАТ: ${passed} / ${passed + failed}`);
  console.log('=========================================');
  if (failed === 0) console.log('✅ Все страницы загружаются!\n');
  else console.log(`❌ Провалено: ${failed}\n`);
})();
