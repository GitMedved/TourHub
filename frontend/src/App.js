import React, { useState, useEffect } from 'react';

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
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';

import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';

import TripsPage from './features/trips/TripsPage';

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

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">

    <div className="text-center">

      <div className="text-8xl mb-4">
        🗺️
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Page not found
      </h1>

      <p className="text-gray-500 mb-6">
        This route has not been explored yet
      </p>

      <a
        href="/"
        className="bg-black text-white px-6 py-3 rounded-full"
      >
        Back home
      </a>

    </div>
  </div>
);

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
    !['/login', '/register']
      .includes(location.pathname);

  return (
    <>

      {showSidebar && (
        <Sidebar user={user} />
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
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
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
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
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
