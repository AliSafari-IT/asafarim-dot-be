import { useEffect, useState } from "react";
import {
  getLeaderboard,
  type LeaderboardResponse,
} from "../../services/gameProgressService";
import "./Leaderboard.css";
import { Trophy, Star, TrendingUp } from "lucide-react";

interface LeaderboardProps {
  mode?: string;
  period?: string;
  limit?: number;
}

export default function Leaderboard({
  mode = "Overall",
  period = "AllTime",
  limit = 10,
}: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState(mode);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedMode, selectedPeriod]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLeaderboard(selectedMode, selectedPeriod, limit);
      setData(result);
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  if (loading) {
    return (
      <div className="leaderboard">
        <div className="leaderboard-header">
          <Trophy size={24} />
          <h2>Top Players</h2>
        </div>
        <div className="leaderboard-loading">
          <span className="loading-spinner">⏳</span>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard">
        <div className="leaderboard-header">
          <Trophy size={24} />
          <h2>Top Players</h2>
        </div>
        <div className="leaderboard-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <Trophy size={24} />
        <h2>🏆 Top Players</h2>
      </div>

      <div className="leaderboard-filters">
        <div className="filter-group">
          <label>Mode:</label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
          >
            <option value="Overall">Overall</option>
            <option value="Drawing">Drawing</option>
            <option value="Story">Story</option>
            <option value="Puzzle">Puzzle</option>
            <option value="Music">Music</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="AllTime">All Time</option>
            <option value="Month">This Month</option>
            <option value="Week">This Week</option>
          </select>
        </div>
      </div>

      <div className="leaderboard-list">
        {data?.entries.map((entry) => (
          <div
            key={entry.userId}
            className={`leaderboard-entry ${
              entry.rank <= 3 ? "top-three" : ""
            } ${
              data.currentUserEntry?.userId === entry.userId
                ? "current-user"
                : ""
            }`}
          >
            <div className="entry-rank">
              <span className="rank-badge">{getMedalEmoji(entry.rank)}</span>
            </div>
            <div className="entry-info">
              <div className="entry-username">{entry.username}</div>
              <div className="entry-stats">
                <span className="stat">
                  <Star size={14} />
                  {entry.totalStarsEarned}
                </span>
                <span className="stat">
                  <TrendingUp size={14} />
                  Level {entry.level}
                </span>
              </div>
            </div>
            <div className="entry-score">{entry.score.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {data?.currentUserEntry &&
        !data.entries.some(
          (e) => e.userId === data.currentUserEntry?.userId
        ) && (
          <div className="current-user-position">
            <div className="divider">
              <span>Your Position</span>
            </div>
            <div className="leaderboard-entry current-user">
              <div className="entry-rank">
                <span className="rank-badge">
                  #{data.currentUserEntry.rank}
                </span>
              </div>
              <div className="entry-info">
                <div className="entry-username">
                  {data.currentUserEntry.username}
                </div>
                <div className="entry-stats">
                  <span className="stat">
                    <Star size={14} />
                    {data.currentUserEntry.totalStarsEarned}
                  </span>
                  <span className="stat">
                    <TrendingUp size={14} />
                    Level {data.currentUserEntry.level}
                  </span>
                </div>
              </div>
              <div className="entry-score">
                {data.currentUserEntry.score.toLocaleString()}
              </div>
            </div>
          </div>
        )}

      <div className="leaderboard-footer">
        <p>{data?.totalPlayers.toLocaleString()} players competing</p>
      </div>
    </div>
  );
}
