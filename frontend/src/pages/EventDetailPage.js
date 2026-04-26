import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaComment } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [user, setUser] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [bookingData, setBookingData] = useState({
    participants: 1,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialRequests: '',
    eventDate: ''
  });

  // Функция форматирования телефона
  const formatPhoneNumber = (value) => {
    // Удаляем все нецифровые символы
    let cleaned = value.replace(/\D/g, '');
    
    // Если начинается с 8, заменяем на +7
    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.substring(1);
    }
    
    // Если не начинается с 7, добавляем 7
    if (!cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    
    // Ограничиваем длину 11 цифрами (7 + 10 цифр)
    cleaned = cleaned.substring(0, 11);
    
    // Форматируем по маске +7(XXX)XXX-XX-XX
    let formatted = '+7';
    if (cleaned.length > 1) {
      formatted += '(' + cleaned.substring(1, 4);
    }
    if (cleaned.length >= 4) {
      formatted += ')' + cleaned.substring(4, 7);
    }
    if (cleaned.length >= 7) {
      formatted += '-' + cleaned.substring(7, 9);
    }
    if (cleaned.length >= 9) {
      formatted += '-' + cleaned.substring(9, 11);
    }
    
    return formatted;
  };

  // Валидация телефона
  const validatePhone = (phone) => {
    const phoneRegex = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Номер должен быть в формате +7(911)123-45-67');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatPhoneNumber(rawValue);
    setBookingData({ ...bookingData, contactPhone: formatted });
    validatePhone(formatted);
  };

  const handlePhoneBlur = () => {
    if (bookingData.contactPhone && bookingData.contactPhone !== '+7') {
      validatePhone(bookingData.contactPhone);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      setBookingData(prev => ({ ...prev, eventDate: response.data.startDate?.split('T')[0] || '' }));
    } catch (error) {
      toast.error('Событие не найдено');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Войдите в систему для бронирования');
      navigate('/login');
      return;
    }
    
    // Валидация перед отправкой
    if (!validatePhone(bookingData.contactPhone)) {
      toast.error('Введите корректный номер телефона');
      return;
    }
    
    if (!bookingData.contactName.trim()) {
      toast.error('Введите контактное лицо');
      return;
    }
    
    if (!bookingData.contactEmail.trim()) {
      toast.error('Введите email');
      return;
    }
    
    try {
      const response = await api.post('/bookings', { eventId: event.id, ...bookingData });
      toast.success(`Бронирование создано! Номер: ${response.data.bookingNumber}`);
      setShowBookingForm(false);
      setBookingData({
        participants: 1,
        contactName: '',
        contactPhone: '+7',
        contactEmail: '',
        specialRequests: '',
        eventDate: bookingData.eventDate
      });
    } catch (error) {
      toast.error('Ошибка бронирования');
    }
  };

  const sendMessageToSeller = async () => {
    const message = prompt('Введите сообщение для продавца:');
    if (!message) return;
    try {
      await api.post('/messages/to-seller', { sellerId: event.sellerId, message, eventId: event.id });
      toast.success('Сообщение отправлено продавцу');
    } catch (error) {
      toast.error('Ошибка отправки');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-800"><FaArrowLeft /> Назад</button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img src={event.previewImage || 'https://via.placeholder.com/1200x400'} alt={event.title} className="w-full h-64 object-cover" />
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-blue-500" /> {event.address || 'Адрес не указан'}</div>
              <div className="flex items-center gap-2"><FaCalendarAlt className="text-blue-500" /> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</div>
              <div className="flex items-center gap-2"><FaUsers className="text-blue-500" /> до {event.maxParticipants} чел.</div>
              <div className="flex items-center gap-2"><FaStar className="text-yellow-400" /> {event.rating || 'Нет оценок'}</div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Описание</h2>
              <p className="text-gray-700">{event.fullDescription || event.shortDescription}</p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-3xl font-bold text-blue-600">{event.price} ₽</div>
              <div className="flex gap-3">
                {user && user.role === 'USER' && (
                  <button onClick={() => setShowBookingForm(!showBookingForm)} className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                    {showBookingForm ? 'Скрыть форму' : 'Забронировать'}
                  </button>
                )}
                <button onClick={sendMessageToSeller} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
                  <FaComment /> Сообщение продавцу
                </button>
              </div>
            </div>

            {showBookingForm && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-xl font-semibold mb-4">📋 Оформление бронирования</h3>
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">👥 Количество участников *</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={event.maxParticipants} 
                      value={bookingData.participants} 
                      onChange={(e) => setBookingData({...bookingData, participants: parseInt(e.target.value)})} 
                      className="w-full max-w-xs border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                    />
                    <p className="text-xs text-gray-500 mt-1">Максимум участников: {event.maxParticipants}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">👤 Контактное лицо *</label>
                    <input 
                      type="text" 
                      value={bookingData.contactName} 
                      onChange={(e) => setBookingData({...bookingData, contactName: e.target.value})} 
                      className="w-full max-w-md border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Иванов Иван Иванович"
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">📞 Телефон *</label>
                    <input 
                      type="tel" 
                      value={bookingData.contactPhone} 
                      onChange={handlePhoneChange}
                      onBlur={handlePhoneBlur}
                      className={`w-full max-w-md border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${phoneError ? 'border-red-500' : ''}`}
                      placeholder="+7(911)123-45-67"
                      required 
                    />
                    <p className="text-xs text-gray-500 mt-1">Формат: +7(XXX)XXX-XX-XX</p>
                    {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">📧 Email *</label>
                    <input 
                      type="email" 
                      value={bookingData.contactEmail} 
                      onChange={(e) => setBookingData({...bookingData, contactEmail: e.target.value})} 
                      className="w-full max-w-md border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="example@mail.com"
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">📅 Дата мероприятия *</label>
                    <input 
                      type="date" 
                      value={bookingData.eventDate} 
                      onChange={(e) => setBookingData({...bookingData, eventDate: e.target.value})} 
                      className="w-full max-w-xs border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">💬 Особые пожелания</label>
                    <textarea 
                      rows="3" 
                      value={bookingData.specialRequests} 
                      onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})} 
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Укажите особые пожелания, если есть" 
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">✅ Подтвердить бронирование</button>
                    <button type="button" onClick={() => setShowBookingForm(false)} className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">❌ Отмена</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
