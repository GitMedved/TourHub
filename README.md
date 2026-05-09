# TourHub

Платформа для поиска и бронирования туров.

## Стек

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **БД**: (укажи здесь)

## Быстрый старт

```bash
# Установить зависимости
cd backend && npm install
cd ../frontend && npm install

# Запустить оба сервиса
bash scripts/full-start.sh
```

## Скрипты

| Скрипт | Описание |
|--------|----------|
| `scripts/full-start.sh` | Запустить backend + frontend |
| `scripts/stop-all.sh` | Остановить все сервисы |
| `scripts/restart-all.sh` | Перезапустить всё |
| `scripts/create-users.sh` | Создать тестовых пользователей |

## Структура

```
TourHub/
├── backend/          # API сервер
├── frontend/         # React приложение
├── scripts/          # Вспомогательные shell-скрипты
├── .gitignore
└── README.md
```
