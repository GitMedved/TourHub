import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaSignOutAlt, FaStore, FaUserTie, FaCrown, FaUser, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../i18n';

const ROLE_CONFIG = {
  ADMIN:   { path: '/admin', labelKey: 'admin', icon: <FaCrown />, color: 'from-red-500 to-pink-500' },
  SELLER:  { path: '/seller', labelKey: 'seller', icon: <FaStore />, color: 'from-purple-500 to-indigo-500' },
  MANAGER: { path: '/manager', labelKey: 'manager', icon: <FaUserTie />, color: 'from-teal-500 to-green-500' },
  USER:    { path: '/profile', labelKey: 'profile', icon: <FaUser />, color: 'from-blue-500 to-purple-500' },
};

const NAV_LINKS = [
  { path: '/events', labelKey: 'events' },
];

const Header = () => {
  const [user, setUser] = useState(null);
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    toast.success(t.toast.logout);
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

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === link.path
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              {t.nav[link.labelKey]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-gray-100 p-1 text-xs font-bold" aria-label={t.nav.lang}>
            {['ru', 'en'].map(code => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`rounded-full px-3 py-1 transition ${
                  language === code ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

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
                      {t.nav[roleConfig.labelKey]}
                    </Link>
                  )}

                  {user.role === 'USER' && (
                    <Link
                      to="/chat"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm transition"
                    >
                      <span>💬</span> {t.nav.support}
                    </Link>
                  )}

                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-500 text-sm transition"
                    >
                      <FaSignOutAlt /> {t.nav.logout}
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
                {t.nav.login}
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition shadow-sm"
              >
                {t.nav.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
