import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, CheckSquare, BookOpen, TrendingUp, Users, LogOut } from 'lucide-react';
import './Navbar.css';
import { ThemeToggle } from '@asafarim/react-themes';

export default function Navbar() {
    const { isAuthenticated, user, signOut } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return null;
    }

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
        { path: '/learning', icon: BookOpen, label: 'Learn' },
        { path: '/progress', icon: TrendingUp, label: 'Progress' },
        { path: '/family', icon: Users, label: 'Family' },
    ];

    return (
        <nav className="navbar" data-testid="navbar">
            <div className="navbar-container" data-testid="navbar-container">
                <div className="navbar-brand" data-testid="navbar-brand">
                    <Link to="/">
                        <h1>SmartPath</h1>
                    </Link>
                </div>
                <ul className="navbar-menu" data-testid="navbar-menu">
                    {navItems.map((item) => (
                        <li key={item.path} className={location.pathname === item.path ? 'active' : ''} data-testid={`navbar-item-${item.path}`}>
                            <Link to={item.path}>
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="navbar-user" data-testid="navbar-user">
                    <span className="user-name" data-testid="user-name">{user?.displayName}</span>
                    <ThemeToggle variant='ghost'/>
                    <button onClick={() => signOut()} className="logout-btn" title="Logout" data-testid="logout-btn">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
