import { useCallback } from 'react';
import { SignOut } from '../../svg-icons';
import { ButtonComponent } from '../Button/ButtonComponent';

interface CentralSignOutProps {
  children?: React.ReactNode;
  className?: string;
  onSignOut?: () => void | Promise<void>;
}

export const CentralSignOut = ({ 
  children = 'Sign Out',
  className = '',
  onSignOut
}: CentralSignOutProps) => {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const handleSignOut = useCallback(async () => {
    try {
      // Call the provided onSignOut handler
      await onSignOut?.();
    } catch (error) {
      console.error('Sign out error:', error);
      // Optionally redirect to home on error
      window.location.href = '/';
    }
  }, [onSignOut]);

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