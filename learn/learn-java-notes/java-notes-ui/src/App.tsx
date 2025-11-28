import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotesList from "./pages/NotesList";
import NoteDetails from "./pages/NoteDetails";
import CreateNote from "./pages/CreateNote";
import EditNote from "./pages/EditNote";
import PublicNotesList from "./pages/PublicNotesList";
import PublicNoteDetails from "./pages/PublicNoteDetails";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import "./api/interceptors";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Public homepage with layout */}
          <Route path="/" element={
            <Layout>
              <NotesList />
            </Layout>
          } />
          
          <Route path="/note/:id" element={
            <ProtectedRoute>
              <Layout>
                <NoteDetails />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/create" element={
            <ProtectedRoute>
              <Layout>
                <CreateNote />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/edit/:id" element={
            <ProtectedRoute>
              <Layout>
                <EditNote />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Analytics Dashboard */}
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Layout>
                <AnalyticsDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Public notes routes */}
          <Route path="/public" element={
            <Layout>
              <PublicNotesList />
            </Layout>
          } />

          <Route path="/public/note/:id" element={
            <Layout>
              <PublicNoteDetails />
            </Layout>
          } />
          
          {/* Catch-all route - redirect to home */}
          <Route path="*" element={
            <Layout>
              <NotesList />
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
