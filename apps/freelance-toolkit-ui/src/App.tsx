import { Outlet } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ThemeProvider } from "@asafarim/shared-ui-react";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </ThemeProvider>
  );
}

export default App;
