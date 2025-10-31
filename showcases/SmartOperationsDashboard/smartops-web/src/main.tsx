import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { initI18n } from '@asafarim/shared-i18n'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter } from "react-router-dom";
import Root from "./theme/Root";
import Dashboard from "./pages/Dashboard";
import DeviceList from './pages/Devices/DeviceList.tsx';
import DeviceCreate from './pages/Devices/DeviceCreate.tsx';
import DeviceDetail from './pages/Devices/DeviceDetail.tsx';
import UserManagement from './pages/Admin/UserManagement.tsx';

// Initialize i18n before rendering
initI18n()

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "devices", element: <DeviceList /> },
      { path: "devices/create", element: <DeviceCreate /> },
      { path: "devices/:id/edit", element: <DeviceDetail /> },
      { path: "admin/users", element: <UserManagement /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root>
      <RouterProvider router={router} />
    </Root>
  </StrictMode>
);
