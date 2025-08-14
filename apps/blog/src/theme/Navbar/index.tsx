import React from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import AuthStatus from '../../components/AuthStatus';
import styles from './styles.module.css';

/**
 * Custom Navbar component
 * 
 * Extends the original Docusaurus Navbar to include the AuthStatus component
 * for displaying authentication status and sign-out functionality.
 */
export default function Navbar(props): React.ReactElement {
  return (
    <>
      <OriginalNavbar {...props} />
      <div className={styles.authStatusContainer}>
        <AuthStatus />
      </div>
    </>
  );
}
