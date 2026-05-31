import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaCheck, FaTimes, FaSearch, FaStore, FaCalendarCheck, FaComments, FaChevronDown, FaChevronUp, FaUser, FaHeadset, FaReply, FaEye, FaEdit, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [sellers, setSellers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [expandedChats, setExpandedChats] = useState({});
  const [chatMessages, setChatMessages] = useState({});
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const navigate = useNavigate();

  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [sellerSearch, setSellerSearch] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); return; }
    const user = JSON.parse(userData);
    if (user.role !== 'MANAGER' && user.role !== 'ADMIN') { navigate('/'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sellersRes, eventsRes, bookingsRes, chatsRes] = await Promise.all([
        api.get('/admin/sellers').catch(() => ({ data: [] })),
        api.get('/admin/events').catch(() => ({ data: [] })),
        api.get('/admin/bookings').catch(() => ({ data: [] })),
        api.get('/messages/admin/chats').catch(() => ({ data: [] }))
      ]);
      setSellers(Array.isArray(sellersRes.data) ? sellersRes.data : []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setChats(Array.isArray(chatsRes.data) ? chatsRes.data : []);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const approveSeller = async (id) => { try { await api.put(`/admin/sellers/${id}/approve`); toast.success('Одобрен'); loadData(); } catch { toast.error('Ошибка'); } };
  const rejectSeller = async (id) => { try { await api.put(`/admin/sellers/${id}/reject`); toast.success('Отклонён'); loadData(); } catch { toast.error('Ошибка'); } };
  
  const saveEventEdits = async () => {
    try {
      await api.put(`/admin/events/${editingEvent.id}`, {
        ...editingEvent,
        isPublished: editingEvent.moderationStatus === 'approved'
      });
      toast.success('Событие обновлено');
      setEditingEvent(null);
      loadData();
    } catch { toast.error('Ошибка'); }
  };

  const confirmBooking = async (id) => { try { await api.post(`/admin/bookings/${id}/confirm`); toast.success('Подтверждено'); loadData(); } catch { toast.error('Ошибка'); } };
  const completeBooking = async (id) => { try { await api.post(`/admin/bookings/${id}/complete`); toast.success('Завершено'); loadData(); } catch { toast.error('Ошибка'); } };

  const loadChatMessages = async (conversationId) => {
    const userId = conversationId.split('_')[1];
    if (!userId) return;
    try { const response = await api.get(`/messages/chat/${userId}`); setChatMessages(prev => ({ ...prev, [conversationId]: response.data || [] })); } catch {}
  };
  const toggleChat = (conversationId) => {
    setExpandedChats(prev => {
      const newState = { ...prev, [conversationId]: !prev[conversationId] };
      if (newState[conversationId] && !chatMessages[conversationId]) loadChatMessages(conversationId);
      return newState;
    });
  };
  const sendReply = async () => {
    if (!replyMessage.trim()) { toast.error('Введите сообщение'); return; }
    try {
      await api.post('/messages/admin/chat/reply', { conversationId: selectedChat.conversationId, message: replyMessage.trim() });
      toast.success('Ответ отправлен'); setShowReplyModal(false); setReplyMessage('');
      if (expandedChats[selectedChat.conversationId]) loadChatMessages(selectedChat.conversationId);
      loadData();
    } catch { toast.error('Ошибка'); }
  };

  const filteredBookings = bookings.filter(b => {
    if (bookingStatusFilter && b.status !== bookingStatusFilter) return false;
    if (bookingSearch) {
      const q = bookingSearch.toLowerCase();
      if (!b.Event?.title?.toLowerCase().includes(q) && !`${b.User?.firstName} ${b.User?.lastName}`.toLowerCase().includes(q) && !b.bookingNumber?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredChats = chats.filter(c => {
    if (chatSearch && !c.fromUserName?.toLowerCase().includes(chatSearch.toLowerCase())) return false;
    return true;
  });

  const filteredSellers = sellers.filter(s => {
    if (sellerSearch && !s.companyName?.toLowerCase().includes(sellerSearch.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREATED': return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Создано</span>;
      case 'CONFIRMED': return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">Подтверждено</span>;
      case 'COMPLETED': return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">Завершено</span>;
      case 'CANCELLED': return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">Отменено</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) return <div className="h-screen flex flex-col"><div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div></div></div>;

  const ic = "w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 focus:outline-none";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6"><h2 className="text-xl font-bold">👑 Панель управления</h2></div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {[{ key: 'bookings', label: 'Бронирования', icon: <FaCalendarCheck />, count: bookings.length },{ key: 'chats', label: 'Чаты', icon: <FaComments />, count: chats.length },{ key: 'events', label: 'Модерация', icon: <FaCalendarAlt />, count: events.length },{ key: 'sellers', label: 'Продавцы', icon: <FaStore />, count: sellers.length }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${activeTab === tab.key ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{tab.icon} {tab.label} ({tab.count})</button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          
          {/* Бронирования */}
          {activeTab === 'bookings' && <div>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Поиск..." value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} className={ic + " pl-9"} /></div>
              <select value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)} className={ic + " max-w-[180px]"}><option value="">Все статусы</option><option value="CREATED">Создано</option><option value="CONFIRMED">Подтверждено</option><option value="COMPLETED">Завершено</option><option value="CANCELLED">Отменено</option></select>
            </div>
            <div className="space-y-3">
              {filteredBookings.map(b => (
                <div key={b.id} className="border rounded-xl p-4">
                  <div className="flex justify-between"><div><h3 className="font-semibold">{b.Event?.title || `#${b.eventId}`}</h3><p className="text-sm text-gray-500">👤 {b.User ? `${b.User.firstName} ${b.User.lastName}` : `#${b.userId}`} • {b.bookingNumber}</p></div>{getStatusBadge(b.status)}</div>
                  <div className="grid grid-cols-5 gap-3 text-sm mt-3">
                    <div><span className="text-gray-400">Дата</span><p>{new Date(b.eventDate).toLocaleDateString('ru-RU')}</p></div>
                    <div><span className="text-gray-400">Участников</span><p>{b.participants}</p></div>
                    <div><span className="text-gray-400">Сумма</span><p className="font-bold text-blue-600">${parseFloat(b.totalPrice||0).toFixed(0)}</p></div>
                    <div><span className="text-gray-400">Телефон</span><p>{b.contactPhone}</p></div>
                    <div><span className="text-gray-400">Email</span><p className="truncate">{b.contactEmail}</p></div>
                  </div>
                  {b.specialRequests && <div className="mt-2 bg-yellow-50 rounded-lg p-2 text-sm">💬 {b.specialRequests}</div>}
                  <div className="flex gap-2 mt-3">
                    {b.status === 'CREATED' && <button onClick={() => confirmBooking(b.id)} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm"><FaCheck className="inline mr-1" /> Подтвердить</button>}
                    {b.status === 'CONFIRMED' && <button onClick={() => completeBooking(b.id)} className="bg-green-500 text-white px-3 py-1 rounded-full text-sm"><FaCalendarCheck className="inline mr-1" /> Завершить</button>}
                  </div>
                </div>
              ))}
              {filteredBookings.length === 0 && <p className="text-center text-gray-400 py-8">Ничего не найдено</p>}
            </div>
          </div>}

          {/* Чаты */}
          {activeTab === 'chats' && <div>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Поиск по имени..." value={chatSearch} onChange={(e) => setChatSearch(e.target.value)} className={ic + " pl-9"} /></div>
            </div>
            <div className="space-y-3">
              {filteredChats.map(chat => {
                const isExpanded = expandedChats[chat.conversationId];
                const messages = chatMessages[chat.conversationId] || [];
                return (
                  <div key={chat.conversationId} className="border rounded-xl overflow-hidden">
                    <div onClick={() => toggleChat(chat.conversationId)} className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-medium text-blue-600">{chat.fromUserName?.[0]}</div><div><h3 className="font-semibold">{chat.fromUserName}</h3><p className="text-sm text-gray-500">{chat.messageCount} сообщ.</p></div></div>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedChat(chat); setShowReplyModal(true); }} className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm"><FaReply className="inline mr-1" /> Ответить</button>
                    </div>
                    {isExpanded && <div className="border-t bg-gray-50 p-4 space-y-3">{messages.map(msg => { const isManager = msg.fromUserRole === 'MANAGER' || msg.fromUserRole === 'ADMIN'; return <div key={msg.id} className={`flex ${isManager ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isManager ? 'bg-green-500 text-white' : 'bg-white border text-gray-800'}`}>{msg.message}</div></div>; })}</div>}
                  </div>
                );
              })}
              {filteredChats.length === 0 && <p className="text-center text-gray-400 py-8">Нет чатов</p>}
            </div>
          </div>}

          {/* Модерация событий */}
          {activeTab === 'events' && <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} onClick={() => setEditingEvent({...event, publishUntil: event.publishUntil || event.endDate?.split('T')[0] || ''})} className="border rounded-xl p-4 hover:shadow-md transition cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.Seller?.companyName || `Продавец #${event.sellerId}`} • ${parseFloat(event.price).toFixed(0)}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${event.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' : event.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{event.moderationStatus === 'approved' ? '✅ Опубликовано' : event.moderationStatus === 'rejected' ? '❌ Отклонено' : '⏳ На модерации'}</span>
                      <span className="text-xs text-gray-400">{event.startDate && new Date(event.startDate).toLocaleDateString('ru-RU')} — {event.endDate && new Date(event.endDate).toLocaleDateString('ru-RU')}</span>
                      {event.publishUntil && <span className="text-xs text-blue-500">До: {new Date(event.publishUntil).toLocaleDateString('ru-RU')}</span>}
                    </div>
                  </div>
                  <FaEdit className="text-gray-300 hover:text-blue-500 transition ml-2" />
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-center text-gray-400 py-8">Нет событий</p>}
          </div>}

          {/* Продавцы */}
          {activeTab === 'sellers' && <div>
            <div className="relative mb-4"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Поиск по названию..." value={sellerSearch} onChange={(e) => setSellerSearch(e.target.value)} className={ic + " pl-9"} /></div>
            <div className="space-y-3">
              {filteredSellers.map(seller => (
                <div key={seller.id} className="border rounded-xl p-4 flex justify-between items-center">
                  <div><h3 className="font-semibold">{seller.companyName}</h3><p className="text-sm text-gray-500">{seller.User?.email} • {seller.phone}</p></div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${seller.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{seller.moderationStatus}</span>
                    <button onClick={() => setSelectedSeller(seller)} className="p-1.5 text-gray-400 hover:text-blue-500"><FaEye /></button>
                    <button onClick={() => approveSeller(seller.id)} className="p-1.5 text-green-500 hover:bg-green-50 rounded-full"><FaCheck /></button>
                    <button onClick={() => rejectSeller(seller.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"><FaTimes /></button>
                  </div>
                </div>
              ))}
              {filteredSellers.length === 0 && <p className="text-center text-gray-400 py-8">Ничего не найдено</p>}
            </div>
          </div>}
        </div>
      </div>

      {/* Модальное окно редактирования события */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Редактирование: {editingEvent.title}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><label className="text-xs text-gray-500">Название</label><input value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} className={ic} /></div>
              <div><label className="text-xs text-gray-500">Цена</label><input type="number" value={editingEvent.price} onChange={(e) => setEditingEvent({...editingEvent, price: e.target.value})} className={ic} /></div>
              <div className="col-span-2"><label className="text-xs text-gray-500">Краткое описание</label><input value={editingEvent.shortDescription || ''} onChange={(e) => setEditingEvent({...editingEvent, shortDescription: e.target.value})} className={ic} /></div>
              <div className="col-span-2"><label className="text-xs text-gray-500">Полное описание</label><textarea rows="3" value={editingEvent.fullDescription || ''} onChange={(e) => setEditingEvent({...editingEvent, fullDescription: e.target.value})} className={ic} /></div>
              <div><label className="text-xs text-gray-500">Адрес</label><input value={editingEvent.address || ''} onChange={(e) => setEditingEvent({...editingEvent, address: e.target.value})} className={ic} /></div>
              <div><label className="text-xs text-gray-500">Регион</label><input value={editingEvent.region || ''} onChange={(e) => setEditingEvent({...editingEvent, region: e.target.value})} className={ic} /></div>
              <div><label className="text-xs text-gray-500">Дата начала</label><input type="datetime-local" value={editingEvent.startDate?.slice(0,16) || ''} onChange={(e) => setEditingEvent({...editingEvent, startDate: e.target.value})} className={ic} /></div>
              <div><label className="text-xs text-gray-500">Дата окончания</label><input type="datetime-local" value={editingEvent.endDate?.slice(0,16) || ''} onChange={(e) => setEditingEvent({...editingEvent, endDate: e.target.value})} className={ic} /></div>
              <div><label className="text-xs text-gray-500">Макс. участников</label><input type="number" value={editingEvent.maxParticipants} onChange={(e) => setEditingEvent({...editingEvent, maxParticipants: e.target.value})} className={ic} /></div>
              <div><label className="text-xs text-gray-500">Статус</label><select value={editingEvent.moderationStatus} onChange={(e) => setEditingEvent({...editingEvent, moderationStatus: e.target.value})} className={ic}><option value="pending">На модерации</option><option value="approved">Одобрено</option><option value="rejected">Отклонено</option></select></div>
              <div><label className="text-xs text-gray-500">Срок публикации до</label><input type="date" value={editingEvent.publishUntil || ''} onChange={(e) => setEditingEvent({...editingEvent, publishUntil: e.target.value})} className={ic} /></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveEventEdits} className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm flex-1"><FaSave className="inline mr-1" /> Сохранить</button>
              <button onClick={() => setEditingEvent(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm flex-1">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно ответа */}
      {showReplyModal && selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-2">Ответить {selectedChat.fromUserName}</h3>
            <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows="4" className="w-full border rounded-xl px-4 py-2 text-sm mb-4" autoFocus />
            <div className="flex gap-2"><button onClick={sendReply} className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm flex-1">Отправить</button><button onClick={() => setShowReplyModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm flex-1">Отмена</button></div>
          </div>
        </div>
      )}

      {/* Просмотр продавца */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">{selectedSeller.companyName}</h3>
            <div className="space-y-2 text-sm"><p><strong>Email:</strong> {selectedSeller.User?.email}</p><p><strong>Телефон:</strong> {selectedSeller.phone}</p><p><strong>ИНН:</strong> {selectedSeller.inn}</p><p><strong>ОГРН:</strong> {selectedSeller.ogrn}</p><p><strong>Описание:</strong> {selectedSeller.description}</p></div>
            <button onClick={() => setSelectedSeller(null)} className="mt-4 w-full bg-gray-200 py-2 rounded-full text-sm">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
