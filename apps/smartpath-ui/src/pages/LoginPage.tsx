import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

export default function LoginPage() {
    const { isAuthenticated, signIn } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = () => {
        const returnUrl = window.location.origin + '/';
        signIn(returnUrl);
    };

    return (
        <div className="login-page" data-testid="smartpath-login-page">
            <div className="login-container" data-testid="smartpath-login-container">
                <img src="logo.svg" alt="SmartPath Logo" width={100} data-testid="smartpath-logo"/>
                <h1 data-testid="smartpath-title">SmartPath</h1>
                <p data-testid="smartpath-description">Family Learning & Homework Tracker</p>
                <button onClick={handleLogin} className="login-btn" data-testid="smartpath-login-btn">
                    Sign In
                </button>
            </div>
        </div>
    );
}
