import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaSearch, FaStar, FaMapMarkerAlt, FaCalendar, FaClock, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import api from '../services/api';
import { REGIONS, SEASONS, CATEGORIES } from '../data/regions';

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

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div></div>;

  const ic = "w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-blue-400 focus:outline-none";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6"><h1 className="text-2xl font-bold">🏔️ События</h1><p className="text-gray-500 text-sm">Найдено: {filteredEvents.length}</p></div>

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Поиск..." value={filters.title} onChange={(e) => setFilters({...filters, title: e.target.value})} className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm" /></div>
            <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${showFilters ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}><FaFilter /> Фильтры</button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
              <div><label className="text-xs text-gray-500 mb-1 block">Регион</label><select value={filters.region} onChange={(e) => setFilters({...filters, region: e.target.value})} className={ic}><option value="">Все</option>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Категория</label><select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})} className={ic}><option value="">Все</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Сезон</label><select value={filters.season} onChange={(e) => setFilters({...filters, season: e.target.value})} className={ic}>{SEASONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500 mb-1 block">Цена от</label><input type="number" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className={ic} /></div><div><label className="text-xs text-gray-500 mb-1 block">Цена до</label><input type="number" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className={ic} /></div></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Дата от</label><input type="date" value={filters.fromDate} onChange={(e) => setFilters({...filters, fromDate: e.target.value})} className={ic} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Дата до</label><input type="date" value={filters.toDate} onChange={(e) => setFilters({...filters, toDate: e.target.value})} className={ic} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Сортировка</label><div className="flex gap-1">
                <select value={filters.sortBy} onChange={(e) => setFilters({...filters, sortBy: e.target.value})} className={ic}><option value="rating">По рейтингу</option><option value="price">По цене</option><option value="startDate">По дате</option></select>
                <button onClick={() => setFilters({...filters, sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc'})} className="px-3 py-2 border-2 border-gray-200 rounded-xl"><FaSortAmountDown /></button>
              </div></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(event => (
            <Link to={`/event/${event.id}`} key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="h-44 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                {event.previewImage ? <img src={`http://localhost:5001${event.previewImage}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" /> : <div className="w-full h-full flex items-center justify-center text-white text-4xl">🏔️</div>}
                <div className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1 text-xs font-medium">${parseFloat(event.price).toFixed(0)}</div>
                {event.rating > 0 && (
                  <div className="absolute top-3 left-3 bg-yellow-400/90 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs font-medium text-white">
                    <FaStar className="text-[10px]" /> {parseFloat(event.rating).toFixed(1)}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">{event.title}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {event.region && <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">{event.region}</span>}
                  {event.category && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{event.category}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                  {event.address && <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-red-400" />{event.address.split(',')[0]}</span>}
                  {event.startDate && <span className="flex items-center gap-1"><FaCalendar className="text-blue-400" />{formatDate(event.startDate)}</span>}
                  {event.durationDays > 0 && <span className="flex items-center gap-1"><FaClock className="text-green-400" />{event.durationDays}д</span>}
                </div>
                {event.sellerCompanyName && <p className="text-xs text-gray-400 mt-2">{event.sellerCompanyName} {event.sellerRating > 0 && `★ ${parseFloat(event.sellerRating).toFixed(1)}`}</p>}
              </div>
            </Link>
          ))}
        </div>
        {filteredEvents.length === 0 && <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-4">🔍</div><p>Ничего не найдено</p></div>}
      </div>
    </div>
  );
};

export default EventsPage;
