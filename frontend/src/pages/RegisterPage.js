import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { FaGoogle, FaTelegramPlane } from 'react-icons/fa';
import api from '../services/api';

const RegisterPage = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'USER' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Введите имя';
    if (!form.lastName.trim()) e.lastName = 'Введите фамилию';
    if (!form.email.trim()) e.email = 'Введите email';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Некорректный email';
    if (!form.password) e.password = 'Введите пароль';
    else if (form.password.length < 6) e.password = 'Минимум 6 символов';
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
      const { data } = await api.post('/auth/register', {
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: form.role
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));
      toast.success('Добро пожаловать в TourHub!');
      navigate(data.user.role === 'SELLER' ? '/seller' : '/');
    } catch (err) {
      toast.error(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TourHub
          </Link>
          <p className="text-gray-500 mt-2">Создайте аккаунт</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={set('firstName')}
                    placeholder="Имя"
                    className={`pl-10 pr-4 ${inputClass('firstName')}`}
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={set('lastName')}
                    placeholder="Фамилия"
                    className={`pl-10 pr-4 ${inputClass('lastName')}`}
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="Email"
                  className={`pl-10 pr-4 ${inputClass('email')}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Пароль (минимум 6 символов)"
                  className={`pl-10 pr-12 ${inputClass('password')}`}
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

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Я хочу:</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'USER', label: 'Искать туры', icon: '👤', desc: 'Бронировать и путешествовать' },
                  { value: 'SELLER', label: 'Продавать туры', icon: '🏪', desc: 'Размещать свои предложения' }
                ].map(opt => (
                  <label
                    key={opt.value}
                    className={`flex flex-col p-3 border-2 rounded-xl cursor-pointer transition ${
                      form.role === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={form.role === opt.value}
                      onChange={set('role')}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1">{opt.icon}</span>
                    <span className="font-medium text-sm text-gray-800">{opt.label}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Создаём аккаунт...</>
              ) : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            <button type="button" onClick={() => handleSocialAuth('google')} className="w-full border rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50"><FaGoogle /> Продолжить с Google</button>
            <button type="button" onClick={() => handleSocialAuth('telegram')} className="w-full border rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50"><FaTelegramPlane /> Продолжить через Telegram</button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
