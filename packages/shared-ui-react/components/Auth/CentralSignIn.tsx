import { useCallback } from 'react';
import { ButtonComponent } from '../Button/ButtonComponent';
import { SignIn } from '../../svg-icons';

interface CentralSignInProps {
  children?: React.ReactNode;
  className?: string;
  onSignIn?: (redirectUrl?: string) => void | Promise<void>;
}

export const CentralSignIn = ({
  children = 'Sign In',
  className = '',
  onSignIn,
}: CentralSignInProps) => {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const handleSignIn = useCallback(async () => {
    const redirectTo = typeof window !== 'undefined' ? window.location.href : undefined;
    try {
      // Call the provided onSignIn handler
      await onSignIn?.(redirectTo);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, [onSignIn]);

  return (
    <ButtonComponent
      onClick={handleSignIn}
      className={className}
      variant="ghost"
      rightIcon={<SignIn />}
    >
      {isMobile ? '' : children}
    </ButtonComponent>
  );
};

export default CentralSignIn;
