import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaSignOutAlt, FaStore, FaUserTie, FaCrown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Вы вышли из системы');
    navigate('/');
    window.location.reload();
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') return { path: '/admin', label: 'Админ панель', icon: <FaCrown className="text-lg" /> };
    if (user.role === 'SELLER') return { path: '/seller', label: 'Кабинет продавца', icon: <FaStore className="text-lg" /> };
    if (user.role === 'MANAGER') return { path: '/manager', label: 'Панель управления', icon: <FaUserTie className="text-lg" /> };
    return null;
  };

  const dashboardLink = getDashboardLink();
  const isUser = user?.role === 'USER';

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaMapMarkerAlt className="text-white text-base" />
          </div>
          <h1 className="text-lg font-semibold text-gray-800 tracking-tight">TravelHub</h1>
        </Link>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isUser ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                    title="Выйти"
                  >
                    <FaSignOutAlt className="text-lg" />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  
                  
                  {dashboardLink && (
                    <Link to={dashboardLink.path} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition" title={dashboardLink.label}>
                      {dashboardLink.icon}
                    </Link>
                  )}
                  
                  <button 
                    onClick={handleLogout} 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                    title="Выйти"
                  >
                    <FaSignOutAlt className="text-lg" />
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-500 hover:text-blue-500 transition">Вход</Link>
              <Link to="/register" className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-600 transition">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
