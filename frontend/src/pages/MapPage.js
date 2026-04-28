import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../services/api';
import Header from '../components/Header';

const MapPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents((response.data.content || []).filter(e => e.latitude && e.longitude));
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  if (loading) return <div className="h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div></div></div>;

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 relative">
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}>
          <Map
            defaultCenter={{ lat: 55.751244, lng: 37.618423 }}
            defaultZoom={5}
            mapId="tourhub-map"
            style={{ width: '100%', height: '100%' }}
          >
            {events.map(event => (
              <Marker
                key={event.id}
                position={{ lat: parseFloat(event.latitude), lng: parseFloat(event.longitude) }}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
            {selectedEvent && (
              <InfoWindow
                position={{ lat: parseFloat(selectedEvent.latitude), lng: parseFloat(selectedEvent.longitude) }}
                onCloseClick={() => setSelectedEvent(null)}
              >
                <div className="w-48 p-1">
                  <h3 className="font-semibold text-sm mb-1">{selectedEvent.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{selectedEvent.address}</p>
                  <Link to={`/event/${selectedEvent.id}`} className="text-xs text-blue-500 hover:underline">Подробнее →</Link>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
};

export default MapPage;
