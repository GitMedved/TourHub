import React, { createContext, useContext, useMemo, useState } from 'react';

export const translations = {
  ru: {
    nav: {
      home: 'Главная',
      events: 'Все туры',
      map: 'Карта',
      trips: 'Поездки',
      profile: 'Профиль',
      admin: 'Админ панель',
      seller: 'Кабинет продавца',
      manager: 'Панель управления',
      support: 'Чат с поддержкой',
      login: 'Войти',
      register: 'Регистрация',
      logout: 'Выйти',
      lang: 'Язык'
    },
    sidebar: {
      discover: 'Обзор',
      trips: 'Поездки',
      map: 'Карта',
      profile: 'Профиль'
    },
    common: {
      loadingMap: 'Загружаем карту',
      backHome: 'На главную',
      notFoundTitle: 'Страница не найдена',
      notFoundText: 'Такого маршрута не существует'
    },
    home: {
      badge: 'Платформа совместных путешествий',
      title: 'Планируйте поездки',
      titleAccent: 'как в кино.',
      subtitle: 'Создавайте совместные пространства, приглашайте друзей, голосуйте за места, собирайте красивые маршруты и превращайте идеи в общее приключение.',
      createTrip: 'Создать поездку',
      explore: 'Смотреть туры',
      plannedStops: 'точек маршрута',
      travelerRating: 'рейтинг туристов',
      countries: 'стран открыто',
      actualTours: 'актуальных туров',
      bestRating: 'лучший рейтинг',
      regions: 'регионов на карте',
      livePlanning: 'Планирование',
      openWorkspace: 'Открыть пространство',
      openTour: 'Открыть тур',
      participants: 'участников',
      datePending: 'Дата уточняется',
      locationPending: 'Локация уточняется',
      routePreview: 'Предпросмотр маршрута',
      routeTitle: 'Рассветный маршрут в Доломитах',
      stops: '5 точек',
      friends: '8 друзей',
      voted: '92% голосов',
      workspaces: 'Пространства',
      activeTrips: 'Актуальные туры',
      activeTripsText: 'Блок обновляется из каталога опубликованных туров',
      viewAll: 'Смотреть все',
      communityActivity: 'Активность сообщества',
      discoverRoutes: 'Маршруты',
      by: 'от',
      saves: 'сохранений',
      noActualTours: 'Пока нет опубликованных туров. Новые предложения появятся здесь после модерации.',
      noActivity: 'Пока нет новых туров в ленте.',
      noRoutes: 'Популярные маршруты появятся после публикации туров.',
      verifiedOrganizer: 'Проверенный организатор',
      nextAdventure: 'Следующее приключение',
      startTogether: 'Начните планировать вместе',
      startText: 'Создавайте совместные пространства, организуйте маршруты, делитесь идеями и путешествуйте умнее всей группой.',
      createWorkspace: 'Создать пространство'
    },
    map: {
      title: 'Карта событий',
      introTitle: 'Интерактивная карта OpenStreetMap',
      introText: 'Бесплатная карта работает без ключей Google Maps. Ниже — регионы и туры, которые можно открыть кликом.',
      openFullMap: 'Открыть полную карту',
      all: 'Все',
      noEvents: 'По выбранному региону пока нет туров.'
    },
    profile: {
      traveler: 'Путешественник',
      messageManager: 'Написать менеджеру',
      total: 'Всего',
      active: 'Активных',
      completed: 'Завершено',
      bookings: 'Мои бронирования',
      noBookings: 'У вас пока нет бронирований',
      findTour: 'Найти тур',
      people: 'чел.',
      reason: 'Причина',
      cancel: 'Отменить',
      complete: 'Завершить',
      review: 'Отзыв',
      cancellationReason: 'Причина отмены',
      chooseReason: 'Выберите причину',
      confirmCancel: 'Подтвердить отмену',
      back: 'Назад',
      leaveReview: 'Оставить отзыв',
      eventRating: 'Оценка события',
      sellerRating: 'Оценка продавца',
      reviewPlaceholder: 'Поделитесь впечатлениями...',
      sendReview: 'Отправить отзыв',
      writeManager: 'Написать менеджеру',
      messagePlaceholder: 'Опишите ваш вопрос или проблему...',
      send: 'Отправить'
    },
    toast: {
      logout: 'Вы вышли из системы'
    }
  },
  en: {
    nav: {
      home: 'Home',
      events: 'All tours',
      map: 'Map',
      trips: 'Trips',
      profile: 'Profile',
      admin: 'Admin panel',
      seller: 'Seller dashboard',
      manager: 'Manager panel',
      support: 'Support chat',
      login: 'Log in',
      register: 'Sign up',
      logout: 'Log out',
      lang: 'Language'
    },
    sidebar: {
      discover: 'Discover',
      trips: 'Trips',
      map: 'Map',
      profile: 'Profile'
    },
    common: {
      loadingMap: 'Loading map',
      backHome: 'Back home',
      notFoundTitle: 'Page not found',
      notFoundText: 'This route does not exist'
    },
    home: {
      badge: 'Collaborative Travel Platform',
      title: 'Plan trips',
      titleAccent: 'that feel cinematic.',
      subtitle: 'Create collaborative travel workspaces, invite friends, vote on places, build visual routes, and turn every idea into a shared adventure.',
      createTrip: 'Create Trip',
      explore: 'Explore tours',
      plannedStops: 'planned stops',
      travelerRating: 'traveler rating',
      countries: 'countries explored',
      actualTours: 'actual tours',
      bestRating: 'best rating',
      regions: 'mapped regions',
      livePlanning: 'Live planning',
      openWorkspace: 'Open Workspace',
      openTour: 'Open tour',
      participants: 'participants',
      datePending: 'Date to be confirmed',
      locationPending: 'Location to be confirmed',
      routePreview: 'Route preview',
      routeTitle: 'Dolomites sunrise loop',
      stops: '5 stops',
      friends: '8 friends',
      voted: '92% voted',
      workspaces: 'Workspaces',
      activeTrips: 'Actual tours',
      activeTripsText: 'This block is updated from the published tour catalog',
      viewAll: 'View all',
      communityActivity: 'Community Activity',
      discoverRoutes: 'Discover Routes',
      by: 'by',
      saves: 'saves',
      noActualTours: 'There are no published tours yet. New offers will appear here after moderation.',
      noActivity: 'No new tours in the feed yet.',
      noRoutes: 'Popular routes will appear after tours are published.',
      verifiedOrganizer: 'Verified organizer',
      nextAdventure: 'Your next adventure',
      startTogether: 'Start planning together',
      startText: 'Build collaborative travel spaces, organize routes, share ideas, and travel smarter as a group.',
      createWorkspace: 'Create Workspace'
    },
    map: {
      title: 'Event map',
      introTitle: 'Interactive OpenStreetMap',
      introText: 'The free map works without Google Maps keys. Regions and tours below are clickable.',
      openFullMap: 'Open full map',
      all: 'All',
      noEvents: 'No tours in this region yet.'
    },
    profile: {
      traveler: 'Traveler',
      messageManager: 'Message manager',
      total: 'Total',
      active: 'Active',
      completed: 'Completed',
      bookings: 'My bookings',
      noBookings: 'You do not have bookings yet',
      findTour: 'Find a tour',
      people: 'people',
      reason: 'Reason',
      cancel: 'Cancel',
      complete: 'Complete',
      review: 'Review',
      cancellationReason: 'Cancellation reason',
      chooseReason: 'Choose a reason',
      confirmCancel: 'Confirm cancellation',
      back: 'Back',
      leaveReview: 'Leave a review',
      eventRating: 'Event rating',
      sellerRating: 'Seller rating',
      reviewPlaceholder: 'Share your experience...',
      sendReview: 'Send review',
      writeManager: 'Message manager',
      messagePlaceholder: 'Describe your question or issue...',
      send: 'Send'
    },
    toast: {
      logout: 'You have logged out'
    }
  }
};

const LanguageContext = createContext(null);

const getInitialLanguage = () => {
  const saved = localStorage.getItem('tourhub_language');
  return saved === 'en' || saved === 'ru' ? saved : 'ru';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (nextLanguage) => {
    const safeLanguage = nextLanguage === 'en' ? 'en' : 'ru';
    localStorage.setItem('tourhub_language', safeLanguage);
    document.documentElement.lang = safeLanguage;
    setLanguageState(safeLanguage);
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: translations[language]
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
};
