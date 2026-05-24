import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSave, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaImage,
  FaMoneyBillWave, FaClock, FaGlobe, FaMountain, FaInfoCircle,
  FaSearch, FaSpinner, FaCloudSun, FaTag, FaList, FaCheck
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Header from '../components/Header';

const CATEGORIES = {
  'Экскурсии': ['Городские', 'Исторические', 'Архитектурные', 'Гастрономические', 'Ночные'],
  'Активный отдых': ['Походы', 'Восхождения', 'Сплавы', 'Велотуры', 'Лыжи/Сноуборд', 'Дайвинг', 'Конные прогулки'],
  'Культура': ['Музеи', 'Выставки', 'Фестивали', 'Мастер-классы', 'Театры', 'Концерты'],
  'Природа': ['Заповедники', 'Национальные парки', 'Водопады', 'Пещеры', 'Озера', 'Горы'],
  'Экстрим': ['Прыжки с парашютом', 'Полет на воздушном шаре', 'Роупджампинг', 'Zipline', 'Скалолазание'],
  'Водный отдых': ['Яхтинг', 'Каякинг', 'Серфинг', 'Рыбалка', 'Круизы'],
  'События': ['Конференции', 'Спортивные', 'Праздники', 'Ярмарки', 'Выставки'],
  'Туры': ['Однодневные', 'Многодневные', 'Выходного дня', 'Индивидуальные', 'Групповые'],
  'Другое': []
};

