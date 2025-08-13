import { useContext } from 'react';
import { AuthContextCreated } from "../contexts/AuthContextCreated";

/**
 * Custom hook to access authentication context
 * @returns Authentication context values and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContextCreated);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
