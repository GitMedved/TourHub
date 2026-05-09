import React, { useState, useEffect } from 'react';

const phrases = [
  'Ищем лучшие маршруты',
  'Планируем приключения',
  'Прокладываем тропы',
  'Собираем чемоданы',
  'Подбираем идеальные события',
  'Ищем скрытые жемчужины',
  'Готовим красивые места',
  'Пакуем снаряжение',
  'Разбиваем лагерь',
  'Настраиваем компас',
  'Встречаем рассвет',
  'Поднимаемся в горы',
];

const MountainIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16">
    <defs>
      <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <polygon points="50,15 90,85 10,85" fill="url(#mountainGrad)" opacity="0.9" />
    <polygon points="50,15 75,85 25,85" fill="white" opacity="0.2" />
    <circle cx="50" cy="15" r="5" fill="white" opacity="0.5" />
  </svg>
);

const CompassIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16">
    <circle cx="50" cy="50" r="45" fill="none" stroke="url(#mountainGrad)" strokeWidth="2" />
    <polygon points="50,15 40,50 50,45" fill="#3B82F6" />
    <polygon points="50,85 60,50 50,55" fill="#8B5CF6" />
    <circle cx="50" cy="50" r="3" fill="white" />
  </svg>
);

const SuitcaseIcon = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16">
    <rect x="25" y="35" width="50" height="45" rx="5" fill="url(#mountainGrad)" />
    <rect x="35" y="20" width="30" height="20" rx="3" fill="url(#mountainGrad)" opacity="0.7" />
    <rect x="40" y="50" width="20" height="15" rx="2" fill="white" opacity="0.3" />
  </svg>
);

const icons = [MountainIcon, CompassIcon, SuitcaseIcon];

const LoadingScreen = ({ text = 'Загрузка' }) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const phraseTimer = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length);
      setIconIndex(prev => (prev + 1) % icons.length);
    }, 3000);
    
    const dotsTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(phraseTimer);
      clearInterval(dotsTimer);
    };
  }, []);

  const CurrentIcon = icons[iconIndex];

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="relative mb-8">
        <div className="absolute inset-0 w-24 h-24 border-4 border-blue-200 rounded-full animate-spin" 
             style={{ animationDuration: '3s' }} />
        <div className="absolute inset-2 w-20 h-20 border-4 border-purple-300 rounded-full animate-spin" 
             style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
        <div className="relative w-24 h-24 flex items-center justify-center">
          <CurrentIcon />
        </div>
      </div>

      <div className="text-center max-w-sm px-4">
        <p className="text-lg font-medium text-gray-700 mb-2 animate-fade-in" key={phraseIndex}>
          {phrases[phraseIndex]}
        </p>
        <span className="text-sm text-gray-400 inline-block w-24">
          {text}{dots}
        </span>
      </div>

      <div className="mt-8 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-progress"
             style={{ backgroundSize: '200% 100%' }} />
      </div>

      <div className="mt-6 flex gap-1.5">
        {phrases.map((_, i) => (
          <div key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === phraseIndex ? 'bg-blue-500 w-6' : 'bg-gray-200'
            }`} />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
