// App.tsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
//import { isProduction, useAuth, ThemeProvider } from '@asafarim/shared-ui-react';
import Dashboard from "./pages/Dashboard";
import { TestRunsPage } from "./pages/TestRunsPage";
import { TestRunDetailsPage } from "./pages/TestRunDetailsPage";
import FunctionalRequirementsPage from "./pages/FunctionalRequirementsPage";
import FixturesPage from "./pages/FixturesPage";
import TestSuitesPage from "./pages/TestSuitesPage";
import TestCasesPage from "./pages/TestCasesPage";
import TestDataSetsPage from "./pages/TestDataSetsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SettingsPage from "./pages/SettingsPage";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import "./App.css";
import HomePage from "./pages/HomePage";
import { RunTestsPageToken } from './pages/RunTestsPage-Token';

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        {!isHomePage && <Sidebar />}
        <div className={`content-wrapper ${isHomePage ? "full-width" : ""}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/test-runs" element={<TestRunsPage />} />
            <Route path="/test-runs/:id" element={<TestRunDetailsPage />} />
            <Route path="/run" element={<RunTestsPageToken />} />

            <Route
              path="/functional-requirements"
              element={<FunctionalRequirementsPage />}
            />
            <Route path="/fixtures" element={<FixturesPage />} />
            <Route path="/test-suites" element={<TestSuitesPage />} />
            <Route path="/test-cases" element={<TestCasesPage />} />
            <Route path="/test-data-sets" element={<TestDataSetsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
