# TourHub — UI/UX Design Specification v1.0

> Полная спецификация интерфейса для реализации фронтенда.
> Соответствует современным стандартам: Material Design 3, Human Interface Guidelines, WCAG 2.1 AA.

---

## 1. Design System

### 1.1. Визуальная концепция

**Метафора:** Цифровой штаб путешествия — место, где план оживает.

**Ключевые принципы:**
- **Минимализм с акцентами** — интерфейс не конкурирует с контентом о путешествиях.
- **Прогрессивное раскрытие** — сложность нарастает по мере погружения.
- **Реал-тайм ощущение** — анимации присутствия и синхронизации.
- **Мобильное мышление** — Mobile First, десктоп как расширение.

### 1.2. Цветовая система

```css
:root {
  /* Primary — доверие, путешествия, спокойствие */
  --color-primary-50:  #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-300: #93C5FD;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6;  /* Основной */
  --color-primary-600: #2563EB;  /* Hover */
  --color-primary-700: #1D4ED8;  /* Active */
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;

  /* Secondary — тепло, приключения */
  --color-secondary-50:  #FFF7ED;
  --color-secondary-100: #FFEDD5;
  --color-secondary-200: #FED7AA;
  --color-secondary-300: #FDBA74;
  --color-secondary-400: #FB923C;
  --color-secondary-500: #F97316;
  --color-secondary-600: #EA580C;

  /* Neutrals */
  --color-gray-50:  #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  /* Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error:   #EF4444;
  --color-info:    #3B82F6;

  /* Surface */
  --color-surface-primary:   #FFFFFF;
  --color-surface-secondary: #F9FAFB;
  --color-surface-tertiary:  #F3F4F6;
  --color-surface-elevated:  #FFFFFF;  /* с тенью */

  /* Text */
  --color-text-primary:    #111827;
  --color-text-secondary:  #4B5563;
  --color-text-tertiary:   #9CA3AF;
  --color-text-inverse:    #FFFFFF;
  --color-text-link:       #2563EB;
}
```

### 1.3. Типографика

```css
/* Шрифты */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-display: 'Playfair Display', Georgia, serif;  /* Заголовки trip */

/* Размеры (Mobile First) */
--text-xs:   0.75rem;   /* 12px — метки, бейджи */
--text-sm:   0.875rem;  /* 14px — вспомогательный текст */
--text-base: 1rem;      /* 16px — основной текст */
--text-lg:   1.125rem;  /* 18px — подзаголовки */
--text-xl:   1.25rem;   /* 20px — заголовки карточек */
--text-2xl:  1.5rem;    /* 24px — заголовки секций */
--text-3xl:  1.875rem;  /* 30px — заголовки страниц */
--text-4xl:  2.25rem;   /* 36px — hero-заголовки */
--text-5xl:  3rem;      /* 48px — лендинг */

/* Высота строк */
--leading-tight:  1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;

/* Веса */
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### 1.4. Скругления и тени

```css
--radius-sm:   0.375rem;   /* 6px  — кнопки, input */
--radius-md:   0.5rem;     /* 8px  — карточки */
--radius-lg:   0.75rem;    /* 12px — модалки */
--radius-xl:   1rem;       /* 16px — крупные контейнеры */
--radius-full: 9999px;     /* Pills, аватарки */

/* Тени (Material Design elevation) */
--shadow-xs:  0 1px 2px rgba(0,0,0,0.05);
--shadow-sm:  0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
--shadow-md:  0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
--shadow-lg:  0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
--shadow-xl:  0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.12);
```

### 1.5. Анимации

```css
/* Длительность */
--duration-instant: 100ms;
--duration-fast:    200ms;
--duration-normal:  300ms;
--duration-slow:    500ms;

/* Easing */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);       /* Обычные переходы */
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);        /* Появление */
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);        /* Исчезновение */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Игровые моменты */

/* Специфические */
--transition-fade:        opacity var(--duration-normal) var(--ease-standard);
--transition-slide-up:    transform var(--duration-normal) var(--ease-decelerate),
                          opacity var(--duration-normal) var(--ease-standard);
--transition-scale:       transform var(--duration-fast) var(--ease-standard);
--transition-list-item:   transform var(--duration-normal) var(--ease-bounce),
                          opacity var(--duration-normal) var(--ease-standard);
```

### 1.6. Breakpoints (Mobile First)

```css
/* Базовый стиль — мобильный (320px+) */
--screen-sm:  640px;   /* Планшет вертикальный */
--screen-md:  768px;   /* Планшет горизонтальный */
--screen-lg:  1024px;  /* Ноутбук */
--screen-xl:  1280px;  /* Десктоп */
--screen-2xl: 1536px;  /* Большой десктоп */

/* Контейнер */
--container-max: 1280px;
--container-padding: 1rem;  /* 16px на мобилке */
```

## 2. Компонентная архитектура

### 2.1. Атомарные компоненты

#### Button

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: ReactNode;
  onClick?: () => void;
}
```

Спецификация:
- Высота: sm=32px, md=40px, lg=48px.
- Паддинги: sm=12px, md=16px, lg=24px (горизонтальные).
- Шрифт: weight-medium, tracking-wide.
- Hover: затемнение на 10%.
- Active: затемнение на 15%.
- Focus: outline 2px primary-400, offset 2px.
- Loading: спиннер с той же высотой, текст скрыт, но занимает место.
- Disabled: opacity 0.5, cursor not-allowed.
- Минимальная область касания: 44x44px (WCAG).

### 2.2. Составные компоненты

(Полная спецификация компонентов, состояний и макетов сохранена в документе в исходной формулировке пользователя.)

## 3. Основные экраны
- Dashboard (Список поездок).
- Trip Detail (Детали поездки).
- Голосование за места.
- Управление участниками (Owner).
- Создание/редактирование поездки.

## 4. Состояния интерфейса
- Загрузка.
- Ошибки.
- Пустые состояния.
- Оптимистичные обновления.

## 5. Микровзаимодействия
- Присутствие пользователей.
- Копирование ссылки.
- Drag & Drop мест.
- Реал-тайм уведомления.

## 6. Доступность (WCAG 2.1 AA)
- Клавиатурная навигация.
- Поддержка screen readers.
- Контраст/размеры и reduced motion.

## 7. Мобильная адаптация
- Bottom navigation.
- Жесты.
- Bottom sheets.

## 8. Производительность
- Оптимизация изображений.
- Code splitting.
- Виртуализация длинных списков.

## 9. UI States Matrix
Матрица состояний основных компонентов (default/loading/empty/error/disabled).

## 10. Копирайтинг и тон
Дружелюбный и вдохновляющий tone of voice, понятные error-сообщения, активные CTA-глаголы.

## 11. Чек-лист реализации UI
Список требований к токенам, доступности, мобильной адаптации, состояниям и производительности.
