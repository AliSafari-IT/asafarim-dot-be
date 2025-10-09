import { useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SignOut } from '../../svg-icons';
import { ButtonComponent } from '../Button/ButtonComponent';

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
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

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
    <ButtonComponent 
      onClick={handleSignOut}
      className={className}
      variant="ghost"
      rightIcon={<SignOut />}
    >
      {isMobile ? "" : children}
    </ButtonComponent>
  );
};

export default CentralSignOut;