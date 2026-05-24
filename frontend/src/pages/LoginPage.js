import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { FaGoogle, FaTelegramPlane } from 'react-icons/fa';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Некорректный email';
    if (!password) e.password = 'Введите пароль';
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  const handleSocialAuth = async (provider) => {
    try {
      const payload = provider === 'google'
        ? { provider: 'google', email: `google_${Date.now()}@mail.com`, firstName: 'Google', lastName: 'User' }
        : { provider: 'telegram', telegramId: Date.now(), email: `telegram_${Date.now()}@mail.com`, firstName: 'Telegram', lastName: 'User' };
      const { data } = await api.post('/auth/social', payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));
      toast.success('Вход выполнен');
      navigate('/');
    } catch (err) {
      toast.error('Ошибка social auth');
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));
      toast.success(`Добро пожаловать, ${data.user.firstName}!`);
      const routes = { ADMIN: '/admin', SELLER: '/seller', MANAGER: '/manager' };
      navigate(routes[data.user.role] || '/');
    } catch (err) {
      toast.error(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TourHub
          </Link>
          <p className="text-gray-500 mt-2">Войдите в свой аккаунт</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Входим...</>
              ) : 'Войти'}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            <button type="button" onClick={() => handleSocialAuth('google')} className="w-full border rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50"><FaGoogle /> Продолжить с Google</button>
            <button type="button" onClick={() => handleSocialAuth('telegram')} className="w-full border rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50"><FaTelegramPlane /> Продолжить через Telegram</button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Зарегистрироваться
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 text-center mb-2">Тестовые аккаунты</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
              <span>👤 user@example.com</span><span>123456</span>
              <span>🏪 seller@example.com</span><span>seller123</span>
              <span>👑 manager@example.com</span><span>manager123</span>
              <span>🚀 admin@example.com</span><span>admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
