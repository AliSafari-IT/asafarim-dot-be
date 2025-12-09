import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";
import { DashboardPage } from "./pages/DashboardPage";
import { ClientsPage } from "./pages/ClientsPage";
import { ClientFormPage } from "./pages/ClientFormPage";
import { ProposalsPage } from "./pages/ProposalsPage";
import { ProposalFormPage } from "./pages/ProposalFormPage";
import { LoginPage } from "./pages/LoginPage";
import "./index.css";
import CalendarPage from "./pages/CalendarPage";

import InvoicesPage from "./pages/InvoicesPage";
<<<<<<< HEAD
import InvoiceEditorPage from "./pages/InvoiceEditorPage";
=======
const CalendarPage = () => <div>Calendar Page (Coming Soon)</div>;
>>>>>>> 2cbbfa3 (```)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<App />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/new" element={<ClientFormPage />} />
            <Route path="clients/:id" element={<ClientFormPage />} />
            <Route path="proposals" element={<ProposalsPage />} />
            <Route path="proposals/new" element={<ProposalFormPage />} />
            <Route path="proposals/:id" element={<ProposalFormPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="invoices/:id" element={<InvoiceEditorPage />} />
            <Route path="calendar" element={<CalendarPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
