/* App Home Page */
import './CoreAppHome.css';
import './CoreAppHome.css';
import { Button, useAuth } from '@asafarim/shared-ui-react';

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
                            onClick={() => window.open('http://core.asafarim.local:5174/jobs', '_blank')}
                            variant="primary"
                            size="lg"
                            rounded
                            rightIcon="💼"
                        >Jobs</Button>
                        <Button className='core-app-home-action-button'
                            onClick={() => window.open('http://ai.asafarim.local:5173', '_blank')}
                            variant="primary"
                            size="lg"
                            rounded
                            rightIcon="🤖"
                        >AI</Button>
                        <Button className='core-app-home-action-button'
                            onClick={() => window.open('http://blog.asafarim.local:3000', '_blank')}
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