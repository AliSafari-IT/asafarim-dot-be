import { Outlet } from "react-router-dom";
import NavTabs from "../NavTabs";
import RewardPopup from "../RewardPopup";
import "./Layout.css";
import { ThemeToggle } from "@asafarim/react-themes";

export default function Layout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <div className="logo">
          <span className="logo-icon">🎨</span>
          <span className="logo-text">KidCode Studio</span>
        </div>
        <NavTabs />
        <ThemeToggle variant="ghost" />
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
      <RewardPopup />
    </div>
  );
}
