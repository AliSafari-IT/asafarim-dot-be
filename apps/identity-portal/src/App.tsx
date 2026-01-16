import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider, Toaster } from "@asafarim/toast";
import "@asafarim/toast/styles.css";
import { ThemeProvider } from "@asafarim/shared-ui-react";
import ProtectedRoute from "./components/ProtectedRoute";
import NotificationProvider from "./contexts/NotificationProvider";
import NotificationContainer from "./components/Notifications/NotificationContainer";
import Navbar from "./components/Navbar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import SetupPassword from "./pages/SetupPassword";
import SyncLogout from "./pages/SyncLogout";
import AdminUsersPage from "./pages/AdminUsersPage";
import DashboardPage from "./pages/DashboardPage";
import UserProfilePage from "./pages/UserProfilePage";
import MeProfilePage from "./pages/MeProfilePage";
import AddNewUserPage from "./pages/AddNewUserPage";
import EditUserPage from "./pages/EditUserPage";
import { PrelaunchNoticeBanner } from "@asafarim/shared-ui-react";
import AdminDashboard from "./pages/admin-area/AdminDashboard";
import RoleCrudOperations from "./pages/admin-area/RoleCrudOperations";
import { ConfirmEmail } from "./pages/ConfirmEmail";

function App() {
  return (
    <ThemeProvider>
      <PrelaunchNoticeBanner />
      <ToastProvider position="top-right">
        <NotificationProvider>
          <Router>
            <NotificationContainer />
            <Navbar />
            <Toaster i18nIsDynamicList={true}/>
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
              <Route
                path="/forgot-password"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <ForgotPassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/setup-password"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <SetupPassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirm-email"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <ConfirmEmail />
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
                path="/admin-area"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-area/users"
                element={
                  <ProtectedRoute>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-area/users/add"
                element={
                  <ProtectedRoute>
                    <AddNewUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-area/roles"
                element={
                  <ProtectedRoute>
                    <RoleCrudOperations />
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
              <Route path="/admin-area/user-profile" element={<UserProfilePage />} />
              <Route
                path="/admin-area/user-profile/:id"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
              {/* Admin edit user (admin-only) */}
              <Route
                path="/admin-area/edit-user/:id"
                element={
                  <ProtectedRoute>
                    <EditUserPage />
                  </ProtectedRoute>
                }
              />

              {/* Logout endpoint - clears auth and redirects to login */}
              <Route path="/logout" element={<SyncLogout />} />

              {/* Logout sync endpoint (not protected) */}
              <Route path="/sync-logout" element={<SyncLogout />} />

              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Catch all other routes and redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
