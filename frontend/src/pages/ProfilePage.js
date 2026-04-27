import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaHeadset, FaPaperPlane, FaCheck, FaTimes, FaClock, FaCalendarCheck, FaHourglassHalf, FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const CANCEL_REASONS = [
  'Планы изменились', 'Нашёл более выгодное предложение', 'Не подходит дата',
  'Проблемы со здоровьем', 'Финансовые трудности', 'Не устроили условия', 'Другое'
];

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [eventRating, setEventRating] = useState(5);
  const [sellerRating, setSellerRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { navigate('/login'); return; }
    setUser(JSON.parse(userData));
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings/my');
      setBookings(response.data.content || []);
    } catch (error) { toast.error('Ошибка загрузки'); } finally { setLoading(false); }
  };

  const cancelBooking = async () => {
    if (!cancelReason) { toast.error('Выберите причину'); return; }
    try {
      await api.put(`/bookings/${cancelBookingId}/cancel`, { reason: cancelReason });
      toast.success('Бронирование отменено');
      setShowCancelModal(false); setCancelReason(''); setCancelBookingId(null);
      loadBookings();
    } catch (error) { toast.error('Ошибка'); }
  };

  const completeBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}/complete`);
      toast.success('Статус изменён на "Завершено"');
      loadBookings();
    } catch (error) { toast.error('Ошибка'); }
  };

  const submitReview = async () => {
    if (!reviewComment.trim()) { toast.error('Введите отзыв'); return; }
    try {
      await api.post(`/bookings/${reviewBookingId}/review`, {
        eventRating, sellerRating, comment: reviewComment
      });
      toast.success('Отзыв отправлен на модерацию');
      setShowReviewModal(false); setReviewComment(''); setEventRating(5); setSellerRating(5);
      loadBookings();
    } catch (error) { toast.error(error.response?.data?.error || 'Ошибка'); }
  };

  const sendMessageToManager = async () => {
    if (!messageText.trim()) { toast.error('Введите сообщение'); return; }
    try {
      await api.post('/messages/to-manager', { message: messageText });
      toast.success('Сообщение отправлено');
      setShowMessageForm(false); setMessageText('');
    } catch (error) { toast.error('Ошибка'); }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CREATED': return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Создано</span>;
      case 'CONFIRMED': return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Подтверждено</span>;
      case 'COMPLETED': return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Завершено</span>;
      case 'CANCELLED_BY_USER': return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Отменено вами</span>;
      case 'CANCELLED_BY_SELLER': return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">Отменено продавцом</span>;
      default: return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  if (loading) return <div className="h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xl text-white font-medium">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
            <div><h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2><p className="text-gray-500">{user?.email}</p></div>
          </div>
        </div>

        <button onClick={() => setShowMessageForm(true)} className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition"><FaHeadset className="inline mr-1" /> Написать менеджеру</button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b px-6 py-3"><h3 className="font-semibold flex items-center gap-2"><FaCalendarAlt /> Мои бронирования ({bookings.length})</h3></div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><p className="text-lg">У вас пока нет бронирований</p><Link to="/events" className="text-blue-500 hover:underline mt-2 inline-block">Перейти к событиям</Link></div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="border rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{b.Event?.title || `Событие #${b.eventId}`}</h3>
                        <p className="text-sm text-gray-500">Номер: {b.bookingNumber}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2">
                          <div><span className="text-gray-400">Дата</span><p>{new Date(b.eventDate).toLocaleDateString('ru-RU')}</p></div>
                          <div><span className="text-gray-400">Участников</span><p>{b.participants}</p></div>
                          <div><span className="text-gray-400">Сумма</span><p className="font-bold text-blue-600">${parseFloat(b.totalPrice||0).toFixed(0)}</p></div>
                          <div>{getStatusBadge(b.status)}</div>
                        </div>
                        {b.cancellationReason && <p className="text-sm text-red-500 mt-2">Причина: {b.cancellationReason}</p>}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {b.status === 'CREATED' && <button onClick={() => { setCancelBookingId(b.id); setShowCancelModal(true); }} className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">Отменить</button>}
                        {b.status === 'CONFIRMED' && <button onClick={() => completeBooking(b.id)} className="bg-green-500 text-white px-3 py-1 rounded-full text-sm"><FaCalendarCheck className="inline mr-1" /> Завершить</button>}
                        {b.status === 'COMPLETED' && <button onClick={() => { setReviewBookingId(b.id); setShowReviewModal(true); }} className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm"><FaStar className="inline mr-1" /> Отзыв</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Причина отмены</h3>
            <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm mb-4">
              <option value="">Выберите причину</option>
              {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-2"><button onClick={cancelBooking} disabled={!cancelReason} className="bg-red-500 text-white px-4 py-2 rounded-full text-sm flex-1 disabled:opacity-50">Подтвердить</button><button onClick={() => setShowCancelModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm flex-1">Назад</button></div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Оставить отзыв</h3>
            <p className="text-sm text-gray-500 mb-2">Оценка событию:</p>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(s => <button key={s} onClick={() => setEventRating(s)} className={`text-2xl ${s <= eventRating ? 'text-yellow-400' : 'text-gray-300'}`}><FaStar /></button>)}
            </div>
            <p className="text-sm text-gray-500 mb-2">Оценка продавцу:</p>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(s => <button key={s} onClick={() => setSellerRating(s)} className={`text-2xl ${s <= sellerRating ? 'text-yellow-400' : 'text-gray-300'}`}><FaStar /></button>)}
            </div>
            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows="4" className="w-full border rounded-xl px-4 py-2 text-sm mb-4" placeholder="Ваш отзыв..." />
            <div className="flex gap-2"><button onClick={submitReview} className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm flex-1">Отправить</button><button onClick={() => setShowReviewModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm flex-1">Отмена</button></div>
          </div>
        </div>
      )}

      {showMessageForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold mb-4">Написать менеджеру</h3>
            <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows="5" className="w-full border rounded-xl px-4 py-2 text-sm mb-4" placeholder="Ваше сообщение..." />
            <div className="flex gap-2"><button onClick={sendMessageToManager} className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm flex-1">Отправить</button><button onClick={() => setShowMessageForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm flex-1">Отмена</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
