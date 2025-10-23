# Prelaunch Notice - Usage Examples

## Quick Start Examples

### Example 1: React App (Vite/CRA)

```tsx
// src/App.tsx
import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <div className="app">
      <Navbar />
      <PrelaunchNoticeBanner />
      <main className="main-content">
        {/* Your app content */}
      </main>
    </div>
  );
}

export default App;
```

### Example 2: Next.js App

```tsx
// app/layout.tsx
import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';
import '@asafarim/shared-ui-react/dist/index.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav>{/* Your navbar */}</nav>
        <PrelaunchNoticeBanner />
        {children}
      </body>
    </html>
  );
}
```

### Example 3: Angular App with React Integration

```typescript
// src/app/app.component.ts
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { createRoot } from 'react-dom/client';
import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <div #prelaunchBanner></div>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  @ViewChild('prelaunchBanner', { static: true }) 
  prelaunchBanner!: ElementRef;

  ngOnInit() {
    const root = createRoot(this.prelaunchBanner.nativeElement);
    root.render(PrelaunchNoticeBanner());
  }
}
```

### Example 4: Docusaurus Blog

```tsx
// src/theme/Root.tsx
import React from 'react';
import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';

export default function Root({ children }) {
  return (
    <>
      <PrelaunchNoticeBanner />
      {children}
    </>
  );
}
```

### Example 5: Footer Notice (Less Intrusive)

```tsx
// src/components/Footer.tsx
import { PrelaunchNotice } from '@asafarim/shared-ui-react';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        {/* Footer links, copyright, etc. */}
      </div>
      <PrelaunchNotice position="footer" />
    </footer>
  );
}
```

## Advanced Examples

### Example 6: Conditional Display Based on Environment

```tsx
// src/App.tsx
import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';

function App() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isStaging = process.env.REACT_APP_ENV === 'staging';
  
  return (
    <div className="app">
      <Navbar />
      {(isDevelopment || isStaging) && <PrelaunchNoticeBanner />}
      <main>{/* Content */}</main>
    </div>
  );
}
```

### Example 7: Multiple Notices with Different Keys

```tsx
// Show different notices for different sections
import { PrelaunchNotice } from '@asafarim/shared-ui-react';

function App() {
  return (
    <>
      <Navbar />
      {/* Main app notice */}
      <PrelaunchNotice 
        position="navbar" 
        storageKey="mainAppNoticeDismissed" 
      />
      
      <main>{/* Content */}</main>
      
      <footer>
        {/* Footer notice with different key */}
        <PrelaunchNotice 
          position="footer" 
          storageKey="footerNoticeDismissed" 
        />
      </footer>
    </>
  );
}
```

### Example 8: Custom Wrapper with Analytics

```tsx
// src/components/TrackedPrelaunchBanner.tsx
import { PrelaunchNotice } from '@asafarim/shared-ui-react';
import { useEffect, useState } from 'react';

export function TrackedPrelaunchBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Track banner view
    if (visible) {
      analytics.track('Prelaunch Banner Viewed');
    }
  }, [visible]);

  useEffect(() => {
    // Check if dismissed
    const dismissed = localStorage.getItem('prelaunchBannerDismissed');
    if (dismissed === 'true') {
      setVisible(false);
      analytics.track('Prelaunch Banner Previously Dismissed');
    }
  }, []);

  if (!visible) return null;

  return <PrelaunchNotice position="navbar" />;
}
```

### Example 9: With Custom Dismiss Handler

```tsx
// src/components/CustomPrelaunchBanner.tsx
import { useState, useEffect } from 'react';
import './prelaunchNotice.css';

export function CustomPrelaunchBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('customBannerDismissed');
    if (stored === 'true') setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('customBannerDismissed', 'true');
    
    // Send to analytics
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event: 'banner_dismissed' })
    });
  };

  if (dismissed) return null;

  return (
    <div className="prelaunch-notice prelaunch-notice--navbar">
      {/* Custom content */}
      <button onClick={handleDismiss}>Dismiss</button>
    </div>
  );
}
```

