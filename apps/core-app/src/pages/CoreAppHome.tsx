/* App Home Page */
import { ButtonComponent as Button, useAuth, isProduction, Spark, Arrow } from '@asafarim/shared-ui-react';
import { useNavigate } from 'react-router-dom';
import { CORE_JOBS_URL, AI_URL, BLOG_URL } from '../utils/appUrls';
import Hero from '../components/Hero';
import './CoreAppHome.css';

export default function CoreAppHome() {
    // Configure useAuth to use Core API proxy endpoints instead of Identity API directly
    const authApiBase = isProduction ? '/api/auth' : 'http://identity.asafarim.local:5101/auth';

    const auth = useAuth({
        authApiBase,
        meEndpoint: '/me',
        tokenEndpoint: '/token',
        logoutEndpoint: '/logout'
    });
    const navigate = useNavigate();

    return (
        <section className="section">
            <Hero />            
            <div className="container">
                {auth.isAuthenticated && (
                    <div className="welcome-banner">
                        <h2 className="welcome-title">
                            Welcome back, {auth.user?.userName || auth.user?.email || 'Career Champion'}!
                        </h2>
                        <p className="welcome-subtitle">Your personalized job search dashboard awaits</p>
                        <Button
                            onClick={() => navigate('/jobs')}
                            variant="primary"
                            size="lg"
                            rounded
                            rightIcon="🚀"
                        >
                            Access Dashboard
                        </Button>
                    </div>
                )}

                <div className="features-grid">
                    <a href={CORE_JOBS_URL} className="feature-card">
                        <h3 className="feature-card-title">
                            <Spark /> Jobs Tracker
                        </h3>
                        <p className="feature-card-description">
                            Track applications and interviews. Angular UI • .NET • Jobs API
                        </p>
                        <span className="feature-card-link">
                            Open <Arrow />
                        </span>
                    </a>

                    <a href={AI_URL} className="feature-card">
                        <h3 className="feature-card-title">
                            <Spark /> AI
                        </h3>
                        <p className="feature-card-description">
                            AI with clean architecture, typed clients, and SSO
                        </p>
                        <span className="feature-card-link">
                            Open <Arrow />
                        </span>
                    </a>

                    <a href="/portfolio" className="feature-card">
                        <h3 className="feature-card-title">
                            <Spark /> Core Apps
                        </h3>
                        <p className="feature-card-description">
                            Users & Projects with clean architecture, typed clients, and SSO
                        </p>
                        <span className="feature-card-link">
                            Open <Arrow />
                        </span>
                    </a>

                    <a href={BLOG_URL} target="_blank" rel="noreferrer" className="feature-card">
                        <h3 className="feature-card-title">
                            <Spark /> Blog & Docs
                        </h3>
                        <p className="feature-card-description">
                            Docusaurus TS with shared header/footer and tokens
                        </p>
                        <span className="feature-card-link">
                            Open <Arrow />
                        </span>
                    </a>
                </div>

                {!auth.isAuthenticated && (
                    <div className="divider">
                        <h2 className="divider-title">Ready to Transform Your Job Search?</h2>
                        <p className="divider-description">
                            Join thousands of professionals who have streamlined their career journey
                        </p>
                        <div className="cta-buttons">
                            <Button
                                onClick={() => auth.signIn()}
                                variant="primary"
                                size="lg"
                                rounded
                                rightIcon="🚀"
                            >
                                Get Started Free
                            </Button>
                            <Button
                                onClick={() => navigate('/jobs')}
                                variant="outline"
                                size="lg"
                                rounded
                                rightIcon="👁️"
                            >
                                View Demo
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}