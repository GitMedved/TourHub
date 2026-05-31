import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';
import { useLanguage } from '../i18n';

const DEFAULT_MAP_CENTER = { latitude: 55.7512, longitude: 37.6184 };

const buildMapUrls = (event) => {
  const latitude = Number(event?.latitude) || DEFAULT_MAP_CENTER.latitude;
  const longitude = Number(event?.longitude) || DEFAULT_MAP_CENTER.longitude;
  const bbox = [longitude - 0.08, latitude - 0.05, longitude + 0.08, latitude + 0.05].join('%2C');

  return {
    embed: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`,
    full: `https://www.openstreetmap.org/#map=13/${latitude}/${longitude}`
  };
};

const MapPage = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    api.get('/events').then(res => {
      setEvents(res.data.content || res.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingScreen text={t.common.loadingMap} />;
  }

  const regions = ['all', ...new Set(events.map(e => e.region).filter(Boolean))];
  const filteredEvents = selectedRegion === 'all' ? events : events.filter(e => e.region === selectedRegion);
  const eventOnMap = filteredEvents.find(event => event.latitude && event.longitude);
  const mapUrls = buildMapUrls(eventOnMap);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">{t.map.title}</h1>
        
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
            <iframe
              title="OpenStreetMap TourHub"
              src={mapUrls.embed}
              className="h-96 w-full border-0"
              loading="lazy"
            />
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50 border-t lg:border-l lg:border-t-0 border-gray-100">
              <div className="text-5xl mb-4">🗺️</div>
              <h2 className="text-xl font-semibold mb-2">{t.map.introTitle}</h2>
              <p className="text-gray-600 mb-4">{t.map.introText}</p>
              {eventOnMap && (
                <div className="mb-4 rounded-2xl bg-white/80 p-3 text-sm text-gray-600 shadow-sm">
                  <div className="font-semibold text-gray-900">На карте сейчас</div>
                  <div>{eventOnMap.title}</div>
                  <div className="text-xs text-gray-500">{eventOnMap.latitude}, {eventOnMap.longitude}</div>
                </div>
              )}
              <a
                href={mapUrls.full}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 transition"
              >
                <FaExternalLinkAlt />
                {t.map.openFullMap}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedRegion === r ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {r === 'all' ? t.map.all : r}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
            {t.map.noEvents}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map(event => (
              <Link to={`/event/${event.id}`} key={event.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-3 flex items-center justify-center text-white text-2xl overflow-hidden">
                  {event.previewImage ? (
                    <img src={`http://localhost:5001${event.previewImage}`} alt={event.title || ''} className="w-full h-full object-cover" loading="lazy" />
                  ) : '🏔️'}
                </div>
                <h3 className="font-semibold line-clamp-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  {event.region && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-red-400" />{event.region}</span>}
                  {event.latitude && event.longitude && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">на карте</span>}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-blue-600">{parseFloat(event.price || 0).toLocaleString('ru-RU')} ₽</span>
                  <span className="flex items-center gap-1 text-sm"><FaStar className="text-yellow-400" />{event.rating || '0.0'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
