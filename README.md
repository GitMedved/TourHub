# TourHub

TourHub — платформа для поиска, создания и совместного планирования путешествий.

Проект объединяет:
- **каталог событий/туров** (поиск, бронирование, избранное, отзывы),
- **коллаборативные Trip workspace** (участники, места, голоса, комментарии, инвайты),
- **Telegram-интеграцию (MVP)** для работы с Trip из групповых чатов,
- **переключение языка интерфейса RU/EN** в настройках профиля.

---

## Технологический стек

- **Frontend**: React 18, React Router, React Query, Tailwind CSS
- **Backend**: Node.js, Express, Sequelize, Socket.IO
- **База данных**: PostgreSQL 15
- **Безопасность API**: Helmet, CORS allowlist, rate limiting, JWT
- **Файлы и медиа**: Multer + Sharp

---

## Актуальные возможности

### Пользовательская часть
- Регистрация/вход, ролевой доступ.
- Каталог туров/ивентов, карточки, детали событий.
- Бронирования в личном кабинете.
- Избранное и отзывы.
- Страница карты на базе **OpenStreetMap** (fallback без Google Maps API).

### Trip workspace
- Создание поездок (Trip), участники и роли.
- Добавление мест, комментарии, голосования.
- Инвайт-ссылки для присоединения.
- Realtime-синхронизация через Socket.IO (trip events).

### Telegram Bot Integration (MVP)
Реализован webhook-модуль backend (`/api/telegram/webhook`) с базовой поддержкой:
- `/help`
- `/create_trip Название`
- `/create_trip Название | дд.мм.гггг | дд.мм.гггг`
- `/trips`

В рамках MVP:
- Trip, созданный из Telegram, связывается с Telegram-группой.
- Пользователь определяется/создаётся по Telegram ID.
- В ответах используется Markdown и ссылка на открытие Trip в веб-интерфейсе.

### Языки интерфейса
- Добавлен RU/EN language provider.
- Переключение языка доступно в профиле (настройки).
- Выбор языка сохраняется в `localStorage` (`tourhub_language`).

---

## Быстрый старт

## 1) Установка зависимостей

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## 2) Переменные окружения

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Минимально проверьте:
- `backend/.env`: `PORT`, `JWT_SECRET`, `DATABASE_URL`/DB-параметры, `CLIENT_URL`
- `frontend/.env`: URL backend API

Для Telegram webhook дополнительно:
- `TELEGRAM_WEBHOOK_SECRET` — секретный токен для валидации Telegram webhook
- `TELEGRAM_BOT_LINK` — ссылка на бота (используется в ответах)
- `CLIENT_URL` — базовый URL frontend для ссылок на Trip

## 3) Запуск PostgreSQL

Рекомендуемый путь:

```bash
bash scripts/start-db.sh
```

## 4) Запуск приложения

```bash
bash scripts/full-start.sh
```

Адреса по умолчанию:
- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5001/api>
- Health: <http://localhost:5001/api/health>

---

## Полезные команды

Из корня репозитория:

```bash
npm run doctor      # диагностика окружения
npm run install:all # установка всех зависимостей
npm start           # запуск всех сервисов
npm stop            # остановка сервисов
```

Backend:

```bash
cd backend
npm run dev
npm run test:telegram
```

---

## API-модули (кратко)

- `/api/auth` — аутентификация
- `/api/events` — события/туры
- `/api/bookings` — бронирования
- `/api/trips` — collaborative trip workspace
- `/api/telegram/webhook` — Telegram Bot webhook (MVP)

---

## Структура проекта

```text
TourHub/
├── backend/
│   ├── src/
│   │   ├── modules/trips/
│   │   ├── modules/telegram/
│   │   ├── routes/
│   │   └── models/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── features/trips/
│       └── i18n.js
├── scripts/
├── test/e2e/
└── README.md
```

---

## Важные замечания

- Сейчас backend в dev использует `sequelize.sync({ alter: true })`.
  Для production рекомендуется миграционный процесс и отключение auto-alter.
- Telegram-интеграция сейчас на уровне MVP; команды `/trip`, `/add_place`, `/vote`, `/notifications` и расширенный anti-spam/metrics требуют следующих итераций.
- Если frontend-тесты не запускаются с ошибкой `react-scripts: not found`, сначала выполните `npm install` в `frontend/`.

---

## Troubleshooting

### Порт backend занят (`EADDRINUSE: :::5001`)

```bash
bash scripts/stop-all.sh
```

или вручную:

```bash
lsof -tiTCP:5001 -sTCP:LISTEN | xargs kill
```

### Не найдены зависимости frontend/backend

```bash
cd backend && npm install
cd ../frontend && npm install
```

### PostgreSQL уже запущен/не запускается

```bash
docker compose up -d postgres
```

---

## Roadmap (high-level)

- Расширение Telegram-модуля до полного набора команд и inline-voting.
- Группировка и режимы Telegram-уведомлений (`all` / `important` / `off`).
- Полное покрытие интерфейса i18n для всех страниц.
- CI-пайплайн на lint/test/build.
