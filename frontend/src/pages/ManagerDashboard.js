import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaCheck, FaTimes, FaEye, FaTrash, FaEnvelope, FaReply, FaSearch, FaSync, FaStore, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('sellers');
  const [sellers, setSellers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sellersRes, eventsRes, bookingsRes, messagesRes] = await Promise.all([
        api.get('/admin/sellers'),
        api.get('/admin/events'),
        api.get('/admin/bookings'),
        api.get('/admin/messages')
      ]);
      setSellers(sellersRes.data || []);
      setEvents(eventsRes.data || []);
      setBookings(bookingsRes.data || []);
      setMessages(messagesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const approveSeller = async (id) => {
    try {
      await api.put(`/admin/sellers/${id}/approve`);
      toast.success('Продавец одобрен');
      loadData();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const rejectSeller = async (id) => {
    const reason = prompt('Причина отклонения:');
    if (!reason) return;
    try {
      await api.put(`/admin/sellers/${id}/reject`, { reason });
      toast.success('Продавец отклонен');
      loadData();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const approveEvent = async (id) => {
    try {
      await api.post(`/admin/events/${id}/approve`);
      toast.success('Событие опубликовано');
      loadData();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const rejectEvent = async (id) => {
    const reason = prompt('Причина отклонения:');
    if (!reason) return;
    try {
      await api.post(`/admin/events/${id}/reject`, { reason });
      toast.success('Событие отклонено');
      loadData();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const confirmBooking = async (id) => {
    try {
      await api.post(`/admin/bookings/${id}/confirm`);
      toast.success('Бронирование подтверждено');
      loadData();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const deleteEvent = async (id) => {
    if (window.confirm('Удалить событие?')) {
      try {
        await api.delete(`/admin/events/${id}`);
        toast.success('Событие удалено');
        loadData();
      } catch (error) {
        toast.error('Ошибка');
      }
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Введите сообщение');
      return;
    }
    try {
      await api.post('/admin/messages/reply', {
        messageId: selectedMessage.id,
        reply: replyMessage,
        userId: selectedMessage.userId
      });
      toast.success('Ответ отправлен');
      setShowReplyModal(false);
      setReplyMessage('');
      loadData();
    } catch (error) {
      toast.error('Ошибка отправки');
    }
  };

  const filteredSellers = sellers.filter(seller =>
    seller.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.seller?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.eventTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = messages.filter(msg =>
    msg.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <h2 className="text-xl font-bold text-gray-800">👑 Панель управления менеджера</h2>
          <p className="text-gray-500">Управление продавцами, событиями, бронированиями и сообщениями</p>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b flex flex-wrap">
            <button onClick={() => setActiveTab('sellers')} className={`px-6 py-3 font-medium transition flex items-center gap-2 ${activeTab === 'sellers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}>
              <FaStore /> Продавцы ({sellers.length})
            </button>
            <button onClick={() => setActiveTab('events')} className={`px-6 py-3 font-medium transition flex items-center gap-2 ${activeTab === 'events' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}>
              <FaCalendarAlt /> События ({events.length})
            </button>
            <button onClick={() => setActiveTab('bookings')} className={`px-6 py-3 font-medium transition flex items-center gap-2 ${activeTab === 'bookings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}>
              <FaCheck /> Бронирования ({bookings.length})
            </button>
            <button onClick={() => setActiveTab('messages')} className={`px-6 py-3 font-medium transition flex items-center gap-2 ${activeTab === 'messages' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}>
              <FaEnvelope /> Сообщения ({messages.length})
            </button>
          </div>

          <div className="p-6">
            {/* Продавцы */}
            {activeTab === 'sellers' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr><th className="px-4 py-3">Компания</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3">Действия</th></tr>
                  </thead>
                  <tbody>
                    {filteredSellers.map(seller => (
                      <tr key={seller.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{seller.companyName}</td>
                        <td className="px-4 py-3">{seller.user?.email || seller.email}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${seller.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' : seller.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{seller.moderationStatus === 'approved' ? 'Одобрен' : seller.moderationStatus === 'rejected' ? 'Отклонен' : 'На модерации'}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setSelectedSeller(seller)} className="text-blue-500"><FaEye /></button>
                            {seller.moderationStatus !== 'approved' && (<><button onClick={() => approveSeller(seller.id)} className="text-green-500"><FaCheck /></button><button onClick={() => rejectSeller(seller.id)} className="text-red-500"><FaTimes /></button></>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* События */}
            {activeTab === 'events' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr><th className="px-4 py-3">Название</th><th className="px-4 py-3">Продавец</th><th className="px-4 py-3">Цена</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3">Действия</th></tr></thead>
                  <tbody>
                    {filteredEvents.map(event => (
                      <tr key={event.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{event.title}</td>
                        <td className="px-4 py-3">{event.seller?.companyName || '—'}</td>
                        <td className="px-4 py-3">{event.price} ₽</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${event.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' : event.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{event.moderationStatus === 'approved' ? 'Одобрено' : event.moderationStatus === 'rejected' ? 'Отклонено' : 'На модерации'}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link to={`/event/${event.id}`} className="text-blue-500"><FaEye /></Link>
                            {event.moderationStatus !== 'approved' && (<><button onClick={() => approveEvent(event.id)} className="text-green-500"><FaCheck /></button><button onClick={() => rejectEvent(event.id)} className="text-red-500"><FaTimes /></button></>)}
                            <button onClick={() => deleteEvent(event.id)} className="text-red-500"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Бронирования */}
            {activeTab === 'bookings' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr><th className="px-4 py-3">Событие</th><th className="px-4 py-3">Пользователь</th><th className="px-4 py-3">Сумма</th><th className="px-4 py-3">Статус</th><th className="px-4 py-3">Действия</th></tr></thead>
                  <tbody>
                    {filteredBookings.map(booking => (
                      <tr key={booking.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{booking.eventTitle}</td>
                        <td className="px-4 py-3">{booking.userName}</td>
                        <td className="px-4 py-3">{booking.totalPrice} ₽</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{booking.status === 'CONFIRMED' ? 'Подтверждено' : 'Ожидает'}</span></td>
                        <td className="px-4 py-3">{booking.status !== 'CONFIRMED' && <button onClick={() => confirmBooking(booking.id)} className="text-green-500"><FaCheck /> Подтвердить</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Сообщения */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                {filteredMessages.map(msg => (
                  <div key={msg.id} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div><p className="font-medium">{msg.userName}</p><p className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p></div>
                      {!msg.reply && <button onClick={() => { setSelectedMessage(msg); setShowReplyModal(true); }} className="bg-blue-500 text-white px-3 py-1 rounded text-sm"><FaReply /> Ответить</button>}
                    </div>
                    <p className="mt-2">{msg.message}</p>
                    {msg.reply && <div className="mt-3 pl-4 border-l-4 border-blue-300 bg-blue-50 p-3 rounded"><p className="text-xs text-blue-600">Ответ:</p><p>{msg.reply}</p></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Ответить пользователю</h3>
            <p className="text-sm text-gray-600 mb-2">Сообщение: {selectedMessage.message}</p>
            <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows="4" className="w-full border rounded-lg px-3 py-2 mb-4" placeholder="Введите ответ..." />
            <div className="flex gap-2"><button onClick={sendReply} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex-1">Отправить</button><button onClick={() => setShowReplyModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Отмена</button></div>
          </div>
        </div>
      )}

      {selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md"><h3 className="text-lg font-bold mb-4">Информация о продавце</h3><p><strong>Компания:</strong> {selectedSeller.companyName}</p><p><strong>Email:</strong> {selectedSeller.user?.email || selectedSeller.email}</p><p><strong>Телефон:</strong> {selectedSeller.phone || '—'}</p><button onClick={() => setSelectedSeller(null)} className="mt-4 w-full bg-gray-500 text-white py-2 rounded-lg">Закрыть</button></div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
