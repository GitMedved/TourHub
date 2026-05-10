import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaMapMarkerAlt, FaCalendar, FaFilter, FaTimes, FaHeart } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Header from '../components/Header';

const CATEGORIES = [
  { key: 'all', label: 'Все', icon: '🌍' },
  { key: 'active', label: 'Активный', icon: '🏃' },
  { key: 'culture', label: 'Культура', icon: '🏛️' },
  { key: 'beach', label: 'Пляж', icon: '🏖️' },
  { key: 'gastronomy', label: 'Гастрономия', icon: '🍽️' },
  { key: 'adventure', label: 'Приключения', icon: '🗺️' },
  { key: 'wellness', label: 'Оздоровление', icon: '🧘' },
  { key: 'romantic', label: 'Романтика', icon: '❤️' },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2" />
      <div className="h-3 bg-gray-100 rounded w-2/3" />
    </div>
  </div>
);

const EventCard = ({ event }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="h-44 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
        {event.previewImage ? (
          <img
            src={`http://localhost:5001${event.previewImage}`}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🏔️</div>
        )}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="absolute top-3 left-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition"
        >
          <FaHeart className={liked ? 'text-red-500' : 'text-gray-300'} />
        </button>
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-blue-600">
          {parseFloat(event.price).toLocaleString('ru-RU')} ₽
        </span>
        {event.rating > 0 && (
          <span className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white flex items-center gap-1">
            <FaStar className="text-yellow-400" />
            {parseFloat(event.rating).toFixed(1)}
            {event.reviewCount > 0 && <span className="opacity-70">({event.reviewCount})</span>}
          </span>
        )}
      </div>
      <Link to={`/event/${event.id}`} className="block p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition mb-2">
          {event.title}
        </h3>
        {event.shortDescription && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{event.shortDescription}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {event.address && (
            <span className="flex items-center gap-1 truncate">
              <FaMapMarkerAlt className="text-red-400 shrink-0" />
              {event.address}
            </span>
          )}
          {event.startDate && (
            <span className="flex items-center gap-1 shrink-0">
              <FaCalendar className="text-blue-400" />
              {new Date(event.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
        {event.sellerCompanyName && (
          <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-400">
            {event.sellerCompanyName}
          </div>
        )}
      </Link>
    </div>
  );
};

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events');
      return response.data.content || response.data || [];
    },
    staleTime: 1000 * 60 * 5
  });

  const events = data || [];

  const filtered = events.filter(e => {
    if (search && !e.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && e.category !== category) return false;
    if (minPrice && parseFloat(e.price) < parseFloat(minPrice)) return false;
    if (maxPrice && parseFloat(e.price) > parseFloat(maxPrice)) return false;
    return true;
  });

  const clearFilters = () => {
    setSearch(''); setCategory('all'); setMinPrice(''); setMaxPrice('');
  };

  const hasFilters = search || category !== 'all' || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Найдите идеальное приключение
          </h1>
          <p className="text-lg mb-6 opacity-80">
            {isLoading ? '...' : `${events.length} событий по всей России`}
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск событий, экскурсий, туров..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition ${showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'}`}
              >
                <FaFilter />
              </button>
            </div>

            {showFilters && (
              <div className="flex gap-3 mt-3">
                <input
                  type="number"
                  placeholder="Цена от"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <input
                  type="number"
                  placeholder="Цена до"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {hasFilters && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 text-sm">
              Найдено: <span className="font-semibold">{filtered.length}</span>
            </p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <FaTimes /> Сбросить фильтры
            </button>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-gray-500">Не удалось загрузить события</p>
            <p className="text-sm text-gray-400 mt-1">{error.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map(event => <EventCard key={event.id} event={event} />)
          }
        </div>

        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-500 mb-2">Ничего не найдено</p>
            <p className="text-gray-400 text-sm mb-4">Попробуйте изменить параметры поиска</p>
            {hasFilters && (
              <button onClick={clearFilters} className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">
                Сбросить фильтры
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
