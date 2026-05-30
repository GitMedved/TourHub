import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaSearch, FaStar, FaMapMarkerAlt, FaCalendar, FaClock, FaFilter, FaSortAmountDown, FaMountain, FaCompass, FaUmbrellaBeach } from 'react-icons/fa';
import api from '../services/api';
import { getAssetUrl } from '../config/api';
import { REGIONS, SEASONS, CATEGORIES } from '../data/regions';
import Header from '../components/Header';

const fallbackImages = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80'
];

const highlights = [
  { icon: <FaMountain />, title: 'Горы', text: 'Маршруты с вау-видами' },
  { icon: <FaCompass />, title: 'Авторские туры', text: 'Проверенные гиды и планы' },
  { icon: <FaUmbrellaBeach />, title: 'Отдых', text: 'Море, wellness и гастро' }
];

const EventsPage = () => {
  const [filters, setFilters] = useState({
    title: '', region: '', category: '', season: '',
    minPrice: '', maxPrice: '', fromDate: '', toDate: '',
    sortBy: 'rating', sortDir: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => { const response = await api.get('/events'); return response.data; }
  });

  const filteredEvents = useMemo(() => {
    let events = data?.content || [];
    if (filters.title) events = events.filter(e => e.title?.toLowerCase().includes(filters.title.toLowerCase()));
    if (filters.region) events = events.filter(e => e.region === filters.region || e.address?.includes(filters.region));
    if (filters.category && filters.category !== 'Все') events = events.filter(e => e.category === filters.category);
    if (filters.season && filters.season !== 'Любое') events = events.filter(e => e.season === filters.season);
    if (filters.minPrice) events = events.filter(e => parseFloat(e.price) >= parseFloat(filters.minPrice));
    if (filters.maxPrice) events = events.filter(e => parseFloat(e.price) <= parseFloat(filters.maxPrice));
    if (filters.fromDate) events = events.filter(e => e.startDate && new Date(e.startDate) >= new Date(filters.fromDate));
    if (filters.toDate) events = events.filter(e => e.endDate && new Date(e.endDate) <= new Date(filters.toDate));

    events.sort((a, b) => {
      let valA = a[filters.sortBy];
      let valB = b[filters.sortBy];
      if (filters.sortBy === 'price') { valA = parseFloat(valA); valB = parseFloat(valB); }
      else if (filters.sortBy === 'rating') { valA = parseFloat(valA) || 0; valB = parseFloat(valB) || 0; }
      else if (filters.sortBy === 'startDate') { valA = valA ? new Date(valA).getTime() : 0; valB = valB ? new Date(valB).getTime() : 0; }
      return filters.sortDir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
    return events;
  }, [data, filters]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getImage = (event, index) => {
    if (event.previewImage) return getAssetUrl(event.previewImage);
    return fallbackImages[index % fallbackImages.length];
  };

  const ic = 'w-full border border-white/50 bg-white/80 rounded-xl px-3 py-2 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <section className="relative overflow-hidden bg-[#07111f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#38bdf8,transparent_28%),radial-gradient(circle_at_80%_10%,#a855f7,transparent_30%),linear-gradient(135deg,#07111f,#172554)]" />
        <img
          src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80"
          alt="Scenic travel landscape"
          className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen"
        />
        <div className="tourhub-aurora absolute -bottom-24 left-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="tourhub-reveal max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <FaCompass className="text-cyan-200" /> Подборка впечатлений
            </div>
            <h1 className="text-4xl font-black md:text-6xl">
              Найдите тур, который хочется сохранить в памяти
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Красивые маршруты, понятные фильтры и живые карточки помогают быстрее выбрать следующее путешествие.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="tourhub-reveal rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600">
                  {item.icon}
                </div>
                <h3 className="font-black">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="tourhub-reveal -mt-16 mb-8 rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur-xl md:p-5">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-950">Все туры</h2>
              <p className="text-sm text-gray-500">Найдено: {filteredEvents.length}</p>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${showFilters ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-gray-950 text-white hover:bg-blue-600'}`}>
              <FaFilter /> Фильтры
            </button>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, городу или идее поездки..."
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-4 pl-12 pr-4 text-sm shadow-inner focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {showFilters && (
            <div className="tourhub-reveal mt-4 grid grid-cols-2 gap-3 rounded-3xl bg-blue-50/60 p-4 md:grid-cols-4">
              <div><label className="mb-1 block text-xs font-bold text-gray-500">Регион</label><select value={filters.region} onChange={(e) => setFilters({ ...filters, region: e.target.value })} className={ic}><option value="">Все</option>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
              <div><label className="mb-1 block text-xs font-bold text-gray-500">Категория</label><select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className={ic}><option value="">Все</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="mb-1 block text-xs font-bold text-gray-500">Сезон</label><select value={filters.season} onChange={(e) => setFilters({ ...filters, season: e.target.value })} className={ic}>{SEASONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-2"><div><label className="mb-1 block text-xs font-bold text-gray-500">Цена от</label><input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} className={ic} /></div><div><label className="mb-1 block text-xs font-bold text-gray-500">Цена до</label><input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} className={ic} /></div></div>
              <div><label className="mb-1 block text-xs font-bold text-gray-500">Дата от</label><input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} className={ic} /></div>
              <div><label className="mb-1 block text-xs font-bold text-gray-500">Дата до</label><input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} className={ic} /></div>
              <div className="col-span-2 md:col-span-1"><label className="mb-1 block text-xs font-bold text-gray-500">Сортировка</label><div className="flex gap-1">
                <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} className={ic}><option value="rating">По рейтингу</option><option value="price">По цене</option><option value="startDate">По дате</option></select>
                <button onClick={() => setFilters({ ...filters, sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })} className="rounded-xl border border-white/60 bg-white/90 px-3 py-2 shadow-sm transition hover:bg-blue-600 hover:text-white"><FaSortAmountDown /></button>
              </div></div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-80 rounded-[2rem] bg-gradient-to-r from-gray-200 via-white to-gray-200 bg-[length:200%_100%] animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => (
              <Link to={`/event/${event.id}`} key={event.id} className="tourhub-reveal group overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-950/5 ring-1 ring-gray-100 transition duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-950/15">
                <div className="relative h-56 overflow-hidden">
                  <img src={getImage(event, index)} alt={event.title || 'Tour preview'} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-sm font-black text-gray-950 shadow-lg">
                    ${parseFloat(event.price || 0).toFixed(0)}
                  </div>
                  {event.rating > 0 && (
                    <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-white shadow-lg">
                      <FaStar className="text-[10px]" /> {parseFloat(event.rating).toFixed(1)}
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="line-clamp-2 text-xl font-black text-white transition group-hover:text-cyan-100">{event.title}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {event.region && <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">{event.region}</span>}
                    {event.category && <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">{event.category}</span>}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {event.address && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-red-400" />{event.address.split(',')[0]}</span>}
                    {event.startDate && <span className="flex items-center gap-1"><FaCalendar className="text-blue-400" />{formatDate(event.startDate)}</span>}
                    {event.durationDays > 0 && <span className="flex items-center gap-1"><FaClock className="text-green-400" />{event.durationDays}д</span>}
                  </div>
                  {event.sellerCompanyName && <p className="mt-4 border-t border-gray-100 pt-4 text-sm font-semibold text-gray-500">{event.sellerCompanyName} {event.sellerRating > 0 && `★ ${parseFloat(event.sellerRating).toFixed(1)}`}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && filteredEvents.length === 0 && <div className="rounded-[2rem] bg-white py-16 text-center text-gray-400 shadow-sm"><div className="mb-4 text-5xl">🔍</div><p className="font-semibold">Ничего не найдено</p></div>}
      </main>
    </div>
  );
};

export default EventsPage;
