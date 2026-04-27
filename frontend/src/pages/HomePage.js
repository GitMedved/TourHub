import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaStar, FaMapMarkerAlt, FaCalendar, FaClock, FaFilter } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

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

  const events = data || [];

  // Фильтрация на фронте
  const filteredEvents = events.filter(event => {
    if (searchTitle && !event.title?.toLowerCase().includes(searchTitle.toLowerCase())) return false;
    if (minPrice && parseFloat(event.price) < parseFloat(minPrice)) return false;
    if (maxPrice && parseFloat(event.price) > parseFloat(maxPrice)) return false;
    return true;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 ">
        {/* Поиск */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск событий..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-300 focus:outline-none transition shadow-sm text-sm"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FaFilter className={`text-sm ${showFilters ? 'text-blue-500' : 'text-gray-400'}`} />
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-3 flex gap-3">
              <input
                type="number"
                placeholder="Цена от"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="flex-1 border-2 border-gray-100 rounded-xl px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Цена до"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="flex-1 border-2 border-gray-100 rounded-xl px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Сетка событий */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {filteredEvents.map(event => (
            <Link
              to={`/event/${event.id}`}
              key={event.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              {/* Изображение */}
              <div className="h-44 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                {event.previewImage ? (
                  <img src={`http://localhost:5001${event.previewImage}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl opacity-80">
                    🏔️
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                  ${parseFloat(event.price).toFixed(0)}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                  {event.title}
                </h3>
                
                {event.sellerCompanyName && (
                  <p className="text-xs text-purple-500 font-medium mb-2">
                    {event.sellerCompanyName}
                  </p>
                )}
                
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {event.shortDescription || event.fullDescription?.substring(0, 80) || 'Описание отсутствует'}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {event.address && (
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-red-400" />
                      {event.address.split(',')[0]}
                    </span>
                  )}
                  {event.startDate && (
                    <span className="flex items-center gap-1">
                      <FaCalendar className="text-blue-400" />
                      {formatDate(event.startDate)}
                    </span>
                  )}
                  {event.durationDays > 0 && (
                    <span className="flex items-center gap-1">
                      <FaClock className="text-green-400" />
                      {event.durationDays}д
                    </span>
                  )}
                </div>
                
                {event.rating > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <FaStar className="text-yellow-400 text-xs" />
                    <span className="text-xs font-medium text-gray-600">{parseFloat(event.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg">События не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
