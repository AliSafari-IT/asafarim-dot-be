import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@asafarim/react-themes';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="auth-container">
      <div className="auth-header">
        <Link to="/" className="auth-logo">
          <img src="/logo.svg" alt="ASafariM Logo" width="40" height="40" />
          <span>ASafariM Identity</span>
        </Link>
        <ThemeToggle showLabels={false} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer" }} />
      </div>
      
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        
        <div className="auth-card-content">
          {children}
        </div>
      </div>
      
      <div className="auth-footer">
        <p>&copy; {new Date().getFullYear()} ASafariM. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout;
