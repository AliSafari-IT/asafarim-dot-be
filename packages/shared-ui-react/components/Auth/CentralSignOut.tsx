import { useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';

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
    <button 
      onClick={handleSignOut}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
};

export default CentralSignOut;