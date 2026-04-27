import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSave, FaPlus, FaEdit, FaTrash, FaStore, FaCalendarAlt, FaInfoCircle, FaEye, FaDollarSign, FaUser, FaPhone, FaEnvelope, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const CANCEL_REASONS = [
  'Планы изменились', 'Нашёл более выгодное предложение', 'Не подходит дата',
  'Проблемы со здоровьем', 'Финансовые трудности', 'Не устроили условия', 'Другое'
];

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sales');
  const [seller, setSeller] = useState(null);
  const [events, setEvents] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [formData, setFormData] = useState({
    companyName: '', description: '', phone: '', address: '', inn: '', ogrn: '', website: '', email: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); return; }
    const user = JSON.parse(userData);
    if (user.role !== 'SELLER') { navigate('/'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sellerRes, eventsRes, salesRes] = await Promise.all([
        api.get('/seller/profile'),
        api.get('/events/seller/my'),
        api.get('/bookings/seller')
      ]);
      if (sellerRes.data) {
        setSeller(sellerRes.data);
        setFormData({
          companyName: sellerRes.data.companyName || '', description: sellerRes.data.description || '',
          phone: sellerRes.data.phone || '', address: sellerRes.data.address || '',
          inn: sellerRes.data.inn || '', ogrn: sellerRes.data.ogrn || '',
          website: sellerRes.data.website || '', email: sellerRes.data.email || ''
        });
      }
      setEvents(eventsRes.data?.content || eventsRes.data || []);
      setSales(salesRes.data?.content || []);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const handleSaveProfile = async () => {
    try { await api.put('/seller/profile', formData); toast.success('Профиль обновлён'); setEditMode(false); loadData(); } 
    catch { toast.error('Ошибка'); }
  };

  const cancelBooking = async () => {
    if (!cancelReason) { toast.error('Выберите причину'); return; }
    try {
      await api.put(`/bookings/${cancelBookingId}/cancel-seller`, { reason: cancelReason });
      toast.success('Бронирование отменено');
      setShowCancelModal(false); setCancelReason(''); setCancelBookingId(null);
      loadData();
    } catch { toast.error('Ошибка'); }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREATED': return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Создано</span>;
      case 'CONFIRMED': return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Подтверждено</span>;
      case 'COMPLETED': return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Завершено</span>;
      case 'CANCELLED_BY_USER': return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Отменено юзером</span>;
      case 'CANCELLED_BY_SELLER': return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Отменено вами</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) return <div className="h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent"></div></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"><FaStore className="text-white text-xl" /></div>
          <div><h1 className="text-2xl font-bold">{seller?.companyName || 'Моя компания'}</h1><p className="text-gray-500 text-sm">Кабинет продавца</p></div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { key: 'sales', label: 'Продажи', icon: <FaDollarSign />, count: sales.length },
            { key: 'events', label: 'Мои события', icon: <FaCalendarAlt />, count: events.length },
            { key: 'profile', label: 'Профиль компании', icon: <FaInfoCircle /> }
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${activeTab === tab.key ? 'bg-purple-500 text-white shadow-lg shadow-purple-200' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{tab.icon} {tab.label} {tab.count !== undefined && `(${tab.count})`}</button>
          ))}
        </div>

        {/* Продажи */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            {sales.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400"><div className="text-5xl mb-4">💰</div><p className="text-lg">Нет продаж</p></div>
            ) : (
              sales.map(s => (
                <div key={s.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{s.Event?.title || `Событие #${s.eventId}`}</h3>
                      <p className="text-sm text-gray-500">Номер: {s.bookingNumber}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2">
                        <div><span className="text-gray-400">Клиент</span><p className="flex items-center gap-1"><FaUser className="text-gray-400" /> {s.User ? `${s.User.firstName} ${s.User.lastName}` : '—'}</p></div>
                        <div><span className="text-gray-400">Телефон</span><p className="flex items-center gap-1"><FaPhone className="text-gray-400" /> {s.contactPhone}</p></div>
                        <div><span className="text-gray-400">Email</span><p className="flex items-center gap-1"><FaEnvelope className="text-gray-400" /> {s.contactEmail}</p></div>
                        <div><span className="text-gray-400">Сумма</span><p className="font-bold text-blue-600">${parseFloat(s.totalPrice||0).toFixed(0)}</p></div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-gray-400">Статус:</span>
                        {getStatusBadge(s.status)}
                      </div>
                      {s.specialRequests && <p className="text-sm text-gray-500 mt-2">💬 {s.specialRequests}</p>}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {s.status === 'CONFIRMED' && (
                        <button onClick={() => { setCancelBookingId(s.id); setShowCancelModal(true); }} className="bg-red-500 text-white px-3 py-1 rounded-full text-sm"><FaTimes className="inline mr-1" /> Отменить</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Мои события */}
        {activeTab === 'events' && (
          <div>
            <button onClick={() => navigate('/seller/events/create')} className="mb-4 px-5 py-2.5 bg-purple-500 text-white rounded-full text-sm font-medium hover:bg-purple-600 transition shadow-lg shadow-purple-200"><FaPlus className="inline mr-2" /> Создать событие</button>
            {events.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400"><div className="text-5xl mb-4">📅</div><p className="text-lg">Нет событий</p></div>
            ) : (
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-lg overflow-hidden">
                        {event.previewImage ? <img src={`http://localhost:5001${event.previewImage}`} alt="" className="w-full h-full object-cover" /> : '🏔️'}
                      </div>
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span>${parseFloat(event.price).toFixed(0)}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${event.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' : event.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{event.moderationStatus === 'approved' ? '✅ Опубликовано' : event.moderationStatus === 'rejected' ? '❌ Отклонено' : '⏳ На модерации'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Профиль */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between mb-6"><h2 className="text-lg font-semibold">Информация о компании</h2><button onClick={() => setEditMode(!editMode)} className={`px-4 py-2 rounded-full text-sm ${editMode ? 'bg-gray-200' : 'bg-purple-500 text-white'}`}><FaEdit className="inline mr-1" /> {editMode ? 'Отмена' : 'Редактировать'}</button></div>
            <div className="grid grid-cols-2 gap-4">
              {[{ key: 'companyName', label: 'Название *' }, { key: 'description', label: 'Описание', type: 'textarea' }, { key: 'phone', label: 'Телефон' }, { key: 'address', label: 'Адрес' }, { key: 'inn', label: 'ИНН *' }, { key: 'ogrn', label: 'ОГРН *' }, { key: 'website', label: 'Сайт' }, { key: 'email', label: 'Email' }].map(f => (
                <div key={f.key} className={f.key === 'description' ? 'md:col-span-2' : ''}>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">{f.label}</label>
                  {editMode ? (
                    f.key === 'description' ? <textarea value={formData[f.key]} onChange={(e) => setFormData({...formData, [f.key]: e.target.value})} rows="3" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm" /> :
                    <input value={formData[f.key]} onChange={(e) => setFormData({...formData, [f.key]: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm" />
                  ) : <p className="py-2">{formData[f.key] || '—'}</p>}
                </div>
              ))}
            </div>
            {editMode && <button onClick={handleSaveProfile} className="mt-6 px-6 py-2.5 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition"><FaSave className="inline mr-2" /> Сохранить</button>}
          </div>
        )}
      </div>

      {/* Модальное окно отмены */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Причина отмены</h3>
            <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm mb-4">
              <option value="">Выберите причину</option>
              {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={cancelBooking} disabled={!cancelReason} className="bg-red-500 text-white px-4 py-2 rounded-full text-sm flex-1 disabled:opacity-50">Подтвердить</button>
              <button onClick={() => setShowCancelModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm flex-1">Назад</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
