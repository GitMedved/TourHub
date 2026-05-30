import React from 'react';

import {
  Link
} from 'react-router-dom';

import {
  FaRoute,
  FaUsers,
  FaMapMarkedAlt,
  FaGlobeEurope,
  FaArrowRight,
  FaStar,
  FaPlaneDeparture,
  FaHeart,
  FaCompass
} from 'react-icons/fa';

import Header from '../components/Header';
import { useLanguage } from '../i18n';

const activeTrips = [
  {
    id: 1,
    title: 'Japan Spring Journey',
    destination: 'Tokyo • Kyoto • Osaka',
    members: 4,
    activity: '2 new places added',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=80',
    gradient: 'from-rose-500 to-orange-400'
  },
  {
    id: 2,
    title: 'Iceland Roadtrip',
    destination: 'Reykjavik • Vik • Hofn',
    members: 3,
    activity: 'Route voting in progress',
    image: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=900&q=80',
    gradient: 'from-cyan-500 to-blue-600'
  }
];

const communityFeed = [
  'Anna added Kyoto Food Walk',
  'Mike voted for Lisbon route',
  'Sophie created a new Italy trip',
  'Daniel invited 2 collaborators'
];

const discoverRoutes = [
  {
    title: 'Hidden Gems of Portugal',
    author: 'Community',
    saves: 124,
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Nordic Remote Work Journey',
    author: 'Travel Collective',
    saves: 87,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80'
  },
  {
    title: 'Bali Wellness Route',
    author: 'Explorer Group',
    saves: 203,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80'
  }
];

const heroStats = [
  { value: '12k+', labelKey: 'plannedStops' },
  { value: '4.9', labelKey: 'travelerRating' },
  { value: '38', labelKey: 'countries' }
];

const TripCard = ({
  trip,
  t
}) => (
  <div className="tourhub-reveal bg-white rounded-[2rem] p-4 shadow-lg shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 border border-white/80 hover:-translate-y-2">
    <div className="relative h-56 overflow-hidden rounded-[1.5rem]">
      <img
        src={trip.image}
        alt={trip.title}
        className="h-full w-full object-cover transition duration-700 hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className={`absolute left-4 top-4 rounded-full bg-gradient-to-r ${trip.gradient} px-4 py-2 text-xs font-bold text-white shadow-lg`}>
        {t.home.livePlanning}
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h3 className="text-2xl font-black">
          {trip.title}
        </h3>
        <p className="mt-1 text-sm text-white/80">
          {trip.destination}
        </p>
      </div>
    </div>

    <div className="mt-5 flex items-center justify-between gap-4">
      <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
        {trip.members} members
      </div>
      <div className="flex flex-1 items-center justify-end gap-2 text-sm text-gray-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        {trip.activity}
      </div>
    </div>

    <Link to="/trips" className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 py-3 font-semibold text-white transition hover:scale-[1.02] hover:bg-blue-700">
      {t.home.openWorkspace}
      <FaArrowRight />
    </Link>
  </div>
);

