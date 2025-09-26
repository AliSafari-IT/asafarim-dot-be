import React from 'react';
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

export const LoginHero: React.FC<LoginHeroProps> = ({ passwordSetupRequired, returnUrl }) => {
  const navigate = useNavigate();
  const kicker = "Identity Portal";
  const title = "Welcome to ASafariM";
  const subtitle = "Access all your applications and services with a single account";
  const bullets = [
    "Secure authentication across all ASafariM apps",
    "Manage your profile and preferences",
    "Access your personalized dashboard",
  ];
  
  const primaryCta = {
    label: "Learn More",
    href: "https://www.asafarim.com/about",
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
          // Check if returnUrl is an external URL
          if (returnUrl && (returnUrl.startsWith('http://') || returnUrl.startsWith('https://'))) {
            console.log('Redirecting to external URL after password setup:', returnUrl);
            window.location.href = returnUrl;
          } else {
            // Internal navigation using React Router
            console.log('Navigating to internal path after password setup:', returnUrl || '/dashboard');
            navigate(returnUrl || '/dashboard', { replace: true });
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
  );
};

export default LoginHero;
