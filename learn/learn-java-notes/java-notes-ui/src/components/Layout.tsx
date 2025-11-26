import React from "react";
import "./Layout.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  const noteCount = React.useMemo(() => {
    // This will be updated when we pass the actual count from NotesList
    return 0;
  }, []);

  return (
    <div className="layout">
      <div className="layout-background">
        <div className="layout-pattern"></div>
      </div>
      <div className="layout-container">
        <header className="layout-header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">📚</div>
              <h1 className="logo-text">Study Notes</h1>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{noteCount}</span>
                <span className="stat-label">Notes</span>
              </div>
            </div>
          </div>
        </header>
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
}
