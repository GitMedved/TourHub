import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaStar, FaHeadset, FaPaperPlane, FaCheck, FaTimes, FaClock, FaCalendarCheck, FaHourglassHalf } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadBookings();
    loadReviews();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings/my');
      console.log('Bookings response:', response.data);
      setBookings(response.data.content || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Ошибка загрузки бронирований');
    }
  };

  const loadReviews = async () => {
    try {
      const response = await api.get('/reviews/my');
      setReviews(response.data.content || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!reviewText.trim()) {
      toast.error('Введите текст отзыва');
      return;
    }

    try {
      await api.post('/reviews', {
        eventId: selectedBooking.eventId,
        bookingId: selectedBooking.id,
        rating: reviewRating,
        comment: reviewText
      });
      toast.success('Отзыв отправлен на модерацию');
      setShowReviewForm(false);
      setReviewText('');
      setReviewRating(5);
      loadReviews();
    } catch (error) {
      toast.error('Ошибка отправки отзыва');
    }
  };

  const cancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Укажите причину отмены');
      return;
    }
    try {
      await api.put(`/bookings/${cancelBookingId}/cancel`, { reason: cancelReason });
      toast.success('Бронирование отменено');
      setShowCancelModal(false);
      setCancelReason('');
      setCancelBookingId(null);
      loadBookings();
    } catch (error) {
      toast.error('Ошибка отмены');
    }
  };

  const sendMessageToManager = async () => {
    if (!messageText.trim()) {
      toast.error('Введите сообщение');
      return;
    }
    try {
      await api.post('/messages/to-manager', {
        message: messageText,
        userId: user?.id
      });
      toast.success('Сообщение отправлено менеджеру');
      setShowMessageForm(false);
      setMessageText('');
    } catch (error) {
      toast.error('Ошибка отправки');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CREATED': return <FaHourglassHalf className="text-yellow-500" />;
      case 'CONFIRMED': return <FaCheck className="text-green-500" />;
      case 'COMPLETED': return <FaCalendarCheck className="text-blue-500" />;
      case 'CANCELLED': return <FaTimes className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CREATED': return 'Создано';
      case 'CONFIRMED': return 'Подтверждено';
      case 'COMPLETED': return 'Завершено';
      case 'CANCELLED': return 'Отменено';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATED': return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED': return 'bg-green-100 text-green-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400 mt-1">Роль: {user?.role}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowMessageForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FaHeadset /> Написать менеджеру
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b flex">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'bookings' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <FaCalendarAlt /> Мои бронирования ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'reviews' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <FaStar /> Мои отзывы ({reviews.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'bookings' && (
              <div>
                {bookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>У вас пока нет бронирований</p>
                    <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">Перейти к событиям</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(booking.status)}
                              <h3 className="font-semibold text-lg">{booking.Event?.title || 'Событие'}</h3>
                            </div>
                            <p className="text-gray-500 text-sm">Номер: {booking.bookingNumber}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                              <div><span className="text-gray-500">Дата:</span><p className="font-medium">{new Date(booking.eventDate).toLocaleDateString()}</p></div>
                              <div><span className="text-gray-500">Участников:</span><p className="font-medium">{booking.participants}</p></div>
                              <div><span className="text-gray-500">Сумма:</span><p className="font-bold text-blue-600">{booking.totalPrice} ₽</p></div>
                              <div><span className="text-gray-500">Статус:</span><p><span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${getStatusColor(booking.status)}`}>{getStatusText(booking.status)}</span></p></div>
                            </div>
                            {booking.specialRequests && <div className="mt-2 text-sm"><span className="text-gray-500">Пожелания:</span><p className="text-gray-600">{booking.specialRequests}</p></div>}
                            {booking.cancellationReason && <div className="mt-2 text-sm"><span className="text-gray-500">Причина отмены:</span><p className="text-red-600">{booking.cancellationReason}</p></div>}
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            {booking.status === 'CREATED' && (
                              <button onClick={() => { setCancelBookingId(booking.id); setShowCancelModal(true); }} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 whitespace-nowrap">
                                Отменить
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>У вас пока нет отзывов</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div><h3 className="font-semibold">{review.eventTitle}</h3><div className="flex items-center gap-1 my-2">{[...Array(5)].map((_, i) => (<FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />))}</div><p className="text-gray-600">{review.comment}</p><p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p></div>
                          <div><span className={`px-2 py-1 rounded text-xs ${review.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{review.approved ? 'Опубликован' : 'На модерации'}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReviewForm && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Оставить отзыв</h3>
            <div className="mb-4"><label className="block text-sm font-medium mb-2">Оценка</label><div className="flex gap-2">{[...Array(5)].map((star) => (<button key={star} type="button" onClick={() => setReviewRating(star)} className="text-2xl"><FaStar className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'} /></button>))}</div></div>
            <div className="mb-4"><label className="block text-sm font-medium mb-2">Комментарий</label><textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows="4" className="w-full border rounded-lg px-3 py-2" placeholder="Поделитесь впечатлениями..." /></div>
            <div className="flex gap-2"><button onClick={submitReview} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex-1">Отправить</button><button onClick={() => setShowReviewForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Отмена</button></div>
          </div>
        </div>
      )}

      {showMessageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Написать менеджеру</h3>
            <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows="5" className="w-full border rounded-lg px-3 py-2 mb-4" placeholder="Напишите ваш вопрос..." />
            <div className="flex gap-2"><button onClick={sendMessageToManager} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex-1"><FaPaperPlane className="inline mr-2" /> Отправить</button><button onClick={() => setShowMessageForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Отмена</button></div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Отмена бронирования</h3>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows="3" className="w-full border rounded-lg px-3 py-2 mb-4" placeholder="Причина отмены..." />
            <div className="flex gap-2"><button onClick={cancelBooking} className="bg-red-500 text-white px-4 py-2 rounded-lg flex-1">Подтвердить отмену</button><button onClick={() => setShowCancelModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg flex-1">Назад</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
