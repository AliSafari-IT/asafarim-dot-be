/* App Home Page */
import './CoreAppHome.css';
import { ButtonComponent as Button, useAuth, isProduction } from '@asafarim/shared-ui-react';
import { useNavigate } from 'react-router-dom';

import { CORE_JOBS_URL, AI_URL, BLOG_URL, openInNewTab } from '../utils/appUrls';
import Hero from '../components/Hero';

export default function CoreAppHome() {
    // Configure useAuth to use Core API proxy endpoints instead of Identity API directly
    const authApiBase = isProduction ? '/api/auth' : 'http://api.asafarim.local:5101/auth';

    const auth = useAuth({
        authApiBase,
        meEndpoint: '/me',
        tokenEndpoint: '/token',
        logoutEndpoint: '/logout'
    });
    const navigate = useNavigate();
    return (
        <div className='core-app-home-container'>
            <Hero />
            {auth.isAuthenticated ? (
                <>
                    <div className='core-app-home-greeting' style={{ marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0 }}>
                            {`Welcome, ${auth.user?.userName || auth.user?.email || 'friend'}`}
                        </h2>
                        <div style={{ marginTop: '.5rem' }}>
                            <Button
                                onClick={() => navigate('/jobs')}
                                variant="secondary"
                                size="md"
                                rounded
                                rightIcon="➡️"
                            >
                                Go to your dashboard
                            </Button>
                        </div>
                    </div>
                    <div className='core-app-home-actions'>
                        <Button className='core-app-home-action-button'
                            onClick={() => openInNewTab(CORE_JOBS_URL)}
                            variant="primary"
                            size="lg"
                            rounded
                            rightIcon="💼"
                        >Jobs</Button>
                        <Button className='core-app-home-action-button'
                            onClick={() => openInNewTab(AI_URL)}
                            variant="primary"
                            size="lg"
                            rounded
                            rightIcon="🤖"
                        >AI</Button>
                        <Button className='core-app-home-action-button'
                            onClick={() => openInNewTab(BLOG_URL)}
                            variant="primary"
                            size="lg"
                            rounded
                            rightIcon="📝"
                        >Blog</Button>
                    </div>
                </>
            ) : (
                <Button onClick={() => auth.signIn()}
                    variant="primary"
                    size="lg"
                    rounded
                    rightIcon="🔒"
                >Log in to personalize</Button>
            )}
        </div>
    );
}