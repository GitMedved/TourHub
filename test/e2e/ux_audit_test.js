// UX Audit Test - сравнение с лучшими практиками (Avito, Booking, etc.)
const { chromium } = require('playwright');

const FRONT = 'http://localhost:3000';
let passed = 0;
let failed = 0;
let warnings = 0;

const GREEN = '✅';
const RED = '❌';
const YELLOW = '⚠️';

async function test(name, fn) {
  try { await fn(); passed++; console.log(`${GREEN} ${name}`); }
  catch (e) { failed++; console.log(`${RED} ${name} - ${e.message}`); }
}

async function warn(name, fn) {
  try { await fn(); }
  catch (e) { warnings++; console.log(`${YELLOW} ${name} - ${e.message}`); }
}

// CSS селекторы для проверки
const selectors = {
  // Навигация
  header: 'header, nav, [class*="Header"], [class*="Nav"], [class*="navbar"]',
  logo: '[class*="logo"], [class*="Logo"], a[href="/"], img[alt*="logo"]',
  search: 'input[type="search"], input[placeholder*="поиск"], input[placeholder*="Поиск"], [class*="search"], [class*="Search"]',
  
  // Карточки
  cards: '[class*="card"], [class*="Card"], [class*="tile"], article',
  
  // Действия
  cta: '[class*="primary"], .btn-primary, [class*="submit"], button:has-text("Купить"):not(:has-text("отмена")), button:has-text("Забронировать")',
  
  // Формы
  form: 'form, [class*="Form"]',
  input: 'input, textarea, select',
  
  // Медиа
  images: 'img',
  
  // Мобильность
  responsive: 'meta[name="viewport"]',
  
  // Доступность
  semantic: 'main, article, section, aside',
  aria: '[role], [aria-*]',
  lang: 'html[lang]',
  alt: 'img[alt]',
  
  // Производительность
  lazy: 'img[loading="lazy"], [loading="lazy"]',
};

const UX_CHECKLIST = {
  navigation: {
    title: 'Навигация',
    items: [
      { name: 'Видимый header', check: selectors.header, critical: true },
      { name: 'Логотип кликабелен', check: selectors.logo, critical: true },
      { name: 'Поиск доступен', check: selectors.search, critical: false },
      { name: 'Навигация не перекрывает контент', check: async (page) => {
        const header = await page.$(selectors.header);
        if (header) {
          const box = await header.boundingBox();
          if (box && box.height > 150) throw new Error('Слишком большой header');
        }
      }, critical: false },
    ]
  },
  hero: {
    title: 'Главный экран',
    items: [
      { name: 'Карточки/контент на главной', check: async (page) => {
        const cards = await page.$$(selectors.cards);
        if (cards.length === 0) throw new Error('Нет карточек');
      }, critical: true },
      { name: 'Не менее 3 элементов', check: async (page) => {
        const cards = await page.$$(selectors.cards);
        if (cards.length < 3) throw new Error(`Всего ${cards.length} карточек`);
      }, critical: false },
    ]
  },
  ux: {
    title: 'UX элементы',
    items: [
      { name: 'Кнопка действия выделена (CTA)', check: selectors.cta, critical: true },
      { name: 'Изображения присутствуют', check: selectors.images, critical: true },
      { name: 'Изображения с alt', check: selectors.alt, critical: false },
      { name: 'Viewport мета-тег', check: selectors.responsive, critical: true },
      { name: 'Семантическая разметка', check: selectors.semantic, critical: false },
      { name: 'Атрибут lang у html', check: selectors.lang, critical: true },
    ]
  },
  forms: {
    title: 'Формы',
    items: [
      { name: 'Форма присутствует', check: selectors.form, critical: true },
      { name: 'Поля ввода есть', check: selectors.input, critical: true },
      { name: 'Не менее 3 полей', check: async (page) => {
        const inputs = await page.$$(selectors.input);
        if (inputs.length < 3) throw new Error(`Всего ${inputs.length} полей`);
      }, critical: false },
    ]
  },
  performance: {
    title: 'Производительность',
    items: [
      { name: 'Lazy loading изображений', check: selectors.lazy, critical: false },
      { name: 'Страница загружается < 5 сек', check: async (page, startTime) => {
        if (Date.now() - startTime > 5000) throw new Error('Медленная загрузка');
      }, critical: true },
    ]
  }
};

