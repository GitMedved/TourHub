import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTrip, getTrips } from './trips.api';

const FILTERS = ['all', 'planning', 'active', 'archived'];
const SORTS = ['newest', 'oldest', 'upcoming', 'last_modified'];

function formatDateRange(trip) {
  if (!trip.startDate || !trip.endDate) return 'Даты будут добавлены позже';
  const start = new Date(trip.startDate).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  const end = new Date(trip.endDate).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${start} - ${end}`;
}

export default function TripsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', destination: '' });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: trips = [], isLoading, isError, error } = useQuery({
    queryKey: ['trips'],
    queryFn: getTrips
  });

  const createTripMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setForm({ title: '', destination: '' });
    }
  });

  const visibleTrips = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...trips]
      .filter((trip) => {
        const status = (trip.status || 'planning').toLowerCase();
        const filterMatch = filter === 'all' || status === filter;
        const searchMatch = !normalizedSearch || trip.title?.toLowerCase().includes(normalizedSearch);
        return filterMatch && searchMatch;
      })
      .sort((a, b) => {
        const aCreated = new Date(a.createdAt || 0).getTime();
        const bCreated = new Date(b.createdAt || 0).getTime();
        const aStart = new Date(a.startDate || 0).getTime();
        const bStart = new Date(b.startDate || 0).getTime();
        const aUpdated = new Date(a.updatedAt || 0).getTime();
        const bUpdated = new Date(b.updatedAt || 0).getTime();

        switch (sortBy) {
          case 'oldest':
            return aCreated - bCreated;
          case 'upcoming':
            return aStart - bStart;
          case 'last_modified':
            return bUpdated - aUpdated;
          case 'newest':
          default:
            return bCreated - aCreated;
        }
      });
  }, [filter, search, sortBy, trips]);

  const handleSubmit = (e) => {
    e.preventDefault();
    createTripMutation.mutate(form);
  };

  return (
    <main className="th-page">
      <header className="th-header">
        <div>
          <span className="th-chip" aria-label="Участники онлайн">● Совместное планирование в реальном времени</span>
          <h1>Мои поездки</h1>
          <p>Планируйте маршруты и согласовывайте путешествия с группой в одном месте.</p>
        </div>
      </header>

      <section className="th-surface th-create-section" aria-label="Создание новой поездки">
        <div className="th-create-title-wrap">
          <h2>Создать новую поездку</h2>
          <p>Начните с названия и направления. Даты и участников можно добавить позже.</p>
        </div>

        <form onSubmit={handleSubmit} className="th-create-grid">
          <label className="th-field">
            <span>Название поездки</span>
            <input
              type="text"
              placeholder="Летнее приключение 2026"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>

          <label className="th-field">
            <span>Направление</span>
            <input
              type="text"
              placeholder="Париж, Франция"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              required
            />
          </label>

          <button className="th-btn th-btn-primary" type="submit" disabled={createTripMutation.isPending}>
            {createTripMutation.isPending ? 'Создаём...' : 'Создать поездку'}
          </button>
        </form>
      </section>

      <section className="th-toolbar th-surface" aria-label="Фильтры и сортировка поездок">
        <div className="th-tabs" role="tablist" aria-label="Фильтры поездок">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={filter === item}
              className={`th-tab ${filter === item ? 'is-active' : ''}`}
              onClick={() => setFilter(item)}
            >
              {({ all: 'Все', planning: 'Планирование', active: 'Активные', archived: 'Архив' }[item] || item)}
            </button>
          ))}
        </div>

        <div className="th-toolbar-right">
          <input
            type="search"
            placeholder="Поиск поездок..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="th-search"
            aria-label="Поиск поездок"
          />

          <select className="th-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Сортировка поездок">
            {SORTS.map((sortKey) => (
              <option key={sortKey} value={sortKey}>{({ newest: 'Сначала новые', oldest: 'Сначала старые', upcoming: 'По дате начала', last_modified: 'Недавно изменённые' }[sortKey] || sortKey)}</option>
            ))}
          </select>
        </div>
      </section>

      {isError && (
        <section className="th-state th-surface" role="alert">
          <h3>Не удалось загрузить поездки</h3>
          <p>{error?.message || 'Проверьте соединение и попробуйте ещё раз.'}</p>
        </section>
      )}

      {isLoading ? (
        <section className="th-grid" aria-label="Загрузка поездок">
          {Array.from({ length: 6 }).map((_, idx) => (
            <article key={idx} className="th-card th-skeleton-card" aria-hidden="true">
              <div className="th-skeleton th-skeleton-cover" />
              <div className="th-skeleton th-skeleton-line" />
              <div className="th-skeleton th-skeleton-line short" />
            </article>
          ))}
        </section>
      ) : visibleTrips.length === 0 ? (
        <section className="th-state th-surface">
          <h3>Запланируйте первое приключение</h3>
          <p>Создайте поездку и пригласите друзей для совместного планирования.</p>
        </section>
      ) : (
        <section className="th-grid" aria-label="Список поездок">
          {visibleTrips.map((trip) => (
            <Link key={trip.id} to={`/trips/${trip.id}`} className="th-card-link">
              <article className="th-card" aria-label={`Открыть ${trip.title}`}>
                <div className="th-card-cover" />
                <div className="th-card-body">
                  <span className="th-badge">{{ planning: 'Планирование', active: 'Активная', archived: 'Архив' }[(trip.status || 'planning').toLowerCase()] || (trip.status || 'planning')}</span>
                  <h3>{trip.title}</h3>
                  <p>{formatDateRange(trip)}</p>
                  <div className="th-card-meta">
                    <span>📍 {trip.places?.length || 0} мест</span>
                    <span>💬 {trip.comments?.length || 0}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
