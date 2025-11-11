import React from 'react';

/**
 * Custom Root component for Docusaurus
 *
 * This component wraps the entire application.
 * We use the useAuth hook directly in components instead of a provider pattern.
 *
 * Docusaurus will automatically use this component as the root wrapper
 * for the entire application when placed in src/theme/Root.
 */
interface RootProps {
  children: React.ReactNode;
}

function Root({ children }: RootProps): React.ReactElement {
  return <React.Fragment>{children}</React.Fragment>;
}

export default Root;