### Example 10: Monorepo Setup (Multiple Apps)

```tsx
// apps/web/src/App.tsx
import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';

export function WebApp() {
  return (
    <>
      <Navbar appId="web" />
      <PrelaunchNoticeBanner />
      <Routes>{/* Web routes */}</Routes>
    </>
  );
}

// apps/core-app/src/App.tsx
import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';

export function CoreApp() {
  return (
    <>
      <Navbar appId="core" />
      <PrelaunchNoticeBanner />
      <Routes>{/* Core routes */}</Routes>
    </>
  );
}

// apps/ai-ui/src/App.tsx
import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';

export function AIApp() {
  return (
    <>
      <Navbar appId="ai" />
      <PrelaunchNoticeBanner />
      <Routes>{/* AI routes */}</Routes>
    </>
  );
}
```

## Styling Examples

### Example 11: Custom Colors

```css
/* Override navbar banner colors */
.prelaunch-notice--navbar {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.prelaunch-notice--navbar .prelaunch-notice__link {
  background-color: rgba(255, 255, 255, 0.25);
}

.prelaunch-notice--navbar .prelaunch-notice__link:hover {
  background-color: rgba(255, 255, 255, 0.35);
}
```

### Example 12: Custom Animation

```css
/* Add custom entrance animation */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.prelaunch-notice {
  animation: fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Testing Examples

### Example 13: Jest Test

```tsx
// PrelaunchBanner.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PrelaunchNoticeBanner } from '@asafarim/shared-ui-react';

describe('PrelaunchNoticeBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the banner', () => {
    render(<PrelaunchNoticeBanner />);
    expect(screen.getByText(/Early Access Preview/i)).toBeInTheDocument();
  });

  it('dismisses and persists to localStorage', () => {
    render(<PrelaunchNoticeBanner />);
    const dismissButton = screen.getByLabelText(/dismiss/i);
    
    fireEvent.click(dismissButton);
    
    expect(localStorage.getItem('prelaunchBannerDismissed')).toBe('true');
  });

  it('does not render when previously dismissed', () => {
    localStorage.setItem('prelaunchBannerDismissed', 'true');
    
    const { container } = render(<PrelaunchNoticeBanner />);
    
    expect(container.firstChild).toBeNull();
  });
});
```

### Example 14: Cypress E2E Test

```typescript
// cypress/e2e/prelaunch-banner.cy.ts
describe('Prelaunch Banner', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('displays the prelaunch banner', () => {
    cy.contains('Early Access Preview').should('be.visible');
    cy.contains('Report Issue').should('be.visible');
  });

  it('dismisses the banner and persists', () => {
    cy.get('[aria-label="Dismiss prelaunch notice"]').click();
    cy.contains('Early Access Preview').should('not.exist');
    
    // Verify localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('prelaunchBannerDismissed')).to.equal('true');
    });
    
    // Reload and verify it stays dismissed
    cy.reload();
    cy.contains('Early Access Preview').should('not.exist');
  });

  it('opens GitHub issues in new tab', () => {
    cy.get('a[href*="github.com"]')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer');
  });
});
```

## Troubleshooting

### Banner Not Showing?

1. Check `isPrelaunch` config:

```typescript
// packages/shared-ui-react/configs/isPrelaunch.ts
export const isPrelaunch = true; // Must be true
```

2. Check localStorage:

```javascript
// Clear dismissal state
localStorage.removeItem('prelaunchBannerDismissed');
```

3. Check CSS import:

```typescript
import '@asafarim/shared-ui-react/dist/index.css';
```

### Styling Issues?

1. Ensure CSS custom properties are defined
2. Check z-index conflicts
3. Verify theme tokens are loaded

### Version Not Showing?

Ensure `package.json` has a version field:

```json
{
  "version": "1.0.0"
}
```
