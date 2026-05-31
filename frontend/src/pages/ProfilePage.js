import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaHeadset, FaStar, FaCalendarCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useLanguage } from '../i18n';

const CANCEL_REASONS = [
  'Планы изменились', 'Нашёл более выгодное предложение', 'Не подходит дата',
  'Проблемы со здоровьем', 'Финансовые трудности', 'Не устроили условия', 'Другое'
];

const STATUS_CONFIG = {
  CREATED:           { label: 'Ожидает',     color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED:         { label: 'Подтверждено', color: 'bg-blue-100 text-blue-700' },
  COMPLETED:         { label: 'Завершено',    color: 'bg-green-100 text-green-700' },
  CANCELLED_BY_USER: { label: 'Отменено вами', color: 'bg-red-100 text-red-700' },
  CANCELLED_BY_SELLER: { label: 'Отменено продавцом', color: 'bg-red-100 text-red-700' },
};

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(s => (
      <button key={s} type="button" onClick={() => onChange(s)}
        className={`text-2xl transition ${s <= value ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}>
        ★
      </button>
    ))}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>
      {children}
    </div>
  </div>
);

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [cancelModal, setCancelModal] = useState({ open: false, id: null, reason: '' });
  const [reviewModal, setReviewModal] = useState({ open: false, id: null, eventRating: 5, sellerRating: 5, comment: '' });
  const { language, t } = useLanguage();

  useEffect(() => {
    try { setUser(JSON.parse(localStorage.getItem('user'))); } catch { setUser(null); }
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const r = await api.get('/bookings/my');
      setBookings(r.data.content || r.data || []);
    } catch { toast.error('Ошибка загрузки бронирований'); }
    finally { setLoading(false); }
  };

  const cancelBooking = async () => {
    if (!cancelModal.reason) { toast.error('Выберите причину'); return; }
    try {
      await api.put(`/bookings/${cancelModal.id}/cancel`, { reason: cancelModal.reason });
      toast.success('Бронирование отменено');
      setCancelModal({ open: false, id: null, reason: '' });
      loadBookings();
    } catch { toast.error('Ошибка отмены'); }
  };

  const completeBooking = async (id) => {
    try {
      await api.put(`/bookings/${id}/complete`);
      toast.success('Статус изменён на "Завершено"');
      loadBookings();
    } catch { toast.error('Ошибка'); }
  };

  const submitReview = async () => {
    if (!reviewModal.comment.trim()) { toast.error('Напишите отзыв'); return; }
    try {
      await api.post(`/bookings/${reviewModal.id}/review`, {
        eventRating: reviewModal.eventRating,
        sellerRating: reviewModal.sellerRating,
        comment: reviewModal.comment
      });
      toast.success('Отзыв отправлен на модерацию');
      setReviewModal({ open: false, id: null, eventRating: 5, sellerRating: 5, comment: '' });
      loadBookings();
    } catch (err) { toast.error(err.message || 'Ошибка'); }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) { toast.error('Введите сообщение'); return; }
    try {
      await api.post('/messages/to-manager', { message: messageText });
      toast.success('Сообщение отправлено');
      setShowMessageModal(false); setMessageText('');
    } catch { toast.error('Ошибка отправки'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl text-white font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">{t.profile.traveler}</span>
              </div>
            </div>
            <button
              onClick={() => setShowMessageModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-sm font-medium hover:bg-blue-100 transition"
            >
              <FaHeadset /> {t.profile.messageManager}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: t.profile.total, value: bookings.length, icon: '🎫' },
            { label: t.profile.active, value: bookings.filter(b => ['CREATED','CONFIRMED'].includes(b.status)).length, icon: '⏳' },
            { label: t.profile.completed, value: bookings.filter(b => b.status === 'COMPLETED').length, icon: '✅' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            <h3 className="font-bold">{t.profile.bookings}</h3>
            <span className="ml-auto text-sm text-gray-400">{bookings.length}</span>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🗺️</div>
              <p className="text-gray-500 mb-2">{t.profile.noBookings}</p>
              <Link to="/events" className="text-blue-600 text-sm hover:underline">{t.profile.findTour}</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bookings.map(b => {
                const status = STATUS_CONFIG[b.status] || { label: b.status, color: 'bg-gray-100 text-gray-700' };
                return (
                  <div key={b.id} className="p-5 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-400">#{b.bookingNumber}</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 truncate">
                          {b.event?.title || b.Event?.title || `Бронирование #${b.id}`}
                        </h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                          <span>📅 {new Date(b.eventDate).toLocaleDateString(language === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <span>👥 {b.participants} {t.profile.people}</span>
                          <span className="font-semibold text-blue-600">
                            {parseFloat(b.totalPrice || 0).toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                        {b.cancellationReason && (
                          <p className="text-xs text-red-500 mt-1">{t.profile.reason}: {b.cancellationReason}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {b.id && (
                          <Link
                            to={`/chat/${b.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs font-medium hover:bg-blue-100 transition"
                          >
                            💬 {t.nav.support}
                          </Link>
                        )}
                        {b.status === 'CREATED' && (
                          <button
                            onClick={() => setCancelModal({ open: true, id: b.id, reason: '' })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-medium hover:bg-red-100 transition"
                          >
                            <FaTimes /> {t.profile.cancel}
                          </button>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => completeBooking(b.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-medium hover:bg-green-100 transition"
                          >
                            <FaCalendarCheck /> {t.profile.complete}
                          </button>
                        )}
                        {b.status === 'COMPLETED' && (
                          <button
                            onClick={() => setReviewModal({ open: true, id: b.id, eventRating: 5, sellerRating: 5, comment: '' })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full text-xs font-medium hover:bg-yellow-100 transition"
                          >
                            <FaStar /> {t.profile.review}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {cancelModal.open && (
        <Modal title={t.profile.cancellationReason} onClose={() => setCancelModal({ open: false, id: null, reason: '' })}>
          <select
            value={cancelModal.reason}
            onChange={e => setCancelModal(p => ({ ...p, reason: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t.profile.chooseReason}</option>
            {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={cancelBooking} disabled={!cancelModal.reason}
              className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50">
              {t.profile.confirmCancel}
            </button>
            <button onClick={() => setCancelModal({ open: false, id: null, reason: '' })}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
              {t.profile.back}
            </button>
          </div>
        </Modal>
      )}

      {reviewModal.open && (
        <Modal title={t.profile.leaveReview} onClose={() => setReviewModal({ open: false, id: null, eventRating: 5, sellerRating: 5, comment: '' })}>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t.profile.eventRating}</p>
              <StarRating value={reviewModal.eventRating} onChange={v => setReviewModal(p => ({ ...p, eventRating: v }))} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">{t.profile.sellerRating}</p>
              <StarRating value={reviewModal.sellerRating} onChange={v => setReviewModal(p => ({ ...p, sellerRating: v }))} />
            </div>
            <textarea
              value={reviewModal.comment}
              onChange={e => setReviewModal(p => ({ ...p, comment: e.target.value }))}
              rows="4"
              placeholder={t.profile.reviewPlaceholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={submitReview}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition">
                {t.profile.sendReview}
              </button>
              <button onClick={() => setReviewModal({ open: false, id: null, eventRating: 5, sellerRating: 5, comment: '' })}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
                {t.profile.cancel}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showMessageModal && (
        <Modal title={t.profile.writeManager} onClose={() => setShowMessageModal(false)}>
          <textarea
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            rows="5"
            placeholder={t.profile.messagePlaceholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
          />
          <div className="flex gap-2">
            <button onClick={sendMessage}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              {t.profile.send}
            </button>
            <button onClick={() => setShowMessageModal(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
              {t.profile.cancel}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfilePage;
