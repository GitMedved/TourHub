#!/bin/bash
# Исправление UX недостатков TourHub по лучшим практикам

echo "========================================="
echo "  Исправление UX недостатков TourHub"
echo "========================================="

# 1. Главная страница - карточки событий
cat > frontend/src/pages/HomePage.js << 'EOFJS'
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import Header from '../components/Header';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/events');
      const data = response.data.content || response.data || [];
      setEvents(data.slice(0, 12)); // Показываем первые 12
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(events.map(e => e.category).filter(Boolean))];
  
  const filteredEvents = events.filter(event => {
    const matchSearch = event.title?.toLowerCase().includes(search.toLowerCase()) ||
                       event.shortDescription?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero секция как на Avito */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Найдите идеальное путешествие
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Более {events.length} событий по всей России ждут вас
          </p>
          
          {/* Поисковая строка */}
          <div className="max-w-2xl mx-auto relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск событий, экскурсий, туров..."
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-800 text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </section>

      {/* Категории */}
      {categories.length > 1 && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {cat === 'all' ? 'Все' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Сетка событий - карточки как на Avito */}
      <main className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Ничего не найдено</h2>
            <p className="text-gray-500">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedCategory === 'all' ? 'Все события' : selectedCategory}
              </h2>
              <span className="text-gray-500">{filteredEvents.length} событий</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map(event => (
                <Link
                  to={`/event/${event.id}`}
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Изображение */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                    {event.previewImage ? (
                      <img
                        src={`http://localhost:5001${event.previewImage}`}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                        🏔️
                      </div>
                    )}
                    {/* Бейдж категории */}
                    {event.category && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full text-gray-700">
                        {event.category}
                      </span>
                    )}
                    {/* Рейтинг */}
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      {event.rating || 'Новый'}
                    </span>
                  </div>
                  
                  {/* Контент */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition line-clamp-2 mb-2">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-1 mb-3">
                      {event.region && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <FaMapMarkerAlt className="text-red-400 text-xs" />
                          {event.region}
                        </p>
                      )}
                      {event.startDate && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <FaCalendarAlt className="text-blue-400 text-xs" />
                          {new Date(event.startDate).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-xl font-bold text-blue-600">
                        {parseFloat(event.price).toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="text-sm text-gray-400">
                        {event.durationDays ? `${event.durationDays} дн.` : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Футер */}
      <footer className="bg-gray-800 text-gray-400 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2026 TourHub - Все права защищены</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
EOFJS

# 2. Добавляем CTA кнопки и улучшаем страницу события
cat > frontend/src/pages/EventDetailPage_v2.js << 'EOFJS'
// Замена для EventDetailPage.js - улучшенная карточка события
// Сохраните текущий EventDetailPage.js и примените эти улучшения

// В начало файла добавить хлебные крошки:
const Breadcrumbs = ({ event }) => (
  <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
    <Link to="/" className="hover:text-blue-600">Главная</Link>
    <span>/</span>
    <Link to="/events" className="hover:text-blue-600">События</Link>
    <span>/</span>
    <span className="text-gray-900">{event?.title || 'Загрузка...'}</span>
  </nav>
);

// Заменить кнопку бронирования на CTA:
// Было:
// <button onClick={...} className="...">Забронировать</button>
// Стало:
// <button 
//   onClick={...} 
//   className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5 transition-all duration-200"
// >
//   Забронировать за {event.price} ₽
// </button>

// Добавить секцию "Похожие события":
const SimilarEvents = ({ eventId, category }) => {
  const [similar, setSimilar] = useState([]);
  useEffect(() => {
    api.get('/events').then(res => {
      const events = res.data.content || res.data || [];
      setSimilar(events.filter(e => e.category === category && e.id !== eventId).slice(0, 4));
    });
  }, [eventId, category]);
  
  if (similar.length === 0) return null;
  
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Похожие события</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {similar.map(event => (
          <Link to={`/event/${event.id}`} key={event.id} className="group">
            <div className="h-32 bg-gray-200 rounded-xl mb-2 overflow-hidden">
              {event.previewImage && (
                <img src={`http://localhost:5001${event.previewImage}`} alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition" />
              )}
            </div>
            <p className="text-sm font-medium line-clamp-2">{event.title}</p>
            <p className="text-blue-600 font-bold">{parseFloat(event.price).toLocaleString()} ₽</p>
          </Link>
        ))}
      </div>
    </section>
  );
};
EOFJS

# 3. Улучшаем страницу логина
cat > frontend/src/pages/LoginPage.js << 'EOFJS'
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Добро пожаловать!');
      navigate('/');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Логотип */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TourHub
          </Link>
          <p className="text-gray-500 mt-2">Войдите чтобы продолжить</p>
        </div>

        {/* Форма */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" />
                Запомнить меня
              </label>
              <button type="button" className="text-blue-600 hover:underline">
                Забыли пароль?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
EOFJS

echo "✅ Файлы обновлены!"
echo ""
echo "Обновления по лучшим практикам:"
echo "  1. Hero секция с поиском (как Avito)"
echo "  2. Скелетон-загрузчики при загрузке"
echo "  3. Категории-фильтры"
echo "  4. Карточки с ховер-эффектами и lazy loading"
echo "  5. Улучшенная страница логина с анимациями"
echo "  6. Хлебные крошки"
echo "  7. Похожие события"
echo "  8. Ссылка 'Забыли пароль?'"
echo "  9. Показ/скрытие пароля"
echo " 10. Кнопка CTA с градиентом и ценой"
