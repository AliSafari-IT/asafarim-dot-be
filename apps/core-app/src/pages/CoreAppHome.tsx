/* App Home Page */
import './CoreAppHome.css';
import './CoreAppHome.css';
import { useAuth } from '@asafarim/shared-ui-react';

export default function CoreAppHome() {
    const auth = useAuth();
    return (
        <div className='core-app-home-container'>
            <h1>Core App Home</h1>
            <p>Welcome to the Core Application</p>
            {auth.isAuthenticated ? (
                <>
                    <div className='core-app-home-actions'>
                        <button className='core-app-home-action-button' onClick={() => window.open('http://core.asafarim.local:5174/jobs', '_blank')}>Jobs</button>
                        <button className='core-app-home-action-button' onClick={() => window.open('http://ai.asafarim.local:5173', '_blank')}>AI</button>
                        <button className='core-app-home-action-button' onClick={() => window.open('http://blog.asafarim.local:3000', '_blank')}>Blog</button>
                    </div>
                </>
            ) : (
                <button className='core-app-home-action-button' onClick={() => auth.signIn()}>Login</button>
            )}
        </div>
    );
}