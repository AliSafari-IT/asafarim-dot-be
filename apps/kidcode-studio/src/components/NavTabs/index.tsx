import { NavLink } from "react-router-dom";
import { Palette, Film, Puzzle, Music, Camera } from "lucide-react";
import "./NavTabs.css";

const tabs = [
  { path: "/drawing", label: "Drawing", icon: Palette, emoji: "🖌️" },
  { path: "/story", label: "Story", icon: Film, emoji: "🎬" },
  { path: "/puzzle", label: "Puzzle", icon: Puzzle, emoji: "🧩" },
  { path: "/music", label: "Music", icon: Music, emoji: "🎵" },
  { path: "/photo-album", label: "Album", icon: Camera, emoji: "📸" },
];

export default function NavTabs() {
  return (
    <nav className="nav-tabs">
      <NavLink to="/" className="nav-tab home-tab">
        <span className="tab-emoji">🏠</span>
        <span className="tab-label">Home</span>
      </NavLink>
      {tabs.map(({ path, label, emoji }) => (
        <NavLink key={path} to={path} className="nav-tab">
          <span className="tab-emoji">{emoji}</span>
          <span className="tab-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
