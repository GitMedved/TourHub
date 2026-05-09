import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaChartBar, FaCalendarAlt, 
  FaDollarSign, FaUsers, FaChartLine, FaStar, FaBox,
  FaTimes, FaCheck, FaEye, FaStore 
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const SalesChart = ({ bookings }) => {
  const [metric, setMetric] = useState('revenue');
  
  const metrics = {
    revenue: { label: 'Доход', color: '#3B82F6', icon: FaDollarSign, getValue: () => 
      bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0) },
    bookings: { label: 'Бронирования', color: '#10B981', icon: FaBox, getValue: () => bookings.length },
    completed: { label: 'Завершено', color: '#8B5CF6', icon: FaCheck, getValue: () => 
      bookings.filter(b => b.status === 'COMPLETED').length },
    cancelled: { label: 'Отказы', color: '#EF4444', icon: FaTimes, getValue: () => 
      bookings.filter(b => b.status === 'CANCELLED_BY_USER' || b.status === 'CANCELLED_BY_SELLER').length },
    rating: { label: 'Рейтинг', color: '#F59E0B', icon: FaStar, getValue: () => 
      bookings.length > 0 ? '4.5' : '0' },
  };

  const maxValue = Math.max(...Object.values(metrics).map(m => parseFloat(m.getValue()) || 0), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FaChartLine className="text-purple-500" />
        Статистика
      </h3>
      
      {/* Переключатели метрик */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(metrics).map(([key, m]) => (
          <button
            key={key}
            onClick={() => setMetric(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              metric === key 
                ? 'text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={metric === key ? { backgroundColor: m.color } : {}}
          >
            <m.icon />
            {m.label}
          </button>
        ))}
      </div>

      {/* График */}
      <div className="space-y-4">
        {Object.entries(metrics).map(([key, m]) => {
          const value = parseFloat(m.getValue()) || 0;
          const width = (value / maxValue) * 100;
          
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-24 text-sm text-gray-600 flex items-center gap-1">
                <m.icon style={{ color: m.color }} />
                {m.label}
              </span>
              <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 flex items-center px-3"
                  style={{ 
                    width: `${width}%`, 
                    backgroundColor: m.color,
                    opacity: metric === key ? 1 : 0.3
                  }}
                >
                  {width > 15 && (
                    <span className="text-white text-sm font-medium">
                      {m.getValue()}{key === 'revenue' ? ' ₽' : ''}
                    </span>
                  )}
                </div>
              </div>
              {width <= 15 && (
                <span className="text-sm text-gray-500">{value}{key === 'revenue' ? ' ₽' : ''}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', shortDescription: '', fullDescription: '', price: '',
    category: '', startDate: '', endDate: '', maxParticipants: '',
    address: '', region: '', season: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        api.get('/events/seller/my'),
        api.get('/bookings/seller')
      ]);
      setEvents(eventsRes.data?.content || eventsRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', formData);
      toast.success('Событие создано');
      setShowCreateForm(false);
      setFormData({ title: '', shortDescription: '', fullDescription: '', price: '', category: '', startDate: '', endDate: '', maxParticipants: '', address: '', region: '', season: '' });
      loadData();
    } catch (e) {
      toast.error('Ошибка создания');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/events/${editingEvent.id}`, formData);
      toast.success('Событие обновлено');
      setEditingEvent(null);
      loadData();
    } catch (e) {
      toast.error('Ошибка обновления');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить событие?')) {
      try {
        await api.delete(`/events/${id}`);
        toast.success('Событие удалено');
        loadData();
      } catch (e) {
        toast.error('Ошибка удаления');
      }
    }
  };

  const startEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      shortDescription: event.shortDescription || '',
      fullDescription: event.fullDescription || '',
      price: event.price || '',
      category: event.category || '',
      startDate: event.startDate?.split('T')[0] || '',
      endDate: event.endDate?.split('T')[0] || '',
      maxParticipants: event.maxParticipants || '',
      address: event.address || '',
      region: event.region || '',
      season: event.season || ''
    });
  };

  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Заголовок */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <FaStore className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Кабинет продавца</h1>
            <p className="text-gray-500 text-sm">{events.length} событий · {bookings.length} бронирований</p>
          </div>
        </div>

        {/* Сводка */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Доход', value: `${totalRevenue.toLocaleString()} ₽`, icon: FaDollarSign, color: 'text-green-500' },
            { label: 'Событий', value: events.length, icon: FaCalendarAlt, color: 'text-blue-500' },
            { label: 'Бронирований', value: bookings.length, icon: FaBox, color: 'text-purple-500' },
            { label: 'Завершено', value: bookings.filter(b => b.status === 'COMPLETED').length, icon: FaCheck, color: 'text-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={stat.color} />
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Вкладки */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'events', label: 'Мои события', icon: FaCalendarAlt },
            { key: 'stats', label: 'Статистика', icon: FaChartBar },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
          
          <button
            onClick={() => { setShowCreateForm(true); setEditingEvent(null); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition ml-auto"
          >
            <FaPlus /> Создать событие
          </button>
        </div>

        {/* Контент вкладок */}
        {activeTab === 'events' && (
          <div>
            {/* Форма создания/редактирования */}
            {(showCreateForm || editingEvent) && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingEvent ? 'Редактирование события' : 'Создание события'}
                </h3>
                <form onSubmit={editingEvent ? handleEdit : handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Название *</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                      className="w-full border rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Категория</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2">
                      <option value="">Выбрать</option>
                      <option value="Экскурсии">Экскурсии</option>
                      <option value="Туры">Туры</option>
                      <option value="Активный отдых">Активный отдых</option>
                      <option value="Культура">Культура</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Цена *</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Участников</label>
                    <input type="number" value={formData.maxParticipants} onChange={e => setFormData({...formData, maxParticipants: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Дата начала</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Дата окончания</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Адрес</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Регион</label>
                    <input type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Краткое описание</label>
                    <textarea value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2" rows="2" />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600">
                      {editingEvent ? 'Сохранить' : 'Создать'}
                    </button>
                    <button type="button" onClick={() => { setShowCreateForm(false); setEditingEvent(null); }}
                      className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-300">
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Список событий */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(event => (
                <div key={event.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
                  <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-3 flex items-center justify-center text-white text-2xl overflow-hidden">
                    {event.previewImage ? (
                      <img src={`http://localhost:5001${event.previewImage}`} alt="" className="w-full h-full object-cover" />
                    ) : '🏔️'}
                  </div>
                  <h4 className="font-semibold line-clamp-2 mb-2">{event.title}</h4>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span>{parseFloat(event.price).toLocaleString()} ₽</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      event.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' : 
                      event.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {event.moderationStatus === 'approved' ? 'Одобрено' : event.moderationStatus === 'rejected' ? 'Отклонено' : 'На модерации'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(event)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm hover:bg-blue-100">
                      <FaEdit /> Ред.
                    </button>
                    <button onClick={() => handleDelete(event.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm hover:bg-red-100">
                      <FaTrash /> Уд.
                    </button>
                    <Link to={`/event/${event.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm hover:bg-gray-100">
                      <FaEye /> Смотр.
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            {events.length === 0 && !showCreateForm && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-4">📅</div>
                <p className="text-lg">Нет событий</p>
                <button onClick={() => setShowCreateForm(true)}
                  className="mt-4 text-blue-500 hover:underline">
                  Создать первое событие
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <SalesChart bookings={bookings} />
            
            {/* Последние бронирования */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Последние бронирования</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3">Событие</th>
                      <th className="pb-3">Клиент</th>
                      <th className="pb-3">Сумма</th>
                      <th className="pb-3">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="py-3">{b.Event?.title || b.event?.title || '-'}</td>
                        <td className="py-3">{b.User?.firstName || b.user?.firstName || '-'}</td>
                        <td className="py-3 font-medium">{parseFloat(b.totalPrice || 0).toLocaleString()} ₽</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            b.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                            b.status?.includes('CANCELLED') ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {b.status === 'COMPLETED' ? 'Завершено' :
                             b.status === 'CONFIRMED' ? 'Подтверждено' :
                             b.status?.includes('CANCELLED') ? 'Отменено' : b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
