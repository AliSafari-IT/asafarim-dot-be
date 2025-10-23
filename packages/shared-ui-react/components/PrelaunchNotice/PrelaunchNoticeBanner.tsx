import { PrelaunchNotice } from './PrelaunchNotice';

/**
 * PrelaunchNoticeBanner - A wrapper component for displaying the prelaunch notice
 * directly below the navbar for maximum visibility.
 * 
 * Usage:
 * ```tsx
 * import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';
 * 
 * function App() {
 *   return (
 *     <>
 *       <Navbar />
 *       <PrelaunchNoticeBanner />
 *       <main>{children}</main>
 *     </>
 *   );
 * }
 * ```
 */
export function PrelaunchNoticeBanner() {
  return <PrelaunchNotice position="navbar" storageKey="prelaunchBannerDismissed" />;
}
