import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaStar, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, events: 0, reviews: 0 });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'ADMIN') {
      toast.error('Доступ запрещен');
      navigate('/');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/events')
      ]);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
      setStats({
        users: usersRes.data.length,
        events: eventsRes.data.length,
        reviews: 0
      });
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateUserRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('Роль обновлена');
      loadData();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('Удалить событие?')) {
      try {
        await api.delete(`/admin/events/${eventId}`);
        toast.success('Событие удалено');
        loadData();
      } catch (error) {
        toast.error('Ошибка удаления');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">👑 Админ панель</h1>
            <p className="text-blue-100">Управление системой</p>
          </div>
          <button onClick={handleLogout} className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30">
            <FaSignOutAlt className="inline mr-2" /> Выйти
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Пользователи</p>
                <p className="text-3xl font-bold">{stats.users}</p>
              </div>
              <FaUsers className="text-4xl text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">События</p>
                <p className="text-3xl font-bold">{stats.events}</p>
              </div>
              <FaCalendarAlt className="text-4xl text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Отзывы</p>
                <p className="text-3xl font-bold">{stats.reviews}</p>
              </div>
              <FaStar className="text-4xl text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b flex">
            <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-medium ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>
              👥 Пользователи
            </button>
            <button onClick={() => setActiveTab('events')} className={`px-6 py-3 font-medium ${activeTab === 'events' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}>
              🎫 События
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Имя</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Роль</th>
                      <th className="px-4 py-2 text-left">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-t">
                        <td className="px-4 py-2">{user.id}</td>
                        <td className="px-4 py-2">{user.firstName} {user.lastName}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'SELLER' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <select onChange={(e) => updateUserRole(user.id, e.target.value)} value={user.role} className="border rounded px-2 py-1 text-sm">
                            <option value="USER">Пользователь</option>
                            <option value="SELLER">Продавец</option>
                            <option value="MANAGER">Менеджер</option>
                            <option value="ADMIN">Админ</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="grid gap-4">
                {events.map(event => (
                  <div key={event.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-gray-600">{event.price} ₽</p>
                    </div>
                    <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-700">
                      🗑️ Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
// Добавьте компонент галереи в админ панель
const ImageGallery = ({ images, onDelete, onSetPreview }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {images.map((img, idx) => (
        <div key={idx} className="relative group">
          <img src={img.optimizedUrl} alt={`Image ${idx}`} className="w-full h-32 object-cover rounded" />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button onClick={() => onSetPreview(idx)} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Главное</button>
            <button onClick={() => onDelete(idx)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Удалить</button>
          </div>
        </div>
      ))}
    </div>
  );
};
