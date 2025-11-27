import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import NotesList from "./pages/NotesList";
import NoteDetails from "./pages/NoteDetails";
import CreateNote from "./pages/CreateNote";
import EditNote from "./pages/EditNote";
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
          
          {/* Protected routes with layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <NotesList />
              </Layout>
            </ProtectedRoute>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
