import React, { createContext, useContext, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

const dictionaries = {
  ru: {
    navCommunity: 'Сообщество',
    login: 'Войти',
    register: 'Регистрация',
    logout: 'Выйти',
    supportChat: 'Чат с поддержкой',
    notFoundTitle: 'Страница не найдена',
    notFoundText: 'Этот маршрут не существует',
    backHome: 'На главную',
    sidebarDiscover: 'Главная',
    sidebarTrips: 'Поездки',
    sidebarMap: 'Карта',
    sidebarProfile: 'Профиль',
    language: 'Язык',
    russian: 'Русский',
    english: 'English'
  },
  en: {
    navCommunity: 'Community',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    supportChat: 'Support chat',
    notFoundTitle: 'Page not found',
    notFoundText: 'This route does not exist',
    backHome: 'Back home',
    sidebarDiscover: 'Discover',
    sidebarTrips: 'Trips',
    sidebarMap: 'Map',
    sidebarProfile: 'Profile',
    language: 'Language',
    russian: 'Russian',
    english: 'English'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('tourhub_language') || 'ru');

  const value = useMemo(() => ({
    language,
    setLanguage: (next) => {
      localStorage.setItem('tourhub_language', next);
      setLanguage(next);
    },
    t: dictionaries[language] || dictionaries.ru
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
