import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../core/state/useStore";
import { storage } from "../../services/storage";
import type { Project } from "../../types/project";
import "./Home.css";

const modeEmojis: Record<string, string> = {
  drawing: "🖌️",
  story: "🎬",
  puzzle: "🧩",
  music: "🎵",
};

const modeLinks: Record<string, string> = {
  drawing: "/drawing",
  story: "/story",
  puzzle: "/puzzle",
  music: "/music",
};

export default function Home() {
  const projects = useStore((state) => state.projects);
  const setProjects = useStore((state) => state.setProjects);
  const progress = useStore((state) => state.progress);
  const setProgress = useStore((state) => state.setProgress);
  const dailyChallenge = useStore((state) => state.dailyChallenge);
  const setDailyChallenge = useStore((state) => state.setDailyChallenge);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [savedProjects, savedProgress] = await Promise.all([
          storage.getAllProjects(),
          storage.getOrCreateProgress("guest"),
        ]);
        setProjects(savedProjects);
        setProgress(savedProgress);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [setProjects, setProgress, setDailyChallenge]);

  if (loading) {
    return (
      <div className="home loading">
        <div className="loading-spinner">🎨</div>
        <p>Loading your creative space...</p>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="hero">
        <h1 className="hero-title">
          Welcome to <span className="highlight">KidCode Studio</span>! ✨
        </h1>
        <p className="hero-subtitle">
          Create amazing art, stories, puzzles, and music with magical blocks!
        </p>
      </section>

      <section className="quick-start">
        <h2>🚀 Start Creating</h2>
        <div className="mode-cards">
          <Link to="/drawing" className="mode-card drawing">
            <span className="mode-emoji">🖌️</span>
            <h3>Drawing Studio</h3>
            <p>Draw shapes and patterns with magic blocks!</p>
          </Link>
          <Link to="/story" className="mode-card story">
            <span className="mode-emoji">🎬</span>
            <h3>Story Mode</h3>
            <p>Bring characters to life with animations!</p>
          </Link>
          <Link to="/puzzle" className="mode-card puzzle">
            <span className="mode-emoji">🧩</span>
            <h3>Puzzle Adventures</h3>
            <p>Solve mazes with code!</p>
          </Link>
          <Link to="/music" className="mode-card music">
            <span className="mode-emoji">🎵</span>
            <h3>Music Blocks</h3>
            <p>Create melodies and beats!</p>
          </Link>
        </div>
      </section>

      {progress && (
        <section className="progress-section">
          <h2>⭐ Your Progress</h2>
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-value">{progress.totalStickers}</span>
              <span className="stat-label">Stickers</span>
            </div>
            <div className="stat">
              <span className="stat-value">{progress.badges.length}</span>
              <span className="stat-label">Badges</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {progress.completedChallenges.length}
              </span>
              <span className="stat-label">Challenges</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                Level {Math.max(...progress.unlockedLevels)}
              </span>
              <span className="stat-label">Current Level</span>
            </div>
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="projects-section">
          <h2>📁 My Projects</h2>
          <div className="project-cards">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project.id}
                to={modeLinks[project.mode]}
                className="project-card"
              >
                <span className="project-emoji">
                  {modeEmojis[project.mode]}
                </span>
                <h4>{project.title}</h4>
                <p className="project-date">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {dailyChallenge && (
        <section className="daily-challenge">
          <h2>🌟 Daily Challenge</h2>
          <div className="challenge-card">
            <span className="challenge-emoji">
              {modeEmojis[dailyChallenge.mode]}
            </span>
            <div className="challenge-info">
              <h3>{dailyChallenge.title}</h3>
              <p>{dailyChallenge.prompt}</p>
            </div>
            <Link to={modeLinks[dailyChallenge.mode]} className="btn-primary">
              Try it! 🎯
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
