import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaUpload, FaTimes, FaStar, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';
import { REGIONS, SEASONS, CATEGORIES } from '../data/regions';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [form, setForm] = useState({
    title: '', shortDescription: '', fullDescription: '', price: '', priceInfo: '',
    address: '', region: '', latitude: '', longitude: '',
    startDate: '', endDate: '', durationDays: 1, maxParticipants: 10,
    category: 'Другое', season: 'Любое', previewImage: '', images: []
  });

  const searchByAddress = async () => {
    if (!searchAddress.trim()) return;
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setForm(prev => ({ ...prev, latitude: parseFloat(lat).toFixed(6), longitude: parseFloat(lon).toFixed(6), address: display_name }));
        toast.success('Адрес найден');
      } else { toast.error('Адрес не найден'); }
    } catch { toast.error('Ошибка'); } finally { setGeocoding(false); }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const fd = new FormData(); fd.append('image', file);
      try { const res = await api.post('/upload/temp', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); urls.push(res.data.url || res.data.path); } catch { toast.error(`Ошибка: ${file.name}`); }
    }
    setForm(prev => ({ ...prev, images: [...prev.images, ...urls], previewImage: prev.previewImage || urls[0] || '' }));
    setUploading(false);
    toast.success(`Загружено ${urls.length} фото`);
  };

  const removeImage = (i) => setForm(prev => {
    const newImages = prev.images.filter((_, idx) => idx !== i);
    return { ...prev, images: newImages, previewImage: prev.previewImage === prev.images[i] ? (newImages[0] || '') : prev.previewImage };
  });

  const setAsPreview = (url) => { setForm(prev => ({ ...prev, previewImage: url })); toast.success('Обложка выбрана'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) { toast.error('Название и цена обязательны'); return; }
    const now = new Date();
    if (form.startDate && new Date(form.startDate) < now) { toast.error('Дата начала не может быть в прошлом'); return; }
    if (form.endDate && new Date(form.endDate) < now) { toast.error('Дата окончания не может быть в прошлом'); return; }
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) { toast.error('Дата окончания позже даты начала'); return; }
    try {
      await api.post('/events', { ...form, price: parseFloat(form.price), latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null, durationDays: parseInt(form.durationDays), maxParticipants: parseInt(form.maxParticipants) });
      toast.success('Событие создано!'); navigate('/seller');
    } catch { toast.error('Ошибка создания'); }
  };

  const ic = "w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-purple-400 focus:outline-none transition";
  const lc = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50"><Header /><div className="container mx-auto px-4 py-8 max-w-3xl"><button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-700 text-sm"><FaArrowLeft /> Назад</button><h1 className="text-2xl font-bold mb-6">Создание события</h1>
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
      <div><label className={lc}>Название *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={ic} required /></div>
      <div className="grid grid-cols-2 gap-4"><div><label className={lc}>Категория</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={ic}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div><div><label className={lc}>Сезон</label><select value={form.season} onChange={e => setForm({...form, season: e.target.value})} className={ic}>{SEASONS.map(s => <option key={s}>{s}</option>)}</select></div></div>
      <div><label className={lc}>Краткое описание</label><input value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} className={ic} /></div>
      <div><label className={lc}>Полное описание</label><textarea rows="4" value={form.fullDescription} onChange={e => setForm({...form, fullDescription: e.target.value})} className={ic} /></div>
      <div className="grid grid-cols-2 gap-4"><div><label className={lc}>Цена *</label><input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className={ic} required /></div><div><label className={lc}>Инфо о цене</label><input value={form.priceInfo} onChange={e => setForm({...form, priceInfo: e.target.value})} className={ic} placeholder="$ / за человека" /></div></div>
      <div><label className={lc}>Поиск адреса</label><div className="flex gap-2"><input value={searchAddress} onChange={e => setSearchAddress(e.target.value)} className={`${ic} flex-1`} placeholder="Введите адрес..." onKeyDown={e => e.key === 'Enter' && searchByAddress()} /><button type="button" onClick={searchByAddress} disabled={geocoding} className="px-4 py-2.5 bg-purple-500 text-white rounded-xl text-sm hover:bg-purple-600 disabled:opacity-50"><FaSearch /></button></div></div>
      <div className="grid grid-cols-2 gap-4"><div><label className={lc}>Широта</label><input value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} className={ic} placeholder="55.751244" /></div><div><label className={lc}>Долгота</label><input value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} className={ic} placeholder="37.618423" /></div></div>
      <div><label className={lc}>Адрес</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={ic} /></div>
      <div><label className={lc}>Регион</label><select value={form.region} onChange={e => setForm({...form, region: e.target.value})} className={ic}><option value="">Выберите</option>{REGIONS.map(r => <option key={r}>{r}</option>)}</select></div>
      <div className="grid grid-cols-3 gap-4"><div><label className={lc}>Дата начала</label><input type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className={ic} /></div><div><label className={lc}>Дата окончания</label><input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className={ic} /></div><div><label className={lc}>Длит. (дней)</label><input type="number" value={form.durationDays} onChange={e => setForm({...form, durationDays: parseInt(e.target.value)})} className={ic} /></div></div>
      <div><label className={lc}>Макс. участников</label><input type="number" value={form.maxParticipants} onChange={e => setForm({...form, maxParticipants: parseInt(e.target.value)})} className={`${ic} max-w-xs`} /></div>
      <div><label className={lc}>Фотографии</label><div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition cursor-pointer"><input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" /><label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2"><FaUpload className="text-gray-400 text-2xl" /><span className="text-sm text-gray-500">{uploading ? 'Загрузка...' : 'Нажмите для загрузки'}</span></label></div>
      {form.images.length > 0 && <div className="mt-4"><p className="text-sm font-medium mb-2">Загружено {form.images.length} фото</p><div className="grid grid-cols-4 gap-3">{form.images.map((url, i) => <div key={i} className="relative group"><img src={`http://localhost:5001${url}`} alt="" className={`w-full h-24 object-cover rounded-lg ${form.previewImage === url ? 'ring-2 ring-purple-500' : ''}`} /><div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2"><button type="button" onClick={() => setAsPreview(url)} className={`p-1.5 rounded-full ${form.previewImage === url ? 'bg-yellow-500 text-white' : 'bg-white'}`}><FaStar className="text-xs" /></button><button type="button" onClick={() => removeImage(i)} className="p-1.5 bg-red-500 text-white rounded-full"><FaTimes className="text-xs" /></button></div>{form.previewImage === url && <span className="absolute top-1 left-1 bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">Обложка</span>}</div>)}</div></div>}</div>
      <button type="submit" disabled={uploading} className="w-full bg-purple-500 text-white py-3 rounded-xl font-medium hover:bg-purple-600 transition disabled:opacity-50"><FaSave className="inline mr-2" /> Создать событие</button>
    </form></div></div>
  );
};

export default CreateEventPage;
