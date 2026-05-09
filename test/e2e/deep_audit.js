const { chromium } = require('playwright');

const FRONT = 'http://localhost:3000';
const API = 'http://localhost:5001/api';

let critical = 0;
let major = 0;
let minor = 0;

const RED = '🔴';
const ORANGE = '🟠'; 
const YELLOW = '🟡';
const GREEN = '🟢';

async function criticalIssue(msg) { critical++; console.log(`${RED} КРИТ: ${msg}`); }
async function majorIssue(msg) { major++; console.log(`${ORANGE} ВАЖНО: ${msg}`); }
async function minorIssue(msg) { minor++; console.log(`${YELLOW} МЕЛКО: ${msg}`); }
async function ok(msg) { console.log(`${GREEN} ${msg}`); }

(async () => {
  console.log('\n' + '='.repeat(70));
  console.log('  TourHub ГЛУБОКИЙ АУДИТ - Ручная проверка всех функций');
  console.log('='.repeat(70) + '\n');

  const browser = await chromium.launch({ 
    headless: false, // ВИДИМЫЙ браузер для реальной проверки
    slowMo: 500 // Замедление чтобы видеть что происходит
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ==========================================
  // 1. ЗАГРУЗКА СТРАНИЦЫ
  // ==========================================
  console.log('▶ Проверка загрузки и анимаций\n');
  
  await page.goto(FRONT, { waitUntil: 'domcontentloaded' });
  console.log('  Страница начала загружаться...');
  
  // Проверяем что показывает во время загрузки
  const loadingStates = [];
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    const text = await page.textContent('body').catch(() => '');
    if (text.includes('Загрузка') || text.includes('Loading')) {
      loadingStates.push(`+${i*0.5}s: Скучная "Загрузка"`);
    }
    if (text.includes('маршрут') || text.includes('событи') || text.includes('место')) {
      loadingStates.push(`+${i*0.5}s: Интересная фраза`);
    }
  }
  
  if (loadingStates.length === 0) {
    await criticalIssue('НЕТ АНИМАЦИИ ЗАГРУЗКИ — страница просто белая при загрузке');
  } else if (loadingStates.every(s => s.includes('Скучная'))) {
    await majorIssue('Загрузка показывает только "Загрузка" — нужно интересные фразы');
    console.log('     Рекомендация: "Ищем лучшие маршруты...", "Планируем приключения..."');
  } else {
    await ok('Есть анимация загрузки с интересными фразами');
  }
  
  await page.waitForTimeout(5000);

  // ==========================================
  // 2. КАРТА
  // ==========================================
  console.log('\n▶ Проверка карты (/map)\n');
  
  await page.goto(`${FRONT}/map`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // Проверяем наличие карты
  const hasMap = await page.$('[class*="map"], [class*="Map"], iframe, canvas');
  const hasFallback = await page.textContent('body').then(t => t.includes('Google Maps') || t.includes('API') || t.includes('ключ'));
  
  if (!hasMap && !hasFallback) {
    await criticalIssue('КАРТА НЕ РАБОТАЕТ — нет ни карты, ни заглушки');
  } else if (hasFallback && !hasMap) {
    await majorIssue('Карта показывает заглушку — нужен API ключ Google Maps');
    console.log('     Решение: добавить REACT_APP_GOOGLE_MAPS_API_KEY в .env');
  } else if (hasMap) {
    await ok('Карта загружается');
    
    // Проверяем маркеры на карте
    const markers = await page.$$('[class*="marker"], [class*="Marker"], [class*="pin"]');
    if (markers.length === 0) {
      await majorIssue('На карте нет маркеров событий');
    } else {
      await ok(`На карте ${markers.length} маркеров`);
    }
  }
  
  // Проверяем список событий рядом с картой
  const eventList = await page.$$('[class*="event"], [class*="card"], a[href*="/event/"]');
  if (eventList.length === 0) {
    await majorIssue('Нет списка событий рядом с картой');
  } else {
    await ok(`Список из ${eventList.length} событий`);
  }

  // ==========================================
  // 3. ЧАТ
  // ==========================================
  console.log('\n▶ Проверка чата\n');
  
  // Логинимся как user
  await page.goto(`${FRONT}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'user@example.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // Пробуем открыть чат
  // Сначала создадим бронирование чтобы был bookingId для чата
  try {
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const bookingRes = await fetch(`${API}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        eventId: 1, participants: 1,
        contactPhone: '+79991234567', contactName: 'Test',
        contactEmail: 'user@example.com', eventDate: '2026-05-01'
      })
    });
    const booking = await bookingRes.json();
    
    if (booking.id) {
      await page.goto(`${FRONT}/chat/${booking.id}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      // Проверяем интерфейс чата
      const hasInput = await page.$('input[type="text"], textarea');
      const hasMessages = await page.$('[class*="message"], [class*="Message"]');
      const hasSendBtn = await page.$('button:has-text("тправить"), button:has-text("Send")');
      
      if (hasInput && hasSendBtn) {
        await ok('Интерфейс чата работает');
        
        // Отправляем сообщение
        await page.fill('input[type="text"], textarea', 'Тестовое сообщение');
        await page.click('button:has-text("тправить"), button:has-text("Send")');
        await page.waitForTimeout(2000);
        
        const msgVisible = await page.$('text=Тестовое сообщение');
        if (msgVisible) {
          await ok('Сообщения отправляются и отображаются');
        } else {
          await majorIssue('Сообщение не отображается после отправки');
        }
      } else {
        await criticalIssue('ЧАТ НЕ РАБОТАЕТ — нет поля ввода или кнопки отправки');
      }
    } else {
      await majorIssue('Не удалось создать бронирование для теста чата');
    }
  } catch (e) {
    await criticalIssue(`ЧАТ НЕ РАБОТАЕТ — ошибка: ${e.message}`);
  }

  // ==========================================
  // 4. АНИМАЦИИ И МИКРО-ВЗАИМОДЕЙСТВИЯ
  // ==========================================
  console.log('\n▶ Проверка UX анимаций\n');
  
  await page.goto(FRONT, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Ховер на карточку
  const cards = await page.$$('[class*="card"], a[href*="/event/"]');
  if (cards.length > 0) {
    const firstCard = cards[0];
    const boxBefore = await firstCard.boundingBox();
    
    await firstCard.hover();
    await page.waitForTimeout(500);
    
    const boxAfter = await firstCard.boundingBox();
    const hasScale = boxBefore && boxAfter && (boxAfter.width !== boxBefore.width);
    
    if (hasScale) {
      await ok('Карточки имеют ховер-эффект');
    } else {
      await minorIssue('Нет анимации при наведении на карточки');
    }
  }
  
  // Кнопки
  const buttons = await page.$$('button');
  let animatedButtons = 0;
  for (const btn of buttons.slice(0, 5)) {
    const classes = await btn.getAttribute('class');
    if (classes && (classes.includes('transition') || classes.includes('hover:') || classes.includes('transform'))) {
      animatedButtons++;
    }
  }
  if (animatedButtons > 0) {
    await ok(`${animatedButtons} кнопок с анимацией`);
  } else {
    await majorIssue('Кнопки без анимации — выглядят статично');
  }

  // ==========================================
  // 5. КНОПКА БРОНИРОВАНИЯ
  // ==========================================
  console.log('\n▶ Проверка бронирования на /event/:id\n');
  
  await page.goto(`${FRONT}/event/1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const bookBtn = await page.$('button:has-text("рониров"), button:has-text("упить")');
  if (bookBtn) {
    await ok('Кнопка бронирования есть (для авторизованных)');
    await bookBtn.click();
    await page.waitForTimeout(1000);
    
    const formVisible = await page.$('form, [class*="modal"], [class*="Modal"]');
    if (formVisible) {
      await ok('Форма бронирования открывается');
    } else {
      await majorIssue('Кнопка бронирования не открывает форму');
    }
  } else {
    // Проверяем — может пользователь не авторизован?
    const isLoggedIn = await page.$('text=Выйти, text=Logout');
    if (!isLoggedIn) {
      await minorIssue('Кнопка бронирования скрыта (нужна авторизация) — это нормально');
    } else {
      await majorIssue('Кнопка бронирования отсутствует для авторизованного пользователя');
    }
  }

  // ==========================================
  // 6. ФОРМЫ И ВАЛИДАЦИЯ
  // ==========================================
  console.log('\n▶ Проверка форм и валидации\n');
  
  await page.goto(`${FRONT}/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Отправляем пустую форму
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForTimeout(1000);
    
    const errors = await page.$$('[class*="error"], [class*="Error"], :invalid');
    if (errors.length > 0) {
      await ok('Валидация форм работает (показывает ошибки)');
    } else {
      await majorIssue('Нет валидации — форма отправляется пустой');
    }
  }

  await browser.close();

  // ==========================================
  // ИТОГИ
  // ==========================================
  console.log('\n' + '='.repeat(70));
  console.log('  ИТОГИ ГЛУБОКОГО АУДИТА');
  console.log('='.repeat(70));
  console.log(`  ${RED} Критических: ${critical}`);
  console.log(`  ${ORANGE} Важных: ${major}`);
  console.log(`  ${YELLOW} Мелких: ${minor}`);
  console.log('='.repeat(70));
  
  if (critical === 0 && major === 0) {
    console.log('\n🏆 Продукт готов к запуску!\n');
  } else if (critical === 0) {
    console.log('\n👍 Можно запускать, но есть что улучшить\n');
  } else {
    console.log('\n🔧 Требуется исправление критических проблем\n');
  }
  
  console.log('📋 Чек-лист исправлений:');
  console.log('  1. 🔴 Анимация загрузки с интересными фразами');
  console.log('  2. 🔴 Карта — добавить API ключ Google Maps');
  console.log('  3. 🔴 Чат — проверить работу отправки сообщений');
  console.log('  4. 🟠 Кнопка бронирования для USER');
  console.log('  5. 🟠 Микро-анимации на кнопках и карточках');
  console.log('  6. 🟡 Lazy loading изображений');
  console.log('  7. 🟡 Семантическая разметка');
  console.log('');
})();
