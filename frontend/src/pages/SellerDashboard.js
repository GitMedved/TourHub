import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaChartBar, FaCalendarAlt, FaUsers, FaStar, FaCheck, FaTimes, FaEye, FaStore, FaRubleSign } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { getAssetUrl } from '../config/api';
import Header from '../components/Header';

const CATEGORIES = [
  { value: 'active', label: 'Активный отдых' },
  { value: 'culture', label: 'Культура' },
  { value: 'beach', label: 'Пляжный отдых' },
  { value: 'gastronomy', label: 'Гастрономия' },
  { value: 'adventure', label: 'Приключения' },
  { value: 'romantic', label: 'Романтика' },
  { value: 'family', label: 'Семейный' },
  { value: 'wellness', label: 'Оздоровление' },
  { value: 'nightlife', label: 'Ночная жизнь' },
  { value: 'other', label: 'Другое' },
];

const STATUS_LABELS = {
  COMPLETED: { label: 'Завершено', color: 'bg-green-100 text-green-700' },
  CONFIRMED: { label: 'Подтверждено', color: 'bg-blue-100 text-blue-700' },
  CREATED: { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-700' },
  CANCELLED_BY_USER: { label: 'Отменено', color: 'bg-red-100 text-red-700' },
  CANCELLED_BY_SELLER: { label: 'Отменено', color: 'bg-red-100 text-red-700' },
};

const EMPTY_FORM = {
  title: '', shortDescription: '', fullDescription: '', price: '',
  category: 'other', startDate: '', endDate: '', maxParticipants: 10, address: ''
};

const EventForm = ({ initial, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = e => { e.preventDefault(); onSubmit(form); };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
      <h3 className="text-lg font-bold mb-5">{initial ? 'Редактирование тура' : 'Новый тур'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
          <input type="text" value={form.title} onChange={set('title')} required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Например: Тур по Золотому кольцу" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена (₽) *</label>
            <input type="number" min="0" value={form.price} onChange={set('price')} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Участников</label>
            <input type="number" min="1" value={form.maxParticipants} onChange={set('maxParticipants')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <select value={form.category} onChange={set('category')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
            <input type="date" value={form.startDate} onChange={set('startDate')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
            <input type="date" value={form.endDate} onChange={set('endDate')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Адрес / Место</label>
          <input type="text" value={form.address} onChange={set('address')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Москва, ул. Тверская, 1" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Краткое описание</label>
          <input type="text" value={form.shortDescription} onChange={set('shortDescription')} maxLength={500}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Одно предложение для карточки тура" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Полное описание</label>
          <textarea rows="4" value={form.fullDescription} onChange={set('fullDescription')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Подробное описание программы, что включено, условия..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50">
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {initial ? 'Сохранить' : 'Создать тур'}
          </button>
          <button type="button" onClick={onCancel}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};

const SellerDashboard = () => {
  const [tab, setTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [er, br] = await Promise.all([
        api.get('/events/seller/my'),
        api.get('/bookings/seller')
      ]);
      setEvents(er.data?.content || er.data || []);
      setBookings(br.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await api.post('/events', form);
      toast.success('Тур создан и отправлен на модерацию');
      setShowCreate(false); loadData();
    } catch { toast.error('Ошибка создания'); }
    finally { setFormLoading(false); }
  };

  const handleEdit = async (form) => {
    setFormLoading(true);
    try {
      await api.put(`/events/${editingEvent.id}`, form);
      toast.success('Тур обновлён');
      setEditingEvent(null); loadData();
    } catch { toast.error('Ошибка обновления'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить тур?')) return;
    try { await api.delete(`/events/${id}`); toast.success('Тур удалён'); loadData(); }
    catch { toast.error('Ошибка удаления'); }
  };

  const totalRevenue = bookings
    .filter(b => ['CONFIRMED','COMPLETED'].includes(b.status))
    .reduce((s, b) => s + parseFloat(b.totalPrice || 0), 0);

  const stats = [
    { label: 'Доход', value: `${totalRevenue.toLocaleString('ru-RU')} ₽`, icon: '💰', color: 'text-green-600' },
    { label: 'Туров', value: events.length, icon: '🗺️', color: 'text-blue-600' },
    { label: 'Бронирований', value: bookings.length, icon: '🎫', color: 'text-purple-600' },
    { label: 'Завершено', value: bookings.filter(b => b.status === 'COMPLETED').length, icon: '✅', color: 'text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-6xl">

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-sm">
            <FaStore className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Кабинет продавца</h1>
            <p className="text-sm text-gray-500">{events.length} туров · {bookings.length} бронирований</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {[
            { key: 'events', label: 'Мои туры', icon: '🗺️' },
            { key: 'bookings', label: 'Бронирования', icon: '🎫' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition ${
                tab === t.key ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
          <button
            onClick={() => { setShowCreate(true); setEditingEvent(null); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold hover:opacity-90 transition ml-auto shadow-sm"
          >
            <FaPlus /> Создать тур
          </button>
        </div>

        {tab === 'events' && (
          <div>
            {showCreate && !editingEvent && (
              <EventForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} loading={formLoading} />
            )}
            {editingEvent && (
              <EventForm
                initial={{
                  title: editingEvent.title || '',
                  shortDescription: editingEvent.shortDescription || '',
                  fullDescription: editingEvent.fullDescription || '',
                  price: editingEvent.price || '',
                  category: editingEvent.category || 'other',
                  startDate: editingEvent.startDate?.split('T')[0] || '',
                  endDate: editingEvent.endDate?.split('T')[0] || '',
                  maxParticipants: editingEvent.maxParticipants || 10,
                  address: editingEvent.address || ''
                }}
                onSubmit={handleEdit}
                onCancel={() => setEditingEvent(null)}
                loading={formLoading}
              />
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse">
                    <div className="h-36 bg-gray-200 rounded-t-2xl" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 && !showCreate ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <div className="text-5xl mb-4">🗺️</div>
                <p className="text-gray-500 mb-4">У вас пока нет туров</p>
                <button onClick={() => setShowCreate(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold hover:opacity-90 transition">
                  Создать первый тур
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(event => (
                  <div key={event.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden group">
                    <div className="h-36 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden relative">
                      {event.previewImage
                        ? <img src={getAssetUrl(event.previewImage)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-4xl">🏔️</div>}
                      <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${
                        event.moderationStatus === 'approved' ? 'bg-green-500 text-white' :
                        event.moderationStatus === 'rejected' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {event.moderationStatus === 'approved' ? '✓ Одобрено' :
                         event.moderationStatus === 'rejected' ? '✗ Отклонено' : '⏳ Модерация'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-800 line-clamp-2 mb-1">{event.title}</h4>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-blue-600 font-bold">{parseFloat(event.price).toLocaleString('ru-RU')} ₽</span>
                        {event.rating > 0 && (
                          <span className="flex items-center gap-1 text-xs text-yellow-600">
                            <FaStar /> {parseFloat(event.rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingEvent(event); setShowCreate(false); }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition">
                          <FaEdit /> Ред.
                        </button>
                        <button onClick={() => handleDelete(event.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition">
                          <FaTrash /> Удал.
                        </button>
                        <Link to={`/event/${event.id}`}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition">
                          <FaEye /> Смотр.
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold">Бронирования</h3>
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">🎫</div>
                <p>Бронирований пока нет</p>
              </div>
            ) : (
              <div className="divide-y">
                {bookings.map(b => {
                  const s = STATUS_LABELS[b.status] || { label: b.status, color: 'bg-gray-100 text-gray-700' };
                  return (
                    <div key={b.id} className="p-5 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                            <span className="text-xs text-gray-400">#{b.bookingNumber}</span>
                          </div>
                          <h4 className="font-semibold text-sm">{b.event?.title || b.Event?.title || '-'}</h4>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            <span>👤 {b.user?.firstName || b.User?.firstName || '-'} {b.user?.lastName || b.User?.lastName || ''}</span>
                            <span>📅 {new Date(b.eventDate).toLocaleDateString('ru-RU')}</span>
                            <span>👥 {b.participants} чел.</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-blue-600">{parseFloat(b.totalPrice || 0).toLocaleString('ru-RU')} ₽</p>
                          <p className="text-xs text-gray-400">{b.contactPhone || '-'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
