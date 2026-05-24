import React, {
  useState,
  useEffect
} from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';

import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';

import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import EventDetailPage from './pages/EventDetailPage';
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/SettingsPage';

import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';

import TripsPage from './features/trips/TripsPage';
import TripWorkspacePage from './features/trips/TripWorkspacePage';
import JoinTripPage from './features/trips/JoinTripPage';
import { useLanguage } from './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const ProtectedRoute = ({
  children,
  roles
}) => {

  const user = (() => {

    try {

      return JSON.parse(
        localStorage.getItem('user')
      );

    } catch {

      return null;

    }

  })();

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  if (
    roles &&
    !roles.includes(user.role)
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }

  return children;
};

const NotFound = () => {
  const { t } = useLanguage();
  return (
  <div className="
    min-h-screen
    flex
    items-center
    justify-center
    bg-gray-50
  ">

    <div className="text-center">

      <div className="text-8xl mb-4">
        🧭
      </div>

      <h1 className="
        text-3xl
        font-bold
        text-gray-900
        mb-3
      ">
        {t.notFoundTitle}
      </h1>

      <p className="text-gray-500 mb-6">
        {t.notFoundText}
      </p>

      <a
        href="/"
        className="
          bg-black
          text-white
          px-6
          py-3
          rounded-2xl
        "
      >
        {t.backHome}
      </a>

    </div>

  </div>
);
};

function AppContent() {

  const [user, setUser] = useState(() => {

    try {

      return JSON.parse(
        localStorage.getItem('user')
      );

    } catch {

      return null;

    }

  });

  const location = useLocation();

  useEffect(() => {

    const sync = () => {

      try {

        setUser(
          JSON.parse(
            localStorage.getItem('user')
          )
        );

      } catch {

        setUser(null);

      }

    };

    window.addEventListener(
      'storage',
      sync
    );

    sync();

    return () => {

      window.removeEventListener(
        'storage',
        sync
      );

    };

  }, [location.pathname]);

  const showSidebar =
    !!user &&
    ![
      '/login',
      '/register'
    ].includes(location.pathname);

  return (
    <>

      {showSidebar && (
        <Sidebar />
      )}

      <Routes>

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/map"
          element={<MapPage />}
        />

        <Route
          path="/events"
          element={<EventsPage />}
        />

        <Route
          path="/events/create"
          element={<ProtectedRoute roles={['SELLER']}>
            <CreateEventPage />
          </ProtectedRoute>}
        />

        <Route
          path="/event/:id"
          element={<EventDetailPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/settings"
          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <TripsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute>
              <TripWorkspacePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/join/:token"
          element={
            <ProtectedRoute>
              <JoinTripPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              roles={['ADMIN']}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </>
  );
}

function App() {

  return (
    <QueryClientProvider client={queryClient}>

      <Router>

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,

            style: {
              background: '#111827',
              color: '#fff',
              borderRadius: '16px',
              fontSize: '14px'
            }
          }}
        />

        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>

      </Router>

    </QueryClientProvider>
  );
}

export default App;
