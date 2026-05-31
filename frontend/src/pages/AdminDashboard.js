import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaStar, FaStore, FaTicketAlt, FaChartBar, FaTrash, FaSearch, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const ROLE_CONFIG = {
  ADMIN:   { label: 'Админ',    color: 'bg-red-100 text-red-700' },
  MANAGER: { label: 'Менеджер', color: 'bg-purple-100 text-purple-700' },
  SELLER:  { label: 'Продавец', color: 'bg-green-100 text-green-700' },
  USER:    { label: 'Пользователь', color: 'bg-blue-100 text-blue-700' },
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>{label}</span>
    </div>
    <div className="text-3xl font-bold text-gray-800">{value ?? '—'}</div>
  </div>
);

const AdminDashboard = () => {
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'ADMIN') { navigate('/'); return; }
    } catch { navigate('/'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, eventsRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/events'),
        api.get('/admin/stats').catch(() => ({ data: null }))
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      setStats(statsRes.data);
    } catch { toast.error('Ошибка загрузки'); }
    finally { setLoading(false); }
  };

  const updateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('Роль обновлена');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch { toast.error('Ошибка'); }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Удалить событие?')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      toast.success('Удалено');
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch { toast.error('Ошибка удаления'); }
  };

  const approveEvent = async (id) => {
    try {
      await api.post(`/admin/events/${id}/approve`);
      toast.success('Событие одобрено');
      loadData();
    } catch { toast.error('Ошибка'); }
  };

  const rejectEvent = async (id) => {
    try {
      await api.post(`/admin/events/${id}/reject`);
      toast.success('Событие отклонено');
      loadData();
    } catch { toast.error('Ошибка'); }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredEvents = events.filter(e => {
    if (!search) return true;
    return e.title?.toLowerCase().includes(search.toLowerCase());
  });

  const pendingEvents = events.filter(e => e.moderationStatus === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-sm">
            <FaShieldAlt className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Админ панель</h1>
            <p className="text-sm text-gray-500">Управление системой TourHub</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard icon="👥" label="Пользователи" value={stats?.users ?? users.length} color="bg-blue-100 text-blue-700" />
          <StatCard icon="🏪" label="Продавцы" value={stats?.sellers} color="bg-purple-100 text-purple-700" />
          <StatCard icon="🗺️" label="Туры" value={stats?.events ?? events.length} color="bg-green-100 text-green-700" />
          <StatCard icon="🎫" label="Бронирований" value={stats?.bookings} color="bg-amber-100 text-amber-700" />
          <StatCard icon="⏳" label="На модерации" value={pendingEvents} color="bg-red-100 text-red-700" />
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {[
            { key: 'users', label: 'Пользователи', icon: '👥', badge: users.length },
            { key: 'events', label: 'Туры', icon: '🗺️', badge: pendingEvents > 0 ? `${pendingEvents} новых` : events.length },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(''); setRoleFilter(''); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition ${
                tab === t.key ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}>
              {t.icon} {t.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                tab === t.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{t.badge}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={tab === 'users' ? 'Поиск по имени или email...' : 'Поиск по названию...'}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {tab === 'users' && (
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                <option value="">Все роли</option>
                {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Пользователь</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Текущая роль</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Изменить роль</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map(u => {
                    const rc = ROLE_CONFIG[u.role] || { label: u.role, color: 'bg-gray-100 text-gray-700' };
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-gray-400">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${rc.color}`}>{rc.label}</span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={u.role}
                            onChange={e => updateRole(u.id, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                          >
                            {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-2">👥</div>
                  <p>Пользователи не найдены</p>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredEvents.map(event => (
                <div key={event.id} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl overflow-hidden shrink-0">
                        {event.previewImage
                          ? <img src={`http://localhost:5001${event.previewImage}`} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">🏔️</div>}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            event.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                            event.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {event.moderationStatus === 'approved' ? '✓ Одобрено' :
                             event.moderationStatus === 'rejected' ? '✗ Отклонено' : '⏳ На модерации'}
                          </span>
                          <span className="text-xs text-gray-400">{event.Seller?.companyName}</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 truncate">{event.title}</h4>
                        <p className="text-sm text-blue-600 font-medium">{parseFloat(event.price).toLocaleString('ru-RU')} ₽</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {event.moderationStatus === 'pending' && (
                        <>
                          <button onClick={() => approveEvent(event.id)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition">
                            ✓ Одобрить
                          </button>
                          <button onClick={() => rejectEvent(event.id)}
                            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200 transition">
                            ✗ Отклонить
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteEvent(event.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p>Туры не найдены</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
