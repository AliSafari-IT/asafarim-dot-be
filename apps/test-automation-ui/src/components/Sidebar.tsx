// components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { FiHome, FiPlay, FiLayers, FiGrid, FiList, FiDatabase, FiActivity } from 'react-icons/fi';
import './Sidebar.css';

export default function Sidebar() {
  const navItems = [
    { to: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/test-runs', icon: <FiActivity />, label: 'Test Runs' },
    { to: '/run', icon: <FiPlay />, label: 'Run Tests' },
    { to: '/functional-requirements', icon: <FiLayers />, label: 'Requirements' },
    { to: '/fixtures', icon: <FiGrid />, label: 'Fixtures' },
    { to: '/test-suites', icon: <FiLayers />, label: 'Test Suites' },
    { to: '/test-cases', icon: <FiList />, label: 'Test Cases' },
    { to: '/test-data-sets', icon: <FiDatabase />, label: 'Data Sets' },
  ];

  return (
    <aside className="sidebar-test-automation">
      <nav>
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink 
                to={item.to} 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}