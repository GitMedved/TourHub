# TourHub

TourHub — платформа для поиска, сохранения и бронирования авторских туров, экскурсий и локальных впечатлений.

## Стек

- **Frontend**: React 18, React Router, React Query, Tailwind CSS
- **Backend**: Node.js, Express, Sequelize
- **База данных**: PostgreSQL 15
- **Безопасность API**: Helmet, CORS allowlist, rate limiting, JWT auth
- **Медиа**: Multer + Sharp для загрузки и оптимизации изображений

## Быстрый старт

### 1. Установить зависимости

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Настроить переменные окружения

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Для production обязательно замените `JWT_SECRET` на длинное случайное значение.

### 3. Запустить PostgreSQL

Рекомендуемый вариант — Docker Compose:

```bash
bash scripts/start-db.sh
```

Скрипт сначала проверит, не запущен ли PostgreSQL уже на `DB_HOST:DB_PORT`. Если база доступна, он не будет стартовать второй экземпляр. Если база не запущена, скрипт попробует Docker Compose, затем macOS LaunchDaemon/локальный PostgreSQL 15 по пути `/Library/PostgreSQL/15`.

### 4. Запустить приложение

```bash
bash scripts/full-start.sh
```

`full-start.sh` можно вызывать из корня проекта командой выше; внутри скрипт сам вычисляет абсолютный путь к репозиторию и запускает backend/frontend из правильных директорий.

Также доступны root npm-команды:

```bash
npm run doctor      # проверить env, зависимости и занятые порты
npm run install:all # установить backend + frontend зависимости
npm start           # запустить TourHub
npm stop            # остановить TourHub и освободить порты
```

Адреса по умолчанию:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5001/api>
- Healthcheck: <http://localhost:5001/api/health>


## Troubleshooting запуска

### Как обновить уже склонированный репозиторий

Если репозиторий уже был склонирован раньше, сначала подтяните последние исправления скриптов:

```bash
git pull
git log --oneline -3
bash scripts/doctor.sh
bash scripts/stop-all.sh
```

Если `git pull` пишет `Already up to date`, но в выводе `bash scripts/stop-all.sh` всё ещё видно старое сообщение `Stopping all services...`, значит локальная ветка смотрит на версию без последних исправлений. Проверьте текущую ветку и remote/PR, затем повторите `git pull` после merge нужного PR.

### `frontend/node_modules not found` или `backend/node_modules not found`

Установите зависимости в соответствующей папке. Важно: `cd` и `npm install` — это две отдельные команды, либо одна команда через `&&`:

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

Можно также отдельно:

```bash
cd frontend
npm install
cd ..
```

### `EADDRINUSE: address already in use :::5001`

На порту backend уже висит старый процесс. Остановите его:

```bash
bash scripts/stop-all.sh
```

Если нужно вручную:

```bash
lsof -tiTCP:5001 -sTCP:LISTEN | xargs kill
```

### PostgreSQL на macOS просит пароль или уже запущен

Это нормально для локального PostgreSQL, установленного через EnterpriseDB/Postgres.app. `scripts/start-db.sh` сначала проверяет существующее TCP-подключение и не вызывает `pg_ctl`, если база уже работает.

Если PostgreSQL не стартует автоматически, запустите его вручную или используйте Docker Compose:

```bash
docker compose up -d postgres
```

## Скрипты

| Скрипт | Описание |
|--------|----------|
| `scripts/start-db.sh` | Запустить PostgreSQL через Docker Compose или локальный PostgreSQL 15 |
| `scripts/full-start.sh` | Запустить PostgreSQL, backend и frontend |
| `scripts/stop-all.sh` | Остановить процессы из pid-файлов и освободить порты backend/frontend |
| `scripts/restart-all.sh` | Перезапустить всё |
| `scripts/create-users.sh` | Создать тестовых пользователей |
| `scripts/doctor.sh` | Проверить env-файлы, зависимости и занятые dev-порты |

## Структура

```text
TourHub/
├── backend/          # Express API, Sequelize models, routes, uploads
├── frontend/         # React SPA
├── scripts/          # Вспомогательные shell-скрипты
├── test/e2e/         # E2E/UX проверки
├── docker-compose.yml
└── README.md
```

## Основные возможности

- Регистрация и вход пользователей через JWT.
- Роли пользователей: пользователь, продавец, менеджер/админ.
- Каталог опубликованных туров с рейтингами и отзывами.
- Бронирования с привязкой к событию, пользователю и продавцу.
- Отзывы с модерацией и пересчётом рейтингов.
- Избранное: сохранение понравившихся туров.
- Загрузка изображений для событий.

## Backend notes

- В development сервер использует `sequelize.sync({ alter: true })` для быстрой разработки.
- Для production рекомендуется перейти на миграции и отключить автоматический `alter`.
- `JWT_SECRET` обязателен при `NODE_ENV=production`.
- CORS allowlist задаётся через `CLIENT_URLS` в формате списка через запятую.

## Product roadmap

### Стабилизация

- Закрыть критические баги бронирования и авторизации.
- Добавить единый формат ошибок и валидацию входных данных.
- Настроить CI для syntax/build/test checks.

### Продукт

- Улучшить rich-страницы туров: галерея, карта, программа по дням, FAQ, условия отмены.
- Расширить избранное до shareable wishlist.
- Добавить отзывы с фото, бейджи доверия и показатели продавца.
- Довести Lighthouse performance/a11y до стабильных зелёных метрик.

### Рост

- AI Trip Copilot: подбор маршрута по бюджету, датам и стилю.
- Smart Route Builder: карта, порядок точек, оценка времени в пути.
- Collaborative planning: совместные подборки, голосование и общий бюджет.
- SEO-контент по направлениям, hidden gems и готовым маршрутам.
