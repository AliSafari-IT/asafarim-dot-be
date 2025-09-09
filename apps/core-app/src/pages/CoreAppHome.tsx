/* App Home Page */
import './CoreAppHome.css';
import './CoreAppHome.css';
import { Button, useAuth } from '@asafarim/shared-ui-react';
import { CORE_JOBS_URL, AI_URL, BLOG_URL, openInNewTab } from '../utils/appUrls';

export default function CoreAppHome() {
    const auth = useAuth();
    return (
        <div className='core-app-home-container'>
            <h1>Core App Home</h1>
            <p>Welcome to the Core Application</p>
            {auth.isAuthenticated ? (
                <>
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
                >Login</Button>
            )}
        </div>
    );
}