import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaSignOutAlt, FaStore, FaUserTie, FaCrown, FaUser, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../i18n';

const ROLE_CONFIG = {
  ADMIN:   { path: '/admin',   label: 'Админ панель',      icon: <FaCrown />,   color: 'from-red-500 to-pink-500' },
  SELLER:  { path: '/seller',  label: 'Кабинет продавца',  icon: <FaStore />,   color: 'from-purple-500 to-indigo-500' },
  MANAGER: { path: '/manager', label: 'Панель управления', icon: <FaUserTie />, color: 'from-teal-500 to-green-500' },
  USER:    { path: '/profile', label: 'Профиль',           icon: <FaUser />,    color: 'from-blue-500 to-purple-500' },
};


const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const sync = () => {
      try { setUser(JSON.parse(localStorage.getItem('user'))); }
      catch { setUser(null); }
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    setMenuOpen(false);
    toast.success('Вы вышли из системы');
    navigate('/');
  };

  const roleConfig = user ? ROLE_CONFIG[user.role] : null;
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : '';

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
            <FaMapMarkerAlt className="text-white text-base" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TourHub
          </span>
        </Link>


        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition"
              >
                <div className={`w-7 h-7 bg-gradient-to-br ${roleConfig?.color} rounded-full flex items-center justify-center text-xs text-white font-semibold`}>
                  {initials}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.firstName}
                </span>
                <FaChevronDown className={`text-gray-400 text-xs transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="font-semibold text-gray-800 text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  {roleConfig && (
                    <Link
                      to={roleConfig.path}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm transition"
                    >
                      <span className="text-blue-500">{roleConfig.icon}</span>
                      {roleConfig.label}
                    </Link>
                  )}

                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm transition"
                  >
                    Настройки
                  </Link>

                  {user.role === 'USER' && (
                    <Link
                      to="/chat"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm transition"
                    >
                      <FaUserTie /> {t.supportChat}
                    </Link>
                  )}

                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 text-sm transition"
                    >
                      <FaSignOutAlt /> Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-blue-600 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition shadow-sm"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