(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('  TourHub UX/UI Audit - Сравнение с лучшими практиками');
  console.log('  (Avito, Booking, Airbnb, etc.)');
  console.log('='.repeat(60) + '\n');

  const browser = await chromium.launch({ headless: true });
  
  const pagesToTest = [
    { name: 'Главная', path: '/', type: 'public' },
    { name: 'События', path: '/events', type: 'public' },
    { name: 'Карта', path: '/map', type: 'public' },
    { name: 'Логин', path: '/login', type: 'public', checklist: ['forms'] },
    { name: 'Событие', path: '/event/1', type: 'public' },
    { name: 'Продавец', path: '/seller/1', type: 'public' },
  ];

  // ========================================
  // 1. Анализ главной страницы
  // ========================================
  console.log('┌─ Главная страница (/)\n│');
  
  const mainPage = await browser.newPage();
  const startTime = Date.now();
  await mainPage.goto(FRONT, { waitUntil: 'networkidle', timeout: 15000 });
  const loadTime = Date.now() - startTime;
  
  console.log(`│ ⏱ Время загрузки: ${loadTime}ms`);
  
  for (const item of UX_CHECKLIST.navigation.items) {
    await test(`│ ${item.name}`, async () => {
      if (typeof item.check === 'function') {
        await item.check(mainPage);
      } else {
        const el = await mainPage.$(item.check);
        if (!el) throw new Error('Элемент не найден');
      }
    });
  }
  
  console.log('│');
  for (const item of UX_CHECKLIST.hero.items) {
    await test(`│ ${item.name}`, async () => {
      if (typeof item.check === 'function') {
        await item.check(mainPage);
      } else {
        const el = await mainPage.$(item.check);
        if (!el) throw new Error('Элемент не найден');
      }
    });
  }
  
  for (const item of UX_CHECKLIST.ux.items) {
    await test(`│ ${item.name}`, async () => {
      await mainPage.waitForTimeout(1000);
      if (typeof item.check === 'function') {
        await item.check(mainPage);
      } else {
        const el = await mainPage.$(item.check);
        if (!el) throw new Error('Элемент не найден');
      }
    });
  }
  
  // Метрики
  console.log('│');
  console.log('│ 📊 Метрики главной:');
  
  const imgCount = await mainPage.$$eval('img', imgs => imgs.length);
  const linkCount = await mainPage.$$eval('a', links => links.length);
  const buttonCount = await mainPage.$$eval('button', btns => btns.length);
  const bodyText = await mainPage.textContent('body');
  
  console.log(`│   - Изображений: ${imgCount}`);
  console.log(`│   - Ссылок: ${linkCount}`);
  console.log(`│   - Кнопок: ${buttonCount}`);
  console.log(`│   - Текста: ${bodyText.length} символов`);
  
  if (loadTime < 2000) console.log(`│   ${GREEN} Скорость: Отлично (< 2с)`);
  else if (loadTime < 4000) console.log(`│   ${YELLOW} Скорость: Средне (2-4с)`);
  else console.log(`│   ${RED} Скорость: Медленно (> 4с)`);
  
  if (imgCount > 5) console.log(`│   ${GREEN} Визуальный контент: Достаточно`);
  else console.log(`│   ${YELLOW} Визуальный контент: Мало изображений`);
  
  await mainPage.close();
  console.log('│');
  console.log('└─ Готово\n');

  // ========================================
  // 2. Анализ страницы логина
  // ========================================
  console.log('┌─ Страница логина (/login)\n│');
  
  const loginPage = await browser.newPage();
  await loginPage.goto(`${FRONT}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  
  await test('│ Форма логина', async () => {
    const form = await loginPage.$('form');
    if (!form) throw new Error('Нет формы');
  });
  
  await test('│ Поле email', async () => {
    const email = await loginPage.$('input[type="email"]');
    if (!email) throw new Error('Нет поля email');
  });
  
  await test('│ Поле пароля', async () => {
    const pass = await loginPage.$('input[type="password"]');
    if (!pass) throw new Error('Нет поля пароля');
  });
  
  await test('│ Кнопка входа', async () => {
    const submit = await loginPage.$('button[type="submit"]');
    if (!submit) throw new Error('Нет кнопки');
  });
  
  // Проверка UX формы
  await warn('│ Placeholder в полях', async () => {
    const email = await loginPage.$('input[type="email"]');
    const placeholder = await email.getAttribute('placeholder');
    if (!placeholder) throw new Error('Нет placeholder');
  });
  
  await warn('│ Ссылка "Забыли пароль?"', async () => {
    const forgot = await loginPage.$('text=/забыли|forgot/i');
    if (!forgot) throw new Error('Нет ссылки восстановления');
  });
  
  await loginPage.close();
  console.log('│');
  console.log('└─ Готово\n');

  // ========================================
  // 3. Анализ карточки события
  // ========================================
  console.log('┌─ Страница события (/event/1)\n│');
  
  const eventPage = await browser.newPage();
  await eventPage.goto(`${FRONT}/event/1`, { waitUntil: 'networkidle', timeout: 15000 });
  await eventPage.waitForTimeout(2000);
  
  // Ключевые UX элементы как на Avito/Booking
  const eventElements = [
    'Заголовок h1',
    'Цена',
    'Изображения',
    'Кнопка бронирования',
    'Даты',
    'Описание',
    'Контакты продавца',
  ];
  
  for (const el of eventElements) {
    await warn(`│ ${el}`, async () => {
      const found = await eventPage.$(`text=/${el}/i, [class*="${el.toLowerCase()}"]`);
      if (!found) throw new Error('Не найден');
    });
  }
  
  const eventImgCount = await eventPage.$$eval('img', imgs => imgs.length);
  console.log(`│   - Изображений в событии: ${eventImgCount}`);
  
  if (eventImgCount < 3) {
    console.log(`│   ${YELLOW} Рекомендация: добавить больше фото (минимум 3-5)`);
  }
  
  await eventPage.close();
  console.log('│');
  console.log('└─ Готово\n');

  // ========================================
  // 4. Рекомендации
  // ========================================
  console.log('┌─ Общие рекомендации\n│');
  
  // Проверка адаптивности
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobilePage.goto(FRONT, { waitUntil: 'networkidle', timeout: 15000 });
  
  await test('│ Адаптивность (мобильные)', async () => {
    const body = await mobilePage.textContent('body');
    if (body.length < 100) throw new Error('Пусто на мобильном');
  });
  
  await warn('│ Горизонтальный скролл отсутствует', async () => {
    const hasScroll = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasScroll) throw new Error('Есть горизонтальный скролл');
  });
  
  await mobilePage.close();
  
  // Финальные рекомендации
  console.log('│');
  console.log('│ 💡 Рекомендации по улучшению:');
  console.log('│   1. Добавить lazy loading для изображений');
  console.log('│   2. Оптимизировать изображения (WebP формат)');
  console.log('│   3. Добавить хлебные крошки (breadcrumbs)');
  console.log('│   4. Улучшить мобильную навигацию');
  console.log('│   5. Добавить микро-анимации при наведении');
  console.log('│   6. Скелетон-загрузчики (skeleton screens)');
  console.log('│   7. Бесконечный скролл или пагинация');
  console.log('│   8. Фильтры с мгновенным применением');
  console.log('│   9. Карта с кластеризацией маркеров');
  console.log('│  10. Система рейтинга с отзывами');
  console.log('│');
  console.log('└─ Готово\n');

  await browser.close();
  
  // ========================================
  // Итоги
  // ========================================
  console.log('='.repeat(60));
  console.log('  ИТОГИ UX АУДИТА');
  console.log('='.repeat(60));
  console.log(`  ${GREEN} Пройдено: ${passed}`);
  console.log(`  ${YELLOW} Предупреждений: ${warnings}`);
  console.log(`  ${RED} Критических: ${failed}`);
  console.log('='.repeat(60) + '\n');
  
  if (failed === 0 && warnings < 5) {
    console.log('🏆 Отличный UX! Соответствует лучшим практикам.\n');
  } else if (failed < 3) {
    console.log('👍 Хороший UX. Есть что улучшить.\n');
  } else {
    console.log('🔧 Требует доработки UX.\n');
  }
})();
