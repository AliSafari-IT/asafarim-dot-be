import { Hero } from '@asafarim/shared-ui-react';
import RegisterForm from './RegisterForm';
import './login-hero.css';

export const RegisterHero = () => {
  const kicker = "Identity Portal";
  const title = "Create Account";
  const subtitle = "Sign up to get started with ASafariM";
  const bullets = [
    "Single sign-on for all ASafariM applications",
    "Personalized dashboard and settings",
    "Access to exclusive content and features",
  ];
  
  const primaryCta = {
    label: "Learn More",
    href: "https://www.asafarim.com/about",
  };
  
  const secondaryCta = {
    label: "Sign In",
    to: "/login",
  };

  const mediaContent = (
    <div className="login-hero-media">
      <RegisterForm />
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

export default RegisterHero;
