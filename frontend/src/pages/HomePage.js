import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaSearch, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter] = useState([55.751244, 37.618423]);
  const [mapZoom] = useState(6);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/events');
      const eventsData = response.data.content || response.data || [];
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Ошибка загрузки событий');
    } finally {
      setLoading(false);
    }
  };

  const createCustomIcon = () => {
    return L.divIcon({
      html: `<div style="background:#3B82F6;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;">
              📍
            </div>`,
      className: 'custom-marker',
      iconSize: [32, 32]
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            
            {events.map((event) => {
              const lat = event.latitude || event.lat;
              const lng = event.longitude || event.lng;
              if (!lat || !lng) return null;
              
              return (
                <Marker
                  key={event.id}
                  position={[lat, lng]}
                  icon={createCustomIcon()}
                >
                  <Popup>
                    <div className="w-56 p-2">
                      <h3 className="font-bold">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.price} ₽</p>
                      <Link to={`/event/${event.id}`} className="text-blue-500 text-sm hover:underline">
                        Подробнее
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div className="w-1/2 bg-gray-50 overflow-y-auto p-4">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск событий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm mt-2">Найдено: {filteredEvents.length} событий</p>
          </div>
          
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {event.shortDescription || 'Описание отсутствует'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-blue-600 font-bold">{event.price} ₽</span>
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span className="text-sm text-gray-600">{event.rating || 'Новое'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                      <FaMapMarkerAlt className="text-blue-500" />
                      <span>{event.address || 'Адрес не указан'}</span>
                    </div>
                  </div>
                  <Link
                    to={`/event/${event.id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition ml-4"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Нет событий
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
