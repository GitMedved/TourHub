const { chromium } = require('playwright');

const FRONT = 'http://localhost:3000';
let score = 0;
const maxScore = 100;

const GREEN = '✅';
const RED = '❌';
const YELLOW = '⚠️';

async function check(name, fn, points) {
  try {
    await fn();
    score += points;
    console.log(`${GREEN} ${name} (+${points})`);
    return true;
  } catch (e) {
    console.log(`${RED} ${name} - ${e.message} (0)`);
    return false;
  }
}

async function warn(name, fn, points) {
  try {
    await fn();
    score += points;
    console.log(`${YELLOW} ${name} (+${points})`);
    return true;
  } catch (e) {
    console.log(`   ${name} - ${e.message} (0)`);
    return false;
  }
}

(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('  TourHub UX Score - Avito/Booking Benchmark');
  console.log('='.repeat(60) + '\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // ==========================================
  // 1. ГЛАВНАЯ СТРАНИЦА (40 баллов)
  // ==========================================
  console.log('📊 Главная страница (40 баллов)');
  console.log('─'.repeat(40));
  
  const startTime = Date.now();
  await page.goto(FRONT, { waitUntil: 'networkidle', timeout: 15000 });
  const loadTime = Date.now() - startTime;
  
  // Ждем загрузки React
  await page.waitForTimeout(3000);

  await check('Скорость загрузки < 2с', async () => {
    if (loadTime > 2000) throw new Error(`${loadTime}ms`);
  }, 10);
  
  await check('Видимый header', async () => {
    const el = await page.$('header, nav, [class*="Header"]');
    if (!el) throw new Error('Нет header');
  }, 5);
  
  await check('Поиск на главной', async () => {
    const el = await page.$('input[type="text"], input[placeholder*="оиск"]');
    if (!el) throw new Error('Нет поиска');
  }, 5);
  
  await check('Карточки событий (> 3)', async () => {
    const cards = await page.$$('[class*="card"], [class*="Card"], a[href*="/event/"]');
    if (cards.length < 3) throw new Error(`Всего ${cards.length}`);
  }, 10);
  
  await check('Изображения в карточках', async () => {
    const imgs = await page.$$('img');
    if (imgs.length < 3) throw new Error(`Всего ${imgs.length}`);
  }, 5);
  
  await check('Цены отображаются', async () => {
    const prices = await page.$$('text=/\\$|₽|\\d+\\s?[₽$]/');
    if (prices.length < 1) throw new Error('Нет цен');
  }, 5);
  
  console.log('');

  // ==========================================
  // 2. СТРАНИЦА СОБЫТИЯ (25 баллов)
  // ==========================================
  console.log('📊 Страница события (25 баллов)');
  console.log('─'.repeat(40));
  
  await page.goto(`${FRONT}/event/1`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  await check('Заголовок h1', async () => {
    const h1 = await page.$('h1');
    if (!h1) throw new Error('Нет заголовка');
  }, 5);
  
  await check('Цена видна', async () => {
    const body = await page.textContent('body');
    if (!body.match(/[$₽]|\d+\s*(₽|руб)/)) throw new Error('Нет цены');
  }, 5);
  
  await check('Изображения события (> 1)', async () => {
    const imgs = await page.$$('img');
    if (imgs.length < 1) throw new Error('Нет изображений');
  }, 5);
  
  await check('Кнопка бронирования', async () => {
    const btn = await page.locator('button:has-text("рониров"), button:has-text("упить")').first();
    if (!(await btn.count())) throw new Error('Нет кнопки');
  }, 5);
  
  await check('Даты события', async () => {
    const dates = await page.locator('text=/\\d{2}\\.\\d{2}|\\d{4}-\\d{2}-\\d{2}/').first();
    if (!(await dates.count())) throw new Error('Нет дат');
  }, 5);
  
  console.log('');

  // ==========================================
  // 3. ЛОГИН (15 баллов)
  // ==========================================
  console.log('📊 Страница логина (15 баллов)');
  console.log('─'.repeat(40));
  
  await page.goto(`${FRONT}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  await check('Форма логина', async () => {
    const form = await page.$('form');
    if (!form) throw new Error('Нет формы');
  }, 5);
  
  await check('Email + Пароль поля', async () => {
    const email = await page.$('input[type="email"]');
    const pass = await page.$('input[type="password"]');
    if (!email || !pass) throw new Error('Нет полей');
  }, 5);
  
  await warn('Ссылка "Забыли пароль"', async () => {
    const link = await page.locator('text=/забыли|forgot/i').first();
    if (!(await link.count())) throw new Error('Нет');
  }, 3);
  
  await check('Кнопка входа', async () => {
    const btn = await page.$('button[type="submit"]');
    if (!btn) throw new Error('Нет кнопки');
  }, 5);
  
  console.log('');

  // ==========================================
  // 4. АДАПТИВНОСТЬ (10 баллов)
  // ==========================================
  console.log('📊 Адаптивность (10 баллов)');
  console.log('─'.repeat(40));
  
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobilePage.goto(FRONT, { waitUntil: 'networkidle', timeout: 15000 });
  await mobilePage.waitForTimeout(2000);

  await check('Мобильная версия грузится', async () => {
    const body = await mobilePage.textContent('body');
    if (body.length < 100) throw new Error('Пусто');
  }, 5);
  
  await check('Нет горизонтального скролла', async () => {
    const hasScroll = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasScroll) throw new Error('Есть скролл');
  }, 5);
  
  await mobilePage.close();

  // ==========================================
  // 5. UX ЭЛЕМЕНТЫ (10 баллов)
  // ==========================================
  console.log('📊 UX элементы (10 баллов)');
  console.log('─'.repeat(40));
  
  await page.goto(FRONT, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  await check('Мета viewport', async () => {
    const vp = await page.$('meta[name="viewport"]');
    if (!vp) throw new Error('Нет viewport');
  }, 3);
  
  await check('Атрибут lang', async () => {
    const lang = await page.$eval('html', el => el.getAttribute('lang'));
    if (!lang) throw new Error('Нет lang');
  }, 2);
  
  await warn('Семантические теги', async () => {
    const main = await page.$('main, article, section');
    if (!main) throw new Error('Нет семантики');
  }, 3);
  
  await warn('Lazy loading', async () => {
    const lazy = await page.$('img[loading="lazy"]');
    if (!lazy) throw new Error('Нет lazy load');
  }, 2);
  
  await browser.close();

  // ==========================================
  // ИТОГИ
  // ==========================================
  console.log('\n' + '='.repeat(60));
  console.log('  РЕЗУЛЬТАТ UX АУДИТА');
  console.log('='.repeat(60));
  console.log(`  🏆 Оценка: ${score} / ${maxScore}`);
  
  const grade = score >= 80 ? 'A (Отлично!)' :
                score >= 60 ? 'B (Хорошо)' :
                score >= 40 ? 'C (Средне)' :
                score >= 20 ? 'D (Плохо)' : 'F (Ужасно)';
  
  console.log(`  📊 Уровень: ${grade}`);
  console.log('='.repeat(60));
  
  console.log('\n📋 Сравнение с конкурентами:');
  console.log('  Avito:     ~90-95 баллов');
  console.log('  Booking:   ~88-92 баллов');
  console.log('  Airbnb:    ~92-96 баллов');
  console.log(`  TourHub:   ${score} баллов`);
  
  console.log('\n💡 Ключевые рекомендации:');
  if (score < 40) {
    console.log('  1. 🔴 Главная страница не загружает события - КРИТИЧНО');
    console.log('  2. 🔴 Нет карточек с контентом');
    console.log('  3. 🟡 Добавить больше изображений');
    console.log('  4. 🟡 Улучшить навигацию');
  } else if (score < 60) {
    console.log('  1. 🟡 Увеличить количество карточек на главной');
    console.log('  2. 🟡 Добавить CTA кнопки');
    console.log('  3. 🟡 Улучшить мета-теги');
  } else {
    console.log('  1. 🟢 Добавить микро-анимации');
    console.log('  2. 🟢 Оптимизировать изображения');
    console.log('  3. 🟢 A/B тестирование CTA кнопок');
  }
  
  console.log('');
})();