const HomePage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-gray-950">
      <Header />

      <section className="relative overflow-hidden bg-[#08111f] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#38bdf8,transparent_28%),radial-gradient(circle_at_75%_20%,#a855f7,transparent_28%),radial-gradient(circle_at_bottom_right,#f97316,transparent_30%)] opacity-40" />
        <div className="tourhub-aurora absolute -left-32 top-24 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="tourhub-aurora tourhub-delay-2 absolute right-0 top-10 h-96 w-96 rounded-full bg-fuchsia-500/25 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_0.9fr] lg:py-28">
          <div className="tourhub-reveal max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <FaPlaneDeparture className="text-cyan-300" />
              {t.home.badge}
            </div>

            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              {t.home.title}
              <span className="block bg-gradient-to-r from-cyan-200 via-white to-orange-200 bg-clip-text text-transparent">
                {t.home.titleAccent}
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-300">
              {t.home.subtitle}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/trips"
                className="rounded-2xl bg-white px-8 py-4 font-bold text-gray-950 shadow-2xl shadow-white/10 transition hover:-translate-y-1 hover:scale-[1.02]"
              >
                {t.home.createTrip}
              </Link>

              <Link
                to="/events"
                className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-bold backdrop-blur transition hover:-translate-y-1 hover:bg-white/20"
              >
                {t.home.explore}
              </Link>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
              {heroStats.map((stat) => (
                <div key={t.home[stat.labelKey]} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-black">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">{t.home[stat.labelKey]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="tourhub-float relative hidden lg:block">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/10 p-4 shadow-2xl shadow-cyan-950/50 backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80"
                alt="Travelers overlooking a mountain valley"
                className="h-[540px] w-full rounded-[2rem] object-cover"
              />
              <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 rounded-3xl border border-white/20 bg-white/15 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                  <FaCompass /> {t.home.routePreview}
                </div>
                <div className="mt-3 text-2xl font-black">{t.home.routeTitle}</div>
                <div className="mt-4 flex items-center gap-3 text-sm text-white/80">
                  <span className="rounded-full bg-white/15 px-3 py-1">{t.home.stops}</span>
                  <span className="rounded-full bg-white/15 px-3 py-1">{t.home.friends}</span>
                  <span className="rounded-full bg-white/15 px-3 py-1">{t.home.voted}</span>
                </div>
              </div>
            </div>
            <div className="absolute -left-8 top-16 rounded-3xl bg-white p-4 text-gray-950 shadow-2xl">
              <div className="flex items-center gap-2 text-sm font-bold"><FaStar className="text-yellow-400" /> Top rated</div>
              <div className="mt-1 text-xs text-gray-500">Mountain escapes</div>
            </div>
            <div className="absolute -right-6 bottom-24 rounded-3xl bg-white p-4 text-gray-950 shadow-2xl">
              <div className="flex items-center gap-2 text-sm font-bold"><FaHeart className="text-rose-500" /> 248 saves</div>
              <div className="mt-1 text-xs text-gray-500">Community route</div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                <FaRoute /> {t.home.workspaces}
              </div>
              <h2 className="text-4xl font-black">
                {t.home.activeTrips}
              </h2>
              <p className="mt-2 text-gray-500">
                {t.home.activeTripsText}
              </p>
            </div>

            <Link to="/trips" className="hidden font-bold text-blue-600 transition hover:text-purple-600 sm:block">
              {t.home.viewAll}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {activeTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} t={t} />
            ))}
          </div>
        </section>

        <section className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="tourhub-reveal rounded-[2rem] border border-white bg-white p-8 shadow-xl shadow-blue-900/5">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
                <FaUsers className="text-2xl" />
              </div>
              <h2 className="text-3xl font-black">
                {t.home.communityActivity}
              </h2>
            </div>

            <div className="space-y-4">
              {communityFeed.map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-gray-50 to-white p-4 shadow-sm transition hover:translate-x-2 hover:shadow-md">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="tourhub-reveal rounded-[2rem] border border-white bg-white p-8 shadow-xl shadow-purple-900/5">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-purple-100 p-3 text-purple-600">
                <FaGlobeEurope className="text-2xl" />
              </div>
              <h2 className="text-3xl font-black">
                {t.home.discoverRoutes}
              </h2>
            </div>

            <div className="space-y-4">
              {discoverRoutes.map((route) => (
                <div key={route.title} className="group flex gap-4 rounded-3xl border border-gray-100 p-3 transition hover:-translate-y-1 hover:shadow-lg">
                  <img src={route.image} alt={route.title} className="h-24 w-24 rounded-2xl object-cover transition group-hover:scale-105" />
                  <div className="flex flex-1 items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">
                        {route.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {t.home.by} {route.author}
                      </p>
                    </div>
                    <div className="rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-600">
                      {route.saves} {t.home.saves}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="tourhub-shine relative mt-20 overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-10 text-white shadow-2xl shadow-blue-900/20">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold">
                <FaMapMarkedAlt /> {t.home.nextAdventure}
              </div>
              <h2 className="text-4xl font-black">
                {t.home.startTogether}
              </h2>
              <p className="mt-4 max-w-2xl text-white/80">
                {t.home.startText}
              </p>
            </div>

            <Link to="/trips" className="whitespace-nowrap rounded-2xl bg-white px-8 py-4 font-black text-gray-950 transition hover:-translate-y-1 hover:scale-[1.02]">
              {t.home.createWorkspace}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
