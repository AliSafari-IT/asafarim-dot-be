import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastProvider, Toaster } from '@asafarim/toast';
import '@asafarim/toast/styles.css';
import AuthProvider from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationProvider from './contexts/NotificationProvider';
import NotificationContainer from './components/Notifications/NotificationContainer';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import SyncLogout from './pages/SyncLogout';
import AdminUsersPage from './pages/AdminUsersPage';
import DashboardPage from './pages/DashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import MeProfilePage from './pages/MeProfilePage';

function App() {
  // Cross-app theme sync: mirror theme between localStorage and a root-domain cookie
  useEffect(() => {
    const THEME_KEY = 'asafarim-theme';
    const COOKIE_NAME = 'asafarim_theme';

    const getCookie = (name: string) =>
      document.cookie
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith(name + '='))
        ?.split('=')[1];

    // On load: if cookie has a theme, seed localStorage so ThemeProvider picks it up
    const cookieTheme = getCookie(COOKIE_NAME);
    if (cookieTheme) {
      localStorage.setItem(THEME_KEY, cookieTheme);
    }

    let last = localStorage.getItem(THEME_KEY) || cookieTheme || 'dark';

    const writeCookie = (value: string) => {
      document.cookie = `${COOKIE_NAME}=${value}; domain=.asafarim.local; path=/; max-age=31536000; samesite=lax`;
    };

    // Keep cookie in sync when local theme changes
    const interval = setInterval(() => {
      const current = localStorage.getItem(THEME_KEY);
      if (current && current !== last) {
        last = current;
        writeCookie(current);
      }
    }, 1000);

    // When tab becomes visible, pull latest from cookie (sync across subdomains)
    const onVis = () => {
      if (!document.hidden) {
        const v = getCookie(COOKIE_NAME);
        if (v && v !== localStorage.getItem(THEME_KEY)) {
          localStorage.setItem(THEME_KEY, v);
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <Router>
              <NotificationContainer />
              <Toaster />
              <Routes>
              {/* Public routes (accessible when not logged in) */}
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Register />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected routes (require authentication) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />

              {/* Admin users management */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin user profile (admin-only) and Me profile (all authenticated) */}
              <Route
                path="/me"
                element={
                  <ProtectedRoute>
                    <MeProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/user-profile"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/user-profile/:id"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Logout sync endpoint (not protected) */}
              <Route path="/sync-logout" element={<SyncLogout />} />
              
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Catch all other routes and redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
  );
}

export default App;
