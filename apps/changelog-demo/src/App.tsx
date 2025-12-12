import { useState } from "react";
import { DemoPage } from "./pages/DemoPage";
import "./index.css";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>@asafarim/changelog-timeline</h1>
          <p>Demo Application</p>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>
      <main className="app-main">
        <DemoPage />
      </main>
      <footer className="app-footer">
        <p>Built with ASafariM Design Tokens • MIT License</p>
      </footer>
    </div>
  );
}

export default App;
