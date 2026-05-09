#!/usr/bin/env bash
# ============================================================
# fix-tourhub.sh — приводим TourHub в порядок
# Запуск: bash fix-tourhub.sh  (из корня репозитория TourHub)
# ============================================================
set -euo pipefail

# ---------- цвета ----------
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }
step()    { echo -e "\n${BOLD}──── $* ────${NC}"; }

# ---------- проверяем, что мы в корне репозитория ----------
[ -d ".git" ] || error "Запусти скрипт из корня репозитория TourHub (там, где .git)"

step "1. Удаляем node_modules из git-трекинга"

if git ls-files --error-unmatch node_modules &>/dev/null 2>&1; then
  git rm -r --cached node_modules
  success "node_modules удалён из git (файлы на диске остались)"
else
  warn "node_modules уже не трекается git — пропускаем"
fi

step "2. Удаляем .idea из git-трекинга"

if git ls-files --error-unmatch .idea &>/dev/null 2>&1; then
  git rm -r --cached .idea
  success ".idea удалён из git"
else
  warn ".idea уже не трекается — пропускаем"
fi

step "3. Удаляем тестовый медиафайл real-image.jpg"

if [ -f "real-image.jpg" ]; then
  git rm --cached real-image.jpg 2>/dev/null || true
  rm -f real-image.jpg
  success "real-image.jpg удалён"
else
  warn "real-image.jpg не найден — пропускаем"
fi

step "4. Обновляем .gitignore"

GITIGNORE=".gitignore"

add_if_missing() {
  local entry="$1"
  grep -qxF "$entry" "$GITIGNORE" 2>/dev/null || echo "$entry" >> "$GITIGNORE"
}

touch "$GITIGNORE"

add_if_missing "# Dependencies"
add_if_missing "node_modules/"
add_if_missing ""
add_if_missing "# IDE"
add_if_missing ".idea/"
add_if_missing ".vscode/"
add_if_missing "*.iml"
add_if_missing ""
add_if_missing "# OS"
add_if_missing ".DS_Store"
add_if_missing "Thumbs.db"
add_if_missing ""
add_if_missing "# Env"
add_if_missing ".env"
add_if_missing ".env.local"
add_if_missing ".env.*.local"
add_if_missing ""
add_if_missing "# Logs"
add_if_missing "*.log"
add_if_missing "logs/"
add_if_missing ""
add_if_missing "# Build"
add_if_missing "dist/"
add_if_missing "build/"
add_if_missing ".next/"
add_if_missing ""
add_if_missing "# Test images / temp files"
add_if_missing "real-image.jpg"
add_if_missing "*.tmp"

success ".gitignore обновлён"

step "5. Переносим shell-скрипты в scripts/"

mkdir -p scripts

for f in full-start.sh stop-all.sh restart-all.sh create-users.sh; do
  if [ -f "$f" ]; then
    mv "$f" "scripts/$f"
    success "Перемещён: $f → scripts/$f"
  else
    warn "$f не найден — пропускаем"
  fi
done

step "6. Переносим конфиги Tailwind/PostCSS во frontend/"

for f in tailwind.config.js postcss.config.js; do
  if [ -f "$f" ] && [ -d "frontend" ]; then
    if [ ! -f "frontend/$f" ]; then
      mv "$f" "frontend/$f"
      success "Перемещён: $f → frontend/$f"
    else
      warn "frontend/$f уже существует — пропускаем, удаляем дубль в корне"
      rm -f "$f"
    fi
  elif [ -f "$f" ]; then
    warn "Папка frontend/ не найдена, $f остался в корне"
  fi
done

step "7. Переносим publish-events.js в backend/"

if [ -f "publish-events.js" ]; then
  if [ -d "backend" ]; then
    mv publish-events.js backend/publish-events.js
    success "publish-events.js → backend/"
  else
    mkdir -p scripts
    mv publish-events.js scripts/publish-events.js
    success "publish-events.js → scripts/ (backend/ не найден)"
  fi
else
  warn "publish-events.js не найден — пропускаем"
fi

step "8. Создаём README.md (если его нет)"

if [ ! -f "README.md" ]; then
  cat > README.md << 'EOF'
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
EOF
  success "README.md создан"
else
  warn "README.md уже существует — не перезаписываем"
fi

step "9. Создаём ветку main (если не существует)"

if git show-ref --verify --quiet refs/heads/main; then
  warn "Ветка main уже существует — пропускаем"
else
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  git checkout -b main
  git checkout "$CURRENT_BRANCH"
  success "Ветка main создана (ты остался на $CURRENT_BRANCH)"
fi

step "10. Коммитим все изменения"

git add -A

if git diff --cached --quiet; then
  warn "Нечего коммитить — всё уже в порядке"
else
  git commit -m "chore: clean up repo structure

- remove node_modules and .idea from tracking
- update .gitignore
- move shell scripts to scripts/
- move tailwind/postcss configs to frontend/
- move publish-events.js to backend/
- add README.md"
  success "Коммит создан"
fi

# ---------- итог ----------
echo ""
echo -e "${BOLD}${GREEN}════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}  Готово! Репозиторий приведён в порядок${NC}"
echo -e "${BOLD}${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "Следующий шаг — запушить изменения:"
echo -e "  ${CYAN}git push origin develop${NC}"
echo -e "  ${CYAN}git push origin main${NC}"
echo ""
echo -e "${YELLOW}Не забудь:${NC}"
echo -e "  • Заполнить README.md реальным описанием проекта"
echo -e "  • Проверить, что frontend запускается после переноса конфигов"
echo -e "  • Добавить .env.example с примерами переменных окружения"
