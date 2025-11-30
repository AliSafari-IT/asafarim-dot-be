import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import {
  NotificationProvider,
  NotificationContainer,
} from "@asafarim/shared-ui-react";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotesList from "./pages/NotesList";
import NoteDetails from "./pages/NoteDetails";
import CreateNote from "./pages/CreateNote";
import EditNote from "./pages/EditNote";
import PublicNotesList from "./pages/PublicNotesList";
import PublicNoteDetails from "./pages/PublicNoteDetails";
import PublicNotePage from "./pages/PublicNotePage";
import PublicFeedPage from "./pages/PublicFeedPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import TagManagementPage from "./pages/TagManagementPage";
import SearchPage from "./pages/SearchPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import {
  AdminDashboard,
  AdminUsersPage,
  AdminRolesPage,
  AdminPermissionsPage,
  AdminLogsPage,
  AdminSettingsPage,
} from "./pages/admin";
import "./api/interceptors";

function App() {
  return (
    <NotificationProvider autoRemoveTimeout={5000}>
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <NotificationContainer position="top-right" />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Public homepage with layout */}
              <Route
                path="/"
                element={
                  <Layout>
                    <NotesList />
                  </Layout>
                }
              />

              <Route
                path="/note/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <NoteDetails />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <CreateNote />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/edit/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <EditNote />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Analytics Dashboard */}
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <AnalyticsDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Tag Management */}
              <Route
                path="/tags/manage"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TagManagementPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Search Page - accessible to all */}
              <Route
                path="/search"
                element={
                  <Layout>
                    <SearchPage />
                  </Layout>
                }
              />

              {/* Public notes routes */}
              <Route
                path="/public"
                element={
                  <Layout>
                    <PublicNotesList />
                  </Layout>
                }
              />

              <Route
                path="/public/note/:id"
                element={
                  <Layout>
                    <PublicNoteDetails />
                  </Layout>
                }
              />

              {/* Public Sharing Routes - Phase 11 */}
              <Route path="/p/:publicId/:slug?" element={<PublicNotePage />} />
              <Route path="/p/:publicId" element={<PublicNotePage />} />

              <Route
                path="/feed"
                element={
                  <Layout>
                    <PublicFeedPage />
                  </Layout>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminLayout>
                    <AdminUsersPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <AdminLayout>
                    <AdminRolesPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/permissions"
                element={
                  <AdminLayout>
                    <AdminPermissionsPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <AdminLayout>
                    <AdminLogsPage />
                  </AdminLayout>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminLayout>
                    <AdminSettingsPage />
                  </AdminLayout>
                }
              />

              {/* Catch-all route - redirect to home */}
              <Route
                path="*"
                element={
                  <Layout>
                    <NotesList />
                  </Layout>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    </NotificationProvider>
  );
}

export default App;