const SEASONS = ['Лето', 'Осень', 'Зима', 'Весна', 'Всесезонно'];
const DIFFICULTY = ['Легкий', 'Средний', 'Сложный', 'Экстремальный'];
const LANGUAGES = ['Русский', 'English', '中文', 'Español', 'Deutsch', 'Français'];

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    shortDescription: '',
    fullDescription: '',
    price: '',
    priceInfo: '',
    maxParticipants: '',
    durationDays: '1',
    durationHours: '',
    startDate: '',
    endDate: '',
    season: '',
    difficulty: '',
    address: '',
    region: '',
    city: '',
    latitude: '',
    longitude: '',
    language: 'Русский',
    includes: '',
    excludes: '',
    requirements: '',
    meetingPoint: '',
    organizerNote: '',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');

  // Геокодинг адреса
  const geocodeAddress = async () => {
    if (!formData.address || formData.address.length < 5) return;
    
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1&countrycodes=ru`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const location = data[0];
        setFormData(prev => ({
          ...prev,
          latitude: location.lat,
          longitude: location.lon,
          region: location.state || location.region || prev.region,
          city: location.city || location.town || location.village || prev.city,
          address: location.display_name || prev.address
        }));
        toast.success('Адрес найден и координаты заполнены');
      } else {
        toast.error('Адрес не найден, проверьте написание');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Ошибка геокодинга');
    } finally {
      setGeocoding(false);
    }
  };

  // Автозаполнение региона при вводе города
  useEffect(() => {
    if (formData.address && formData.address.length > 5) {
      const timer = setTimeout(() => {
        geocodeAddress();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [formData.address]);

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'preview') {
        setPreviewImage(file);
        setPreviewUrl(reader.result);
      } else {
        setGallery(prev => [...prev, { file, url: reader.result }]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryImage = (index) => {
    setGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.price) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      // Добавляем все поля
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      // Загружаем изображения
      if (previewImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', previewImage);
        const uploadRes = await api.post('/upload', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        formDataToSend.append('previewImage', uploadRes.data.url || uploadRes.data.path);
      }

      await api.post('/events', formDataToSend);
      toast.success('Событие создано и отправлено на модерацию');
      navigate('/seller');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.error || 'Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Создание события</h1>

        {/* Шаги */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <button
                onClick={() => setStep(s)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition ${
                  step >= s ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? <FaCheck /> : s}
              </button>
              {s < 3 && <div className={`flex-1 h-1 rounded ${step > s ? 'bg-blue-500' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Шаг 1: Основная информация */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                Основная информация
              </h2>

              <div>
                <label className="block text-sm font-medium mb-1">Название события *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Например: Восхождение на Эльбрус с гидом"
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1">{formData.title.length}/200 символов</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Категория *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => { updateField('category', e.target.value); updateField('subcategory', ''); }}
                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {Object.keys(CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Подкатегория</label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => updateField('subcategory', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.category || CATEGORIES[formData.category]?.length === 0}
                  >
                    <option value="">Выберите подкатегорию</option>
                    {(CATEGORIES[formData.category] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Сезон</label>
                  <select
                    value={formData.season}
                    onChange={(e) => updateField('season', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    <option value="">Любой</option>
                    {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Сложность</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => updateField('difficulty', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    <option value="">Не указана</option>
                    {DIFFICULTY.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Язык проведения</label>
                  <select
                    value={formData.language}
                    onChange={(e) => updateField('language', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Краткое описание *</label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => updateField('shortDescription', e.target.value)}
                  placeholder="Краткое описание для карточки события (до 200 символов)"
                  className="w-full border rounded-xl px-4 py-3 h-24 focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-gray-400 mt-1">{formData.shortDescription.length}/200</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Полное описание *</label>
                <textarea
                  value={formData.fullDescription}
                  onChange={(e) => updateField('fullDescription', e.target.value)}
                  placeholder="Подробное описание события, программа, что включено..."
                  className="w-full border rounded-xl px-4 py-3 h-40 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="text-right">
                <button type="button" onClick={() => setStep(2)}
                  className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition">
                  Далее →
                </button>
              </div>
            </div>
          )}

          {/* Шаг 2: Детали и локация */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" />
                Локация и детали
              </h2>

              <div>
                <label className="block text-sm font-medium mb-1">Адрес *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="ул. Тверская, 1, Москва"
                    className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={geocodeAddress}
                    disabled={geocoding}
                    className="bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {geocoding ? <FaSpinner className="animate-spin" /> : <FaSearch />}
                    Найти
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Регион</label>
                  <input type="text" value={formData.region} readOnly
                    className="w-full border rounded-xl px-4 py-3 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Город</label>
                  <input type="text" value={formData.city} 
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Широта</label>
                  <input type="text" value={formData.latitude} readOnly
                    className="w-full border rounded-xl px-4 py-3 bg-gray-50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Долгота</label>
                  <input type="text" value={formData.longitude} readOnly
                    className="w-full border rounded-xl px-4 py-3 bg-gray-50 text-sm" />
                </div>
              </div>

              {formData.latitude && formData.longitude && (
                <div className="h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FaMapMarkerAlt className="text-4xl mb-2 text-red-400 mx-auto" />
                    <p>Координаты: {formData.latitude}, {formData.longitude}</p>
                    <p className="text-sm">Карта будет доступна после активации API ключа</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Место встречи</label>
                <input type="text" value={formData.meetingPoint}
                  onChange={(e) => updateField('meetingPoint', e.target.value)}
                  placeholder="Например: у входа в метро, Красная площадь"
                  className="w-full border rounded-xl px-4 py-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Цена (₽) *</label>
                  <input type="number" value={formData.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Макс. участников</label>
                  <input type="number" value={formData.maxParticipants}
                    onChange={(e) => updateField('maxParticipants', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Длительность (дней)</label>
                  <input type="number" value={formData.durationDays}
                    onChange={(e) => updateField('durationDays', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3" min="1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Дата начала</label>
                  <input type="date" value={formData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Дата окончания</label>
                  <input type="date" value={formData.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full border rounded-xl px-4 py-3" />
                </div>
              </div>

              <div className="flex gap-3 justify-between">
                <button type="button" onClick={() => setStep(1)}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full hover:bg-gray-300">
                  ← Назад
                </button>
                <button type="button" onClick={() => setStep(3)}
                  className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600">
                  Далее →
                </button>
              </div>
            </div>
          )}

          {/* Шаг 3: Медиа и финал */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FaImage className="text-purple-500" />
                Изображения и дополнительная информация
              </h2>

              <div>
                <label className="block text-sm font-medium mb-2">Главное фото</label>
                <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-blue-500 transition cursor-pointer"
                  onClick={() => document.getElementById('previewInput').click()}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                  ) : (
                    <div className="text-gray-400">
                      <FaImage className="text-4xl mx-auto mb-2" />
                      <p>Нажмите для загрузки главного фото</p>
                      <p className="text-sm">Рекомендуемый размер: 1200x800</p>
                    </div>
                  )}
                  <input id="previewInput" type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleImageUpload(e, 'preview')} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Галерея (до 10 фото)</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {gallery.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img.url} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeGalleryImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs">
                        ×
                      </button>
                    </div>
                  ))}
                  {gallery.length < 10 && (
                    <div className="border-2 border-dashed rounded-lg h-24 flex items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500"
                      onClick={() => document.getElementById('galleryInput').click()}>
                      <FaImage className="text-2xl" />
                    </div>
                  )}
                  <input id="galleryInput" type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleImageUpload(e, 'gallery')} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Что включено</label>
                <textarea value={formData.includes} onChange={(e) => updateField('includes', e.target.value)}
                  placeholder="Трансфер, питание, снаряжение, страховка..."
                  className="w-full border rounded-xl px-4 py-3 h-24" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Что не включено</label>
                <textarea value={formData.excludes} onChange={(e) => updateField('excludes', e.target.value)}
                  placeholder="Личные расходы, сувениры..."
                  className="w-full border rounded-xl px-4 py-3 h-24" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Требования к участникам</label>
                <textarea value={formData.requirements} onChange={(e) => updateField('requirements', e.target.value)}
                  placeholder="Возраст, физическая подготовка, экипировка..."
                  className="w-full border rounded-xl px-4 py-3 h-24" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Примечание организатора</label>
                <textarea value={formData.organizerNote} onChange={(e) => updateField('organizerNote', e.target.value)}
                  placeholder="Дополнительная информация для участников..."
                  className="w-full border rounded-xl px-4 py-3 h-24" />
              </div>

              <div className="flex gap-3 justify-between pt-4 border-t">
                <button type="button" onClick={() => setStep(2)}
                  className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full hover:bg-gray-300">
                  ← Назад
                </button>
                <button type="submit" disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-12 py-3 rounded-full hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2">
                  {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {loading ? 'Создание...' : 'Создать событие'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
