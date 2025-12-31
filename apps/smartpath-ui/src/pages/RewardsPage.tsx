import { useEffect, useState } from 'react';
import { Award, Flame } from 'lucide-react';
import practiceApi from '../api/practiceApi';
import type { UserAchievement, ChildPracticeSummary } from '../api/practiceApi';
import smartpathService from '../api/smartpathService';
import './RewardsPage.css';

export default function RewardsPage() {
  const [summary, setSummary] = useState<ChildPracticeSummary | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const me = await smartpathService.users.me();
      setUserId(me.data.userId);

      const summaryData = await practiceApi.getChildSummary(me.data.userId);
      setSummary(summaryData);

      const achievementsData = await practiceApi.getChildAchievements(me.data.userId);
      setAchievements(achievementsData);
    } catch (err) {
      console.error('Failed to load rewards:', err);
      setError('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading" data-testid="rewards-loading">Loading...</div>;
  }

  return (
    <div className="rewards-page container" data-testid="rewards-page">
      <header className="page-header" data-testid="rewards-header">
        <div>
          <h1>Rewards & Achievements</h1>
          <p>Track your progress and earned achievements</p>
        </div>
      </header>

      {error && (
        <div className="error-banner" data-testid="rewards-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {summary && (
        <>
          <div className="stats-grid" data-testid="stats-grid">
            <div className="stat-card" data-testid="stat-points">
              <h3>Total Points</h3>
              <p className="stat-value">{summary.totalPoints}</p>
            </div>
            <div className="stat-card" data-testid="stat-sessions">
              <h3>Sessions</h3>
              <p className="stat-value">{summary.sessionsCount}</p>
            </div>
            <div className="stat-card" data-testid="stat-accuracy">
              <h3>Accuracy</h3>
              <p className="stat-value">{(summary.correctRate * 100).toFixed(0)}%</p>
            </div>
            <div className="stat-card streak" data-testid="stat-streak">
              <Flame size={32} className="flame-icon" />
              <h3>Current Streak</h3>
              <p className="stat-value">{summary.currentStreak}</p>
              <p className="stat-label">days</p>
            </div>
          </div>

          <div className="achievements-section" data-testid="achievements-section">
            <h2>Achievements</h2>
            {achievements.length === 0 ? (
              <div className="empty-state" data-testid="achievements-empty">
                <Award size={48} />
                <p>No achievements yet. Keep practicing!</p>
              </div>
            ) : (
              <div className="achievements-grid" data-testid="achievements-grid">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="achievement-card"
                    data-testid={`achievement-${achievement.achievement.key}`}
                  >
                    <div className="achievement-icon">{achievement.achievement.icon}</div>
                    <h3>{achievement.achievement.title}</h3>
                    <p>{achievement.achievement.description}</p>
                    <span className="achievement-points">+{achievement.achievement.points} pts</span>
                    <p className="achievement-date">
                      {new Date(achievement.awardedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
