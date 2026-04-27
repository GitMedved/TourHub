import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaArrowLeft, FaComment, FaQuestionCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const SellerEvents = ({ sellerId, currentEventId }) => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    if (!sellerId) return;
    (async () => {
      try {
        const response = await api.get('/events');
        const allEvents = response.data.content || response.data || [];
        setEvents(allEvents.filter(e => e.sellerId === sellerId && e.id !== currentEventId).slice(0, 3));
      } catch (error) { console.error('Error:', error); }
    })();
  }, [sellerId, currentEventId]);
  if (events.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Другие события этого организатора</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events.map(event => (
          <Link to={`/event/${event.id}`} key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group">
            <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl">
              {event.previewImage ? <img src={`http://localhost:5001${event.previewImage}`} alt="" className="w-full h-full object-cover" /> : '🏔️'}
            </div>
            <div className="p-3"><h3 className="font-medium text-sm text-gray-800 line-clamp-2">{event.title}</h3><p className="text-xs text-gray-500 mt-1">${parseFloat(event.price).toFixed(0)} • {event.durationDays}д</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [dateError, setDateError] = useState('');
  const [bookingData, setBookingData] = useState({
    participants: 1, contactName: '', contactPhone: '', contactEmail: '', specialRequests: '', eventDate: ''
  });

  const loadUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const profile = response.data;
      setUserProfile(profile);
      setBookingData(prev => ({
        ...prev,
        contactName: profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.firstName || '',
        contactEmail: profile.email || ''
      }));
    } catch (error) {}
  };

  const formatPhone = (value) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('8')) cleaned = '7' + cleaned.substring(1);
    if (!cleaned.startsWith('7')) cleaned = '7' + cleaned;
    cleaned = cleaned.substring(0, 11);
    let formatted = '+7';
    if (cleaned.length > 1) formatted += ' (' + cleaned.substring(1, 4);
    if (cleaned.length >= 4) formatted += ') ' + cleaned.substring(4, 7);
    if (cleaned.length >= 7) formatted += '-' + cleaned.substring(7, 9);
    if (cleaned.length >= 9) formatted += '-' + cleaned.substring(9, 11);
    return formatted;
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 11) {
      setPhoneError('Введите полный номер телефона (11 цифр)');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateDate = (selectedDate) => {
    if (!event) return true;
    
    // Проверка, что дата в рамках события
    if (event.startDate && selectedDate < event.startDate.split('T')[0]) {
      setDateError(`Дата не может быть раньше начала события: ${new Date(event.startDate).toLocaleDateString('ru-RU')}`);
      return false;
    }
    if (event.endDate && selectedDate > event.endDate.split('T')[0]) {
      setDateError(`Дата не может быть позже окончания события: ${new Date(event.endDate).toLocaleDateString('ru-RU')}`);
      return false;
    }
    if (event.publishUntil && selectedDate > event.publishUntil.split('T')[0]) {
      setDateError(`Событие опубликовано только до: ${new Date(event.publishUntil).toLocaleDateString('ru-RU')}`);
      return false;
    }
    setDateError('');
    return true;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setBookingData({ ...bookingData, contactPhone: formatted });
    if (formatted.length >= 18) validatePhone(formatted);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setBookingData({ ...bookingData, eventDate: date });
    validateDate(date);
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) { setUser(JSON.parse(userData)); loadUserProfile(); }
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
      setBookingData(prev => ({ ...prev, eventDate: response.data.startDate?.split('T')[0] || '' }));
    } catch (error) { toast.error('Событие не найдено'); navigate('/'); } finally { setLoading(false); }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Войдите в систему'); navigate('/login'); return; }
    
    if (!validatePhone(bookingData.contactPhone)) {
      toast.error(phoneError || 'Введите корректный номер телефона');
      return;
    }
    
    if (!validateDate(bookingData.eventDate)) {
      toast.error(dateError || 'Выберите корректную дату');
      return;
    }
    
    try {
      await api.post('/bookings', { eventId: event.id, ...bookingData });
      toast.success('Бронирование создано!');
      setShowBookingForm(false);
    } catch (error) { toast.error('Ошибка бронирования'); }
  };

  const askQuestion = async () => {
    if (!user) { toast.error('Войдите в систему'); navigate('/login'); return; }
    const question = prompt('Введите ваш вопрос по событию:');
    if (!question?.trim()) return;
    try {
      await api.post('/messages/to-manager', { message: `Вопрос по событию "${event.title}": ${question}`, eventId: event.id, eventTitle: event.title });
      toast.success('Вопрос отправлен. Перейдите в чат.');
      navigate('/chat');
    } catch (error) { toast.error('Ошибка отправки'); }
  };


  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 mb-4 hover:text-gray-700 text-sm"><FaArrowLeft /> Назад</button>
        
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <img src={event.previewImage ? `http://localhost:5001${event.previewImage}` : 'https://via.placeholder.com/1200x400'} alt={event.title} className="w-full h-64 object-cover" />
          
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
            {event.sellerCompanyName && <p className="text-sm text-purple-500 font-medium mb-4">{event.sellerCompanyName}</p>}
            
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-red-400" /> {event.address || 'Адрес не указан'}</span>
              <span className="flex items-center gap-1"><FaCalendarAlt className="text-blue-400" /> {event.startDate ? new Date(event.startDate).toLocaleDateString('ru-RU') : '—'} — {event.endDate ? new Date(event.endDate).toLocaleDateString('ru-RU') : '—'}</span>
              <span className="flex items-center gap-1"><FaUsers className="text-green-400" /> до {event.maxParticipants} чел.</span>
              <span className="flex items-center gap-1"><FaStar className="text-yellow-400" /> {event.rating || 'Нет оценок'}</span>
            </div>
            
            <p className="text-gray-700 mb-6">{event.fullDescription || event.shortDescription}</p>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-2xl font-bold text-blue-600">${parseFloat(event.price).toFixed(2)}</div>
              <div className="flex gap-3">
                {user?.role === 'USER' && (
                  <button onClick={() => setShowBookingForm(!showBookingForm)} className="px-5 py-2.5 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition">
                    {showBookingForm ? 'Скрыть' : 'Забронировать'}
                  </button>
                )}
                <button onClick={askQuestion} className="px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition"><FaQuestionCircle className="inline mr-1" /> Задать вопрос</button>
              </div>
            </div>

            {showBookingForm && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Оформление бронирования</h3>
                {userProfile && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-4 text-sm">
                    <p className="text-blue-700 font-medium">👤 {bookingData.contactName}</p>
                    <p className="text-blue-600">{bookingData.contactEmail}</p>
                  </div>
                )}
                <form onSubmit={handleBookingSubmit} className="space-y-3">
                  <input type="hidden" name="contactName" value={bookingData.contactName} />
                  <input type="hidden" name="contactEmail" value={bookingData.contactEmail} />
                  
                  <div>
                    <label className="text-sm font-medium">Количество участников *</label>
                    <input type="number" min="1" max={event.maxParticipants} value={bookingData.participants} onChange={(e) => setBookingData({...bookingData, participants: parseInt(e.target.value)})} className="w-full max-w-xs border rounded-lg px-3 py-2 text-sm" required />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Телефон *</label>
                    <input 
                      type="tel" 
                      value={bookingData.contactPhone} 
                      onChange={handlePhoneChange}
                      onBlur={() => bookingData.contactPhone && validatePhone(bookingData.contactPhone)}
                      placeholder="+7 (___) ___-__-__"
                      className={`w-full max-w-xs border rounded-lg px-3 py-2 text-sm ${phoneError ? 'border-red-500' : ''}`} 
                      required 
                    />
                    {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                    <p className="text-xs text-gray-400 mt-1">Формат: +7 (XXX) XXX-XX-XX</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Дата мероприятия *</label>
                    <input 
                      type="date" 
                      value={bookingData.eventDate} 
                      onChange={handleDateChange}
                      min={event.startDate?.split('T')[0] || ''}
                      max={event.publishUntil?.split('T')[0] || event.endDate?.split('T')[0] || ''}
                      className={`w-full max-w-xs border rounded-lg px-3 py-2 text-sm ${dateError ? 'border-red-500' : ''}`} 
                      required 
                    />
                    {dateError && <p className="text-xs text-red-500 mt-1">{dateError}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {event.publishUntil 
                        ? `Событие доступно до: ${new Date(event.publishUntil).toLocaleDateString('ru-RU')}`
                        : event.endDate 
                          ? `Даты события: ${new Date(event.startDate).toLocaleDateString('ru-RU')} — ${new Date(event.endDate).toLocaleDateString('ru-RU')}`
                          : ''}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Пожелания</label>
                    <textarea rows="2" value={bookingData.specialRequests} onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm">Подтвердить</button>
                    <button type="button" onClick={() => { setShowBookingForm(false); setPhoneError(''); setDateError(''); }} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full text-sm">Отмена</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {event.sellerId && <SellerEvents sellerId={event.sellerId} currentEventId={event.id} />}
      </div>
    </div>
  );
};

export default EventDetailPage;
