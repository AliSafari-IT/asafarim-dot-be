import { useNavigate } from 'react-router-dom';
import { Hero } from '@asafarim/shared-ui-react';
import LoginForm from './LoginForm';
import PasswordSetupForm from './PasswordSetupForm';
import './login-hero.css';

interface LoginHeroProps {
  passwordSetupRequired?: {
    userId: string;
    email: string;
  } | null;
  returnUrl?: string | null;
}

export const LoginHero = ({ passwordSetupRequired, returnUrl }: LoginHeroProps) => {
  const navigate = useNavigate();
  const kicker = "ASafariM • Identity Portal";
  const title = "Welcome Back";
  const subtitle = "Sign in to access your personalized workspace and all connected applications";
  const bullets = [
    "Single sign-on across all ASafariM services",
    "Secure, encrypted authentication",
    "Manage your profile and security settings",
  ];
  
  const primaryCta = {
    label: "Learn More",
    href: import.meta.env.VITE_APP_ENV === 'production' ? 'https://www.asafarim.be/about' : 'http://web.asafarim.local:5175/about',
  };
  
  const secondaryCta = {
    label: "Register",
    to: "/register",
  };

  // Determine which form to show
  const mediaContent = passwordSetupRequired ? (
    <div className="login-hero-media">
      <PasswordSetupForm 
        userId={passwordSetupRequired.userId}
        email={passwordSetupRequired.email}
        onSuccess={() => {
          // Prevent infinite loop: if returnUrl points to login page, use dashboard instead
          let redirectUrl = returnUrl;
          const isReturnUrlLoginPage = returnUrl && (
            returnUrl === '/login' || 
            returnUrl.endsWith('/login') ||
            returnUrl.includes('/login?') ||
            returnUrl.includes('/login#')
          );
          
          if (isReturnUrlLoginPage) {
            console.log('⚠️ returnUrl points to login page, redirecting to dashboard instead');
            redirectUrl = null; // Will use default '/dashboard'
          }
          
          // Check if returnUrl is an external URL
          if (redirectUrl && (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://'))) {
            console.log('Redirecting to external URL after password setup:', redirectUrl);
            window.location.href = redirectUrl;
          } else {
            // Internal navigation using React Router
            console.log('Navigating to internal path after password setup:', redirectUrl || '/dashboard');
            navigate(redirectUrl || '/dashboard', { replace: true });
          }
        }}
        onCancel={() => {
          // Go back to login form
          window.location.reload();
        }}
      />
    </div>
  ) : (
    <div className="login-hero-media">
      <LoginForm />
    </div>
  );

  return (
    <div data-testid="login-hero">
      <Hero
        className="login-hero"
        kicker={kicker}
        title={title}
        subtitle={subtitle}
        bullets={bullets}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        media={mediaContent}
      />
    </div>
  );
};

export default LoginHero;
