import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaStar, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../services/api';
import Header from '../components/Header';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Компонент для отслеживания границ карты
const BoundsListener = ({ onBoundsChange }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange(bounds);
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onBoundsChange(bounds);
    }
  });
  
  useEffect(() => {
    const bounds = map.getBounds();
    onBoundsChange(bounds);
  }, []);
  
  return null;
};

const MapPage = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPanel, setShowPanel] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/events');
      const eventsData = response.data.content || response.data || [];
      const filtered = eventsData.filter(e => e.latitude && e.longitude);
      setAllEvents(filtered);
      setVisibleEvents(filtered);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoundsChange = (bounds) => {
    const visible = allEvents.filter(event => {
      const lat = parseFloat(event.latitude);
      const lng = parseFloat(event.longitude);
      return bounds.contains([lat, lng]);
    });
    setVisibleEvents(visible);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setActiveEventId(event.id);
    
    const element = document.getElementById(`event-${event.id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    if (mapRef.current) {
      mapRef.current.flyTo([parseFloat(event.latitude), parseFloat(event.longitude)], 13);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative">
          <MapContainer
            center={[55.751244, 37.618423]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <BoundsListener onBoundsChange={handleBoundsChange} />
            {allEvents.map(event => (
              <Marker 
                key={event.id} 
                position={[parseFloat(event.latitude), parseFloat(event.longitude)]}
                eventHandlers={{ click: () => handleEventClick(event) }}
              >
                <Popup>
                  <div className="w-44">
                    <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{event.address}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-600 text-sm">${parseFloat(event.price).toFixed(0)}</span>
                      <Link to={`/event/${event.id}`} className="text-xs text-blue-500 hover:underline">Подробнее →</Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <button
          onClick={() => setShowPanel(!showPanel)}
          className="absolute right-[320px] top-4 z-20 bg-white rounded-full shadow-lg p-1.5 hover:bg-gray-50 transition"
          style={{ right: showPanel ? '320px' : '8px' }}
        >
          {showPanel ? <FaChevronRight className="text-gray-600" /> : <FaChevronLeft className="text-gray-600" />}
        </button>

        <div className={`bg-white/95 backdrop-blur-sm border-l border-gray-200 overflow-y-auto flex-shrink-0 z-10 shadow-xl transition-all duration-300 ${
          showPanel ? 'w-80 lg:w-96' : 'w-0 overflow-hidden'
        }`}>
          {showPanel && (
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-400" />
                На карте ({visibleEvents.length})
              </h2>
              <div className="space-y-2">
                {visibleEvents.map(event => (
                  <div
                    key={event.id}
                    id={`event-${event.id}`}
                    onMouseEnter={() => setActiveEventId(event.id)}
                    onMouseLeave={() => setActiveEventId(null)}
                    onClick={() => handleEventClick(event)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      activeEventId === event.id 
                        ? 'bg-red-50 border-2 border-red-300 shadow-md scale-[1.02]' 
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <Link to={`/event/${event.id}`} className="block" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg flex-shrink-0 overflow-hidden">
                          {event.previewImage ? (
                            <img src={`http://localhost:5001${event.previewImage}`} alt="" className="w-full h-full object-cover" />
                          ) : '🏔️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            {activeEventId === event.id && (
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></span>
                            )}
                            <h3 className="font-medium text-sm text-gray-800 truncate">{event.title}</h3>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{event.address}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="font-semibold text-sm text-blue-600">${parseFloat(event.price).toFixed(0)}</span>
                            {event.rating > 0 && (
                              <span className="text-xs text-yellow-500 flex items-center gap-0.5">
                                <FaStar className="text-[10px]" /> {parseFloat(event.rating).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
              {visibleEvents.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Нет событий в этой области</p>
                  <p className="text-xs mt-1">Переместите карту</p>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedEvent && (
          <div className="absolute bottom-6 left-6 bg-white rounded-2xl shadow-2xl p-4 w-72 z-50">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-3 right-3 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 text-xs">✕</button>
            <div className="h-32 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 mb-3 overflow-hidden">
              {selectedEvent.previewImage ? (
                <img src={`http://localhost:5001${selectedEvent.previewImage}`} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl">🏔️</div>
              )}
            </div>
            <h3 className="font-semibold text-gray-800">{selectedEvent.title}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{selectedEvent.shortDescription?.substring(0, 100)}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-bold text-lg text-blue-600">${parseFloat(selectedEvent.price).toFixed(0)}</span>
              <Link to={`/event/${selectedEvent.id}`} className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-600 transition">Подробнее</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
