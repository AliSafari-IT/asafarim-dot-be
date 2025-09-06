import { useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../Button';
import { SignIn } from '../../svg-icons';

interface CentralSignInProps {
  children?: React.ReactNode;
  className?: string;
  onSignIn?: (redirectUrl?: string) => void;
}

export const CentralSignIn = ({
  children = 'Sign In',
  className = '',
  onSignIn,
}: CentralSignInProps) => {
  const { signIn } = useAuth();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const handleSignIn = useCallback(async () => {
    const redirectTo = typeof window !== 'undefined' ? window.location.href : undefined;
    try {
      // Let consumer run any pre-signin logic (analytics, etc.)
      onSignIn?.(redirectTo);

      // Perform the actual sign in (will redirect to identity portal)
      await signIn(redirectTo);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  }, [signIn, onSignIn]);

  return (
    <Button
      onClick={handleSignIn}
      className={className}
      variant="ghost"
      rightIcon={<SignIn />}
    >
      {isMobile ? '' : children}
    </Button>
  );
};

export default CentralSignIn;
