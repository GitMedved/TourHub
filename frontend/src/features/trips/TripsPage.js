import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTrip, getTrips } from './trips.api';

const FILTERS = ['all', 'planning', 'active', 'archived'];
const SORTS = ['newest', 'oldest', 'upcoming', 'last_modified'];

function formatDateRange(trip) {
  if (!trip.startDate || !trip.endDate) return 'Dates to be planned';
  const start = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          <span className="th-chip" aria-label="Members online now">● Real-time collaborative workspace</span>
          <h1>My Trips</h1>
          <p>Plan and coordinate adventures with your group in one place.</p>
        </div>
      </header>

      <section className="th-surface th-create-section" aria-label="Create a new trip">
        <div className="th-create-title-wrap">
          <h2>Create New Trip</h2>
          <p>Start with a name and destination. You can add dates and members next.</p>
        </div>

        <form onSubmit={handleSubmit} className="th-create-grid">
          <label className="th-field">
            <span>Trip Name</span>
            <input
              type="text"
              placeholder="Summer Adventure 2026"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>

          <label className="th-field">
            <span>Destination</span>
            <input
              type="text"
              placeholder="Paris, France"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
              required
            />
          </label>

          <button className="th-btn th-btn-primary" type="submit" disabled={createTripMutation.isPending}>
            {createTripMutation.isPending ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </section>

      <section className="th-toolbar th-surface" aria-label="Trip filters and sort">
        <div className="th-tabs" role="tablist" aria-label="Trips filters">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={filter === item}
              className={`th-tab ${filter === item ? 'is-active' : ''}`}
              onClick={() => setFilter(item)}
            >
              {item === 'all' ? 'All' : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        <div className="th-toolbar-right">
          <input
            type="search"
            placeholder="Search trips..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="th-search"
            aria-label="Search trips"
          />

          <select className="th-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort trips">
            {SORTS.map((sortKey) => (
              <option key={sortKey} value={sortKey}>{sortKey.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </section>

      {isError && (
        <section className="th-state th-surface" role="alert">
          <h3>Failed to load trips</h3>
          <p>{error?.message || 'Check your connection and try again.'}</p>
        </section>
      )}

      {isLoading ? (
        <section className="th-grid" aria-label="Loading trips">
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
          <h3>Plan your first adventure</h3>
          <p>Create a trip and invite friends to collaborate in real-time.</p>
        </section>
      ) : (
        <section className="th-grid" aria-label="Trips list">
          {visibleTrips.map((trip) => (
            <Link key={trip.id} to={`/trips/${trip.id}`} className="th-card-link">
              <article className="th-card" aria-label={`Open ${trip.title}`}>
                <div className="th-card-cover" />
                <div className="th-card-body">
                  <span className="th-badge">{(trip.status || 'planning').toLowerCase()}</span>
                  <h3>{trip.title}</h3>
                  <p>{formatDateRange(trip)}</p>
                  <div className="th-card-meta">
                    <span>📍 {trip.places?.length || 0} places</span>
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
