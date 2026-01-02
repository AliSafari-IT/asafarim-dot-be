import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Home, CheckSquare, BookOpen, TrendingUp, Users, LogOut, Zap, Award, Settings, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';
import { ThemeToggle } from '@asafarim/react-themes';

export default function Navbar() {
    const { isAuthenticated, user, signOut } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!isAuthenticated) {
        return null;
    }

    const navItems = [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
        { path: '/learning', icon: BookOpen, label: 'Learn' },
        { path: '/practice', icon: Zap, label: 'Practice' },
        { path: '/rewards', icon: Award, label: 'Rewards' },
        { path: '/practice-manager', icon: Settings, label: 'Practice Manager' },
        { path: '/practice-dashboard', icon: BarChart3, label: 'Practice Dashboard' },
        { path: '/progress', icon: TrendingUp, label: 'Progress' },
        { path: '/family', icon: Users, label: 'Family' },
    ];

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="navbar" data-testid="navbar">
            <div className="navbar-container" data-testid="navbar-container">
                <div className="navbar-brand" data-testid="navbar-brand">
                    <Link to="/">
                        <h1>SmartPath</h1>
                    </Link>
                </div>

                <button 
                    className="navbar-hamburger" 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                    data-testid="navbar-hamburger"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`navbar-menu-wrapper ${isMobileMenuOpen ? 'open' : ''}`} data-testid="navbar-menu-wrapper">
                    <ul className="navbar-menu" data-testid="navbar-menu">
                        {navItems.map((item) => (
                            <li key={item.path} className={location.pathname === item.path ? 'active' : ''} data-testid={`navbar-item-${item.path}`}>
                                <Link to={item.path} onClick={handleLinkClick}>
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="navbar-user" data-testid="navbar-user">
                    <span className="user-name" data-testid="user-name">{user?.displayName}</span>
                    <ThemeToggle variant='ghost'/>
                    <button onClick={() => signOut()} className="logout-btn" title="Logout" data-testid="logout-btn">
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div 
                    className="navbar-overlay" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    data-testid="navbar-overlay"
                />
            )}
        </nav>
    );
}
