import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaMapMarkerAlt, FaCalendar, FaClock, FaFilter } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Header from '../components/Header';
import LoadingScreen from '../components/LoadingScreen';

const HomePage = () => {
  const [searchTitle, setSearchTitle] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events');
      return response.data.content || response.data || [];
    }
  });

  if (isLoading) {
    return <LoadingScreen text="Загружаем события" />;
  }

  const events = data || [];
  const filteredEvents = events.filter(event => {
    if (searchTitle && !event.title?.toLowerCase().includes(searchTitle.toLowerCase())) return false;
    if (minPrice && parseFloat(event.price) < parseFloat(minPrice)) return false;
    if (maxPrice && parseFloat(event.price) > parseFloat(maxPrice)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero секция */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Найдите идеальное приключение
          </h1>
          <p className="text-lg mb-6 opacity-90">{events.length} событий по всей России</p>
          
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Поиск событий, экскурсий, туров..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <FaFilter className={`text-gray-400 ${showFilters ? 'text-blue-500' : ''}`} />
              </button>
            </div>
            
            {showFilters && (
              <div className="flex gap-3 mt-3">
                <input type="number" placeholder="Цена от" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 text-gray-800 text-sm" />
                <input type="number" placeholder="Цена до" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  className="flex-1 rounded-lg px-3 py-2 text-gray-800 text-sm" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Сетка */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEvents.map(event => (
            <Link to={`/event/${event.id}`} key={event.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="h-44 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                {event.previewImage ? (
                  <img src={`http://localhost:5001${event.previewImage}`} alt={event.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl">🏔️</div>
                )}
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-bold text-blue-600">
                  {parseFloat(event.price).toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 transition">
                  {event.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {event.region && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-red-400" />{event.region}</span>}
                  {event.startDate && <span className="flex items-center gap-1"><FaCalendar className="text-blue-400" />{new Date(event.startDate).toLocaleDateString('ru-RU')}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {filteredEvents.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl">Ничего не найдено</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
