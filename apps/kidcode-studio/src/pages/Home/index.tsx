import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../core/state/useStore";
import { storage } from "../../services/storage";
import { api } from "../../services/apiClient";
import "./Home.css";
import { useAuth } from "@asafarim/shared-ui-react";

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
  const [leaderboards, setLeaderboards] = useState<{
    drawing: any[];
    story: any[];
    music: any[];
    puzzle: any[];
  }>({
    drawing: [],
    story: [],
    music: [],
    puzzle: [],
  });
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const [savedProjects, apiProgress] = await Promise.all([
          storage.getAllProjects(),
          api.progress.get().catch(() => null),
        ]);
        setProjects(savedProjects);
        if (apiProgress) {
          setProgress(apiProgress);
          localStorage.setItem("progress", JSON.stringify(apiProgress));
        } else {
          const localProgress = await storage.getOrCreateProgress("guest");
          setProgress(localProgress);
          localStorage.setItem("progress", JSON.stringify(localProgress));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [setProjects, setProgress, setDailyChallenge]);

  // Refresh progress every 2 seconds to catch updates from other components
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const apiProgress = await api.progress.get().catch(() => null);
        if (apiProgress) {
          setProgress(apiProgress);
          localStorage.setItem("progress", JSON.stringify(apiProgress));
        }
      } catch (error) {
        // Silently fail on refresh
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [setProgress]);

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

      {progress && isAuthenticated && (
        <section className="progress-section">
          <h2>⭐ Your Progress by Mode</h2>
          <div className="progress-modes">
            <div className="mode-progress">
              <h3>🖌️ Drawing</h3>
              <div className="mode-stats">
                <div className="stat">
                  <span className="stat-value">{progress.drawing.level}</span>
                  <span className="stat-label">Level</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{progress.drawing.stickers.length}</span>
                  <span className="stat-label">Stickers</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{progress.drawing.badges.length}</span>
                  <span className="stat-label">Badges</span>
                </div>
              </div>
            </div>
            <div className="mode-progress">
              <h3>🎬 Story</h3>
              <div className="mode-stats">
                <div className="stat">
                  <span className="stat-value">{progress.story.level}</span>
                  <span className="stat-label">Level</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{progress.story.stickers.length}</span>
                  <span className="stat-label">Stickers</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{progress.story.badges.length}</span>
                  <span className="stat-label">Badges</span>
                </div>
              </div>
            </div>
            <div className="mode-progress">
              <h3>🎵 Music</h3>
              <div className="mode-stats">
                <div className="stat">
                  <span className="stat-value">{progress.music.level}</span>
                  <span className="stat-label">Level</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{progress.music.stickers.length}</span>
                  <span className="stat-label">Stickers</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{progress.music.badges.length}</span>
                  <span className="stat-label">Badges</span>
                </div>
              </div>
            </div>
            <div className="mode-progress">
              <h3>🧩 Puzzle</h3>
              <div className="mode-stats">
                <div className="stat">
                  <span className="stat-value">{progress.puzzle.level}</span>
                  <span className="stat-label">Level</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{progress.puzzle.stickers.length}</span>
                  <span className="stat-label">Stickers</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{progress.puzzle.badges.length}</span>
                  <span className="stat-label">Badges</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {!isAuthenticated && (
        <section className="leaderboard-section">
          <h2>🏆 Top Creators</h2>
          <div className="leaderboard-container">
            <div className="leaderboard">
              <h3>🖌️ Drawing Masters</h3>
              <div className="leaderboard-list">
                {leaderboards.drawing.length > 0 ? (
                  leaderboards.drawing.map((entry) => (
                    <div key={entry.userId} className="leaderboard-entry">
                      <div className="entry-rank">#{entry.rank}</div>
                      <div className="entry-info">
                        <div className="entry-username">{entry.username || entry.userId}</div>
                        <div className="entry-stats">
                          Level {entry.level} • {entry.totalStarsEarned} ⭐
                        </div>
                      </div>
                      <div className="entry-score">{entry.score} pts</div>
                    </div>
                  ))
                ) : (
                  <p className="placeholder">No creators yet</p>
                )}
              </div>
            </div>
            <div className="leaderboard">
              <h3>🎬 Story Tellers</h3>
              <div className="leaderboard-list">
                {leaderboards.story.length > 0 ? (
                  leaderboards.story.map((entry) => (
                    <div key={entry.userId} className="leaderboard-entry">
                      <div className="entry-rank">#{entry.rank}</div>
                      <div className="entry-info">
                        <div className="entry-username">{entry.username || entry.userId}</div>
                        <div className="entry-stats">
                          Level {entry.level} • {entry.totalStarsEarned} ⭐
                        </div>
                      </div>
                      <div className="entry-score">{entry.score} pts</div>
                    </div>
                  ))
                ) : (
                  <p className="placeholder">No creators yet</p>
                )}
              </div>
            </div>
            <div className="leaderboard">
              <h3>🎵 Music Composers</h3>
              <div className="leaderboard-list">
                {leaderboards.music.length > 0 ? (
                  leaderboards.music.map((entry) => (
                    <div key={entry.userId} className="leaderboard-entry">
                      <div className="entry-rank">#{entry.rank}</div>
                      <div className="entry-info">
                        <div className="entry-username">{entry.username || entry.userId}</div>
                        <div className="entry-stats">
                          Level {entry.level} • {entry.totalStarsEarned} ⭐
                        </div>
                      </div>
                      <div className="entry-score">{entry.score} pts</div>
                    </div>
                  ))
                ) : (
                  <p className="placeholder">No creators yet</p>
                )}
              </div>
            </div>
            <div className="leaderboard">
              <h3>🧩 Puzzle Solvers</h3>
              <div className="leaderboard-list">
                {leaderboards.puzzle.length > 0 ? (
                  leaderboards.puzzle.map((entry) => (
                    <div key={entry.userId} className="leaderboard-entry">
                      <div className="entry-rank">#{entry.rank}</div>
                      <div className="entry-info">
                        <div className="entry-username">{entry.username || entry.userId}</div>
                        <div className="entry-stats">
                          Level {entry.level} • {entry.totalStarsEarned} ⭐
                        </div>
                      </div>
                      <div className="entry-score">{entry.score} pts</div>
                    </div>
                  ))
                ) : (
                  <p className="placeholder">No creators yet</p>
                )}
              </div>
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
