import React from 'react';
import { FaTelegramPlane, FaMoon, FaSun } from 'react-icons/fa';
import Header from '../components/Header';
import { useLanguage } from '../i18n';
import { useTheme } from '../theme';

const SettingsPage = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Настройки</h1>
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t.language}</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="ru">{t.russian}</option>
              <option value="en">{t.english}</option>
            </select>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Режим</p>
            <div className="flex gap-2">
              <button onClick={() => setTheme('day')} className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${theme==='day'?'bg-blue-50 border-blue-400':'bg-white'}`}><FaSun /> Дневной</button>
              <button onClick={() => setTheme('night')} className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${theme==='night'?'bg-blue-50 border-blue-400':'bg-white'}`}><FaMoon /> Ночной</button>
            </div>
          </div>
          <div>
            <a href={process.env.REACT_APP_TELEGRAM_BOT_LINK || 'https://t.me/your_bot'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg">
              <FaTelegramPlane /> Перейти в Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
