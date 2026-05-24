import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaMapMarkedAlt } from 'react-icons/fa';
import api from '../services/api';
import Header from '../components/Header';
import LoadingScreen from '../components/LoadingScreen';

const MapPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    api.get('/events').then(res => {
      setEvents(res.data.content || res.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingScreen text="Загружаем карту" />;
  }

  const regions = ['all', ...new Set(events.map(e => e.region).filter(Boolean))];
  const filteredEvents = selectedRegion === 'all' ? events : events.filter(e => e.region === selectedRegion);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Карта событий</h1>
        
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-96">
            <iframe
              title="OpenStreetMap"
              width="100%"
              height="100%"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html"
              className="border-0"
            />
          </div>
          <div className="p-3 text-sm text-gray-500 flex items-center gap-2"><FaMapMarkedAlt /> Бесплатная карта OpenStreetMap</div>
        </div>

        {/* Фильтр регионов */}
        <div className="flex flex-wrap gap-2 mb-6">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedRegion === r ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {r === 'all' ? 'Все' : r}
            </button>
          ))}
        </div>

        {/* Список событий */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <Link to={`/event/${event.id}`} key={event.id}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-3 flex items-center justify-center text-white text-2xl overflow-hidden">
                {event.previewImage ? (
                  <img src={`http://localhost:5001${event.previewImage}`} alt="" className="w-full h-full object-cover" loading="lazy" />
) : <FaMapMarkedAlt />} 
              </div>
              <h3 className="font-semibold line-clamp-2">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                {event.region && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-red-400" />{event.region}</span>}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-blue-600">{parseFloat(event.price).toLocaleString('ru-RU')} ₽</span>
                <span className="flex items-center gap-1 text-sm"><FaStar className="text-yellow-400" />{event.rating || '0.0'}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
