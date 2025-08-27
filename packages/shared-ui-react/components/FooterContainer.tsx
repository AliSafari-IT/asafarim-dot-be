import type { PropsWithChildren } from 'react';
import './footer.css';

export default function FooterContainer({children}: PropsWithChildren) {
    return (
      <footer className="footer">
        {children}
        {!children && (
          <div className="footer-content">
            {new Date().getFullYear()} ASafariM — All rights reserved.
          </div>
        )}
      </footer>
    );
}