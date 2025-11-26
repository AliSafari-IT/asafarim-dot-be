import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { POSPage } from './pages/POSPage';
import { KitchenDisplayPage } from './pages/KitchenDisplayPage';
import { OrdersPage } from './pages/OrdersPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { InventoryPage } from './pages/InventoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { ReportsPage } from './pages/ReportsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/pos" replace />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="kitchen" element={<KitchenDisplayPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
