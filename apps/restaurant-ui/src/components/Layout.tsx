import { Outlet, NavLink } from 'react-router-dom';
import {
  ShoppingCart,
  ChefHat,
  ClipboardList,
  UtensilsCrossed,
  Package,
  Users,
  BarChart3,
} from 'lucide-react';
import './Layout.css';

const navItems = [
  { to: '/pos', icon: ShoppingCart, label: 'POS' },
  { to: '/kitchen', icon: ChefHat, label: 'Kitchen' },
  { to: '/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export function Layout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>RMS</h1>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
