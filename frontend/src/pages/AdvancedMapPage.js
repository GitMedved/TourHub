import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaRoute, FaCamera, FaSearch, FaMoon, FaSun, FaMapMarkerAlt, FaTrash, FaPlus, FaUser } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 12, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

const AdvancedMapPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [routePoints, setRoutePoints] = useState([]);
  const [center, setCenter] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    loadEvents();
    getCurrentLocation();
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

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const createCustomIcon = (category, isRoutePoint = false) => {
    const icons = {
      attraction: '🏛️',
      beach: '🏖️',
      nature: '🌲',
      culture: '🎭',
      hotel: '🏨',
      restaurant: '🍽️'
    };
    const colors = {
      attraction: '#3B82F6',
      beach: '#F59E0B',
      nature: '#10B981',
      culture: '#8B5CF6',
      hotel: '#EC4899',
      restaurant: '#EF4444'
    };
    
    return L.divIcon({
      html: `<div style="background:${isRoutePoint ? '#DC2626' : colors[category] || '#3B82F6'};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;">
              ${isRoutePoint ? '📍' : (icons[category] || '📍')}
            </div>`,
      className: 'custom-marker',
      iconSize: [36, 36]
    });
  };

  const addToRoute = (lat, lng, name) => {
    if (!lat || !lng) {
      toast.error('Не удалось добавить точку: отсутствуют координаты');
      return;
    }
    setRoutePoints(prev => [...prev, { lat, lng, name }]);
    toast.success(`Добавлено: ${name}`);
  };

  const removeFromRoute = (index) => {
    setRoutePoints(prev => prev.filter((_, i) => i !== index));
    toast.success('Точка удалена');
  };

  const exportToImage = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const mapElement = document.getElementById('map');
      if (!mapElement) return;
      
      const canvas = await html2canvas(mapElement, { scale: 2 });
      const link = document.createElement('a');
      link.download = 'travel-map.png';
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Изображение сохранено');
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  // Фильтрация событий, у которых есть координаты
  const filteredEvents = events.filter(event => {
    const hasCoords = (event.latitude && event.longitude) || (event.lat && event.lng);
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return hasCoords && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка карты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white shadow-md z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaMapMarkerAlt className="text-blue-500 text-2xl" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            TravelHub Pro
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/events" className="text-gray-600 hover:text-blue-500 transition px-2">
            События
          </Link>
          <Link to="/profile" className="text-gray-600 hover:text-blue-500 transition">
            <FaUser size={20} />
          </Link>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск места..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-lg px-4 py-2 w-64 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          
          <button
            onClick={exportToImage}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FaCamera /> PNG
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        <div className="absolute left-4 top-4 w-80 bg-white rounded-xl shadow-xl z-[1000] p-4 max-h-[calc(100vh-100px)] overflow-y-auto border border-gray-200">
          <h3 className="font-bold flex items-center gap-2 mb-3">
            <FaRoute className="text-blue-500" /> Маршрут
          </h3>
          
          <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
            {routePoints.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Нажмите на маркер, чтобы добавить в маршрут
              </p>
            ) : (
              routePoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                  <span className="text-blue-500 font-bold text-sm w-6">{idx + 1}</span>
                  <span className="flex-1 text-sm truncate">{point.name}</span>
                  <button
                    onClick={() => removeFromRoute(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <button
            onClick={() => setRoutePoints([])}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white rounded-lg py-2 flex items-center justify-center gap-2 transition"
          >
            <FaTrash /> Очистить
          </button>
        </div>

        <div id="map" className="flex-1">
          <MapContainer
            center={[55.751244, 37.618423]}
            zoom={6}
            className="h-full w-full"
            ref={mapRef}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url={darkMode
                ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
              }
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            />
            
            {center && center[0] && center[1] && <ChangeMapView center={center} zoom={12} />}
            
            {filteredEvents.map((event) => {
              const lat = event.latitude || event.lat;
              const lng = event.longitude || event.lng;
              
              if (!lat || !lng) return null;
              
              return (
                <Marker
                  key={event.id}
                  position={[lat, lng]}
                  icon={createCustomIcon(event.category || event.type || 'attraction')}
                  eventHandlers={{
                    click: () => {
                      addToRoute(lat, lng, event.title);
                    }
                  }}
                >
                  <Popup>
                    <div className="w-64 p-2">
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.description || event.shortDescription}</p>
                      <p className="text-sm font-bold text-blue-600 mt-2">{event.price} ₽</p>
                      <button
                        onClick={() => addToRoute(lat, lng, event.title)}
                        className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm transition flex items-center justify-center gap-2"
                      >
                        <FaPlus /> Добавить в маршрут
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            
            {routePoints.map((point, idx) => {
              if (!point.lat || !point.lng) return null;
              return (
                <Marker
                  key={`route-${idx}`}
                  position={[point.lat, point.lng]}
                  icon={createCustomIcon('attraction', true)}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-bold">Точка маршрута {idx + 1}</p>
                      <p className="text-sm">{point.name}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMapPage;
