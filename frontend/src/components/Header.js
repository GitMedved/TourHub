import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaHome, FaStore, FaCrown, FaMapMarkerAlt, FaUserTie, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Вы вышли из системы');
    navigate('/');
    window.location.reload();
  };

  const getRoleLink = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') return { path: '/admin', label: 'Админ панель', icon: <FaCrown /> };
    if (user.role === 'SELLER') return { path: '/seller', label: 'Кабинет продавца', icon: <FaStore /> };
    if (user.role === 'MANAGER') return { path: '/manager', label: 'Кабинет менеджера', icon: <FaUserTie /> };
    return null;
  };

  const roleLink = getRoleLink();

  return (
    <header className="bg-white shadow-md z-50 px-6 py-3 flex items-center justify-between">
      {/* Логотип - ссылка на главную */}
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
        <FaMapMarkerAlt className="text-blue-500 text-2xl" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          TravelHub
        </h1>
      </Link>
      
      {/* Навигация */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Имя пользователя */}
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user.firstName} {user.lastName}
              </span>
            </div>
            
            {/* Главная */}
            <Link to="/" className="text-gray-600 hover:text-blue-500 transition flex items-center gap-2">
              <FaHome /> Главная
            </Link>
            
            {/* Ролевая ссылка (кабинет продавца/менеджера/админа) */}
            {roleLink && (
              <Link to={roleLink.path} className="text-gray-600 hover:text-blue-500 transition flex items-center gap-2">
                {roleLink.icon} {roleLink.label}
              </Link>
            )}
            
            {/* Профиль */}
            <Link to="/profile" className="text-gray-600 hover:text-blue-500 transition flex items-center gap-2">
              <FaUser /> Профиль
            </Link>
            
            {/* Выход */}
            <button onClick={handleLogout} className="text-gray-600 hover:text-red-500 transition flex items-center gap-2">
              <FaSignOutAlt /> Выход
            </button>
          </>
        ) : (
          <>
            {/* Главная для неавторизованных */}
            <Link to="/" className="text-gray-600 hover:text-blue-500 transition flex items-center gap-2">
              <FaHome /> Главная
            </Link>
            
            {/* Вход */}
            <Link to="/login" className="text-gray-600 hover:text-blue-500 transition flex items-center gap-2">
              <FaSignInAlt /> Вход
            </Link>
            
            {/* Регистрация */}
            <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
              <FaUserPlus /> Регистрация
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
