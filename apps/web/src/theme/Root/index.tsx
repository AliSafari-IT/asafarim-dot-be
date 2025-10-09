import React from 'react';
import { AuthSyncProvider } from '@asafarim/shared-ui-react';

/**
 * Custom Root component for Docusaurus
 *
 * This component wraps the entire application with our AuthSyncProvider
 * to enable cross-app authentication synchronization.
 *
 * Docusaurus will automatically use this component as the root wrapper
 * for the entire application when placed in src/theme/Root.
 */
interface RootProps {
  children: React.ReactNode;
}

function Root({ children }: RootProps): React.ReactElement {
  return (
    <React.Fragment>
      <AuthSyncProvider children={children} key={"auth-sync-provider"} />
    </React.Fragment>
  );
}

export default Root;
