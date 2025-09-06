import { useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../Button';
import { SignOut } from '../../svg-icons';

interface CentralSignOutProps {
  children?: React.ReactNode;
  className?: string;
  onSignOut?: () => void;
}

export const CentralSignOut = ({ 
  children = 'Sign Out',
  className = '',
  onSignOut
}: CentralSignOutProps) => {
  const { signOut } = useAuth();
  const isMobile = window.innerWidth < 768;

  const handleSignOut = useCallback(async () => {
    try {
      // Call the original onSignOut if provided
      await onSignOut?.();
      
      // Perform the actual sign out
      await signOut(window.location.href);
    } catch (error) {
      console.error('Sign out error:', error);
      // Optionally redirect to home on error
      window.location.href = '/';
    }
  }, [signOut, onSignOut]);

  return (
    <Button 
      onClick={handleSignOut}
      className={className}
      variant="ghost"
      rightIcon={<SignOut />}
    >
      {isMobile ? "" : children}
    </Button>
  );
};

export default CentralSignOut;