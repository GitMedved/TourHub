import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaSave, FaTimes, FaImage, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaDollarSign, FaInfoCircle, FaSearch, FaTrash, FaEdit, FaUpload, FaSync, FaPlus, FaStar, FaFolderOpen } from 'react-icons/fa';
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

// Константы категорий
const CATEGORIES = {
  nightlife: { name: 'Ночная жизнь', icon: '🌙', subcategories: ['Клубы', 'Бары', 'Лаунжи', 'Караоке', 'Ночные рестораны', 'Танцевальные площадки'] },
  active: { name: 'Активный отдых', icon: '🏃', subcategories: ['Походы', 'Велотуры', 'Альпинизм', 'Скалолазание', 'Рафтинг', 'Кайтсерфинг', 'Дайвинг'] },
  beach: { name: 'Пляжный отдых', icon: '🏖️', subcategories: ['Лежаки', 'Водные виды спорта', 'Пляжные вечеринки', 'Снорклинг', 'Пляжные бары'] },
  culture: { name: 'Культура', icon: '🏛️', subcategories: ['Музеи', 'Театры', 'Выставки', 'Концерты', 'Фестивали', 'Экскурсии'] },
  gastronomy: { name: 'Гастрономия', icon: '🍽️', subcategories: ['Рестораны', 'Дегустации', 'Кулинарные мастер-классы', 'Винные туры', 'Фуд-туры'] },
  adventure: { name: 'Приключения', icon: '🗺️', subcategories: ['Сафари', 'Джиппинг', 'Квадроциклы', 'Парапланеризм', 'Банджи-джампинг'] },
  romantic: { name: 'Романтика', icon: '❤️', subcategories: ['Свидания', 'Медовый месяц', 'Закаты', 'Ужины при свечах', 'Романтические прогулки'] },
  family: { name: 'Семейный', icon: '👨‍👩‍👧', subcategories: ['Аквапарки', 'Зоопарки', 'Детские лагеря', 'Семейные парки', 'Развлечения для детей'] },
  wellness: { name: 'Оздоровление', icon: '🧘', subcategories: ['Спа', 'Йога', 'Медитация', 'Лечебные туры', 'Термальные источники', 'Массаж'] },
  shopping: { name: 'Шоппинг', icon: '🛍️', subcategories: ['Торговые центры', 'Аутлеты', 'Бутики', 'Рынки', 'Сувениры'] },
  education: { name: 'Образование', icon: '📚', subcategories: ['Мастер-классы', 'Лекции', 'Курсы', 'Тренинги', 'Языковые лагеря'] },
  transport: { name: 'Транспорт', icon: '✈️', subcategories: ['Аренда авто', 'Трансферы', 'Круизы', 'Поездки на поезде', 'Авиаперелеты'] },
  other: { name: 'Другое', icon: '📌', subcategories: ['Другое'] }
};

function DraggableMarker({ position, setPosition, onPositionChange }) {
  const markerRef = useRef(null);
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition(newPos);
        onPositionChange(newPos.lat, newPos.lng);
      }
    },
  };
  if (!position) return null;
  return (
    <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef}>
      <Popup>📍 Перетащите маркер</Popup>
    </Marker>
  );
}

const SellerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [subcategories, setSubcategories] = useState(CATEGORIES.other.subcategories);
  const [geocodingAddress, setGeocodingAddress] = useState('');
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([55.751244, 37.618423]);
  const [markerPosition, setMarkerPosition] = useState(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    price: '',
    priceInfo: '',
    address: '',
    latitude: '',
    longitude: '',
    durationDays: 1,
    maxParticipants: 10,
    startDate: '',
    endDate: '',
    category: 'other',
    subcategory: 'other'
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') navigate('/');
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get('/seller/events');
      setEvents(response.data || []);
    } catch (error) {
      toast.error('Ошибка загрузки событий');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    setFormData({ ...formData, category: cat, subcategory: CATEGORIES[cat]?.subcategories[0] || 'other' });
    setSubcategories(CATEGORIES[cat]?.subcategories || CATEGORIES.other.subcategories);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    
    try {
      const eventId = editingEvent?.id || (events.length > 0 ? events[0].id : null);
      if (!eventId) {
        toast.error('Сначала сохраните событие');
        setUploading(false);
        return;
      }
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post(`/upload/events/${eventId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setImages(prev => [...prev, response.data.image]);
      }
      toast.success('Фото загружены');
      loadEvents();
    } catch (error) {
      toast.error('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const setAsCover = async (imageUrl) => {
    try {
      const eventId = editingEvent?.id || (events.length > 0 ? events[0].id : null);
      await api.put(`/seller/events/${eventId}/cover`, { previewImage: imageUrl });
      toast.success('Обложка установлена');
      loadEvents();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/seller/events/${editingEvent.id}`, formData);
        toast.success('Событие обновлено');
      } else {
        const response = await api.post('/seller/events', formData);
        toast.success('Событие создано и отправлено на модерацию');
      }
      setShowForm(false);
      resetForm();
      loadEvents();
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const sendToModeration = async (id) => {
    try {
      await api.post(`/seller/events/${id}/send-to-moderation`);
      toast.success('Событие отправлено на модерацию');
      loadEvents();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', shortDescription: '', fullDescription: '', price: '', priceInfo: '',
      address: '', latitude: '', longitude: '', durationDays: 1, maxParticipants: 10,
      startDate: '', endDate: '', category: 'other', subcategory: 'other'
    });
    setSelectedCategory('other');
    setSubcategories(CATEGORIES.other.subcategories);
    setMarkerPosition(null);
    setImages([]);
    setEditingEvent(null);
  };

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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => { setShowForm(!showForm); resetForm(); }} className="bg-green-500 text-white px-4 py-2 rounded-lg mb-6 flex items-center gap-2">
          <FaPlus /> {showForm ? 'Скрыть форму' : 'Создать событие'}
        </button>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{editingEvent ? 'Редактировать' : 'Новое событие'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Название *" className="border rounded-lg px-3 py-2" required />
                <input name="price" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="Цена *" className="border rounded-lg px-3 py-2" required />
              </div>

              {/* Категория */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Категория</label>
                  <select value={formData.category} onChange={handleCategoryChange} className="w-full border rounded-lg px-3 py-2">
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Подкатегория</label>
                  <select value={formData.subcategory} onChange={(e) => setFormData({...formData, subcategory: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                    {subcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              <textarea name="shortDescription" rows="2" value={formData.shortDescription} onChange={(e) => setFormData({...formData, shortDescription: e.target.value})} placeholder="Краткое описание" className="w-full border rounded-lg px-3 py-2" />
              <textarea name="fullDescription" rows="4" value={formData.fullDescription} onChange={(e) => setFormData({...formData, fullDescription: e.target.value})} placeholder="Полное описание" className="w-full border rounded-lg px-3 py-2" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <input name="latitude" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value})} placeholder="Широта" className="flex-1 border rounded-lg px-3 py-2" />
                  <input name="longitude" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value})} placeholder="Долгота" className="flex-1 border rounded-lg px-3 py-2" />
                </div>
              </div>

              {/* Загрузка фото */}
              <div>
                <label className="block text-sm font-medium mb-1">Фотографии</label>
                <label className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer inline-block">
                  📷 Загрузить фото
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img.optimizedUrl} className="w-full h-24 object-cover rounded" />
                        <button onClick={() => setAsCover(img.optimizedUrl)} className="absolute top-1 right-1 bg-yellow-500 text-white p-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition">⭐ Обложка</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg">Сохранить</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-6 py-2 rounded-lg">Отмена</button>
              </div>
            </form>
          </div>
        )}

        {/* Список событий */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="px-4 py-3">Название</th><th className="px-4 py-3">Цена</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3">Действия</th></tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} className="border-t">
                    <td className="px-4 py-3">{event.title}</td>
                    <td className="px-4 py-3">{event.price} ₽</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${event.isPublished ? 'bg-green-100 text-green-700' : event.moderationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                        {event.isPublished ? 'Опубликовано' : event.moderationStatus === 'pending' ? 'На модерации' : 'Черновик'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingEvent(event); setFormData(event); setShowForm(true); }} className="text-blue-500">✏️</button>
                        {!event.isPublished && event.moderationStatus !== 'pending' && (
                          <button onClick={() => sendToModeration(event.id)} className="text-green-500">📢 На модерацию</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

export default SellerDashboard;
