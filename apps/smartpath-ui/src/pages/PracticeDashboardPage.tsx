import { useEffect, useState } from 'react';
import { TrendingUp, Flame, Target } from 'lucide-react';
import practiceApi, { PracticeDashboard, ChildDashboard } from '../api/practiceApi';
import smartpathService from '../api/smartpathService';
import './PracticeDashboardPage.css';

export default function PracticeDashboardPage() {
  const [families, setFamilies] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [dashboard, setDashboard] = useState<PracticeDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      const familiesData = await smartpathService.families.getMyFamilies();
      setFamilies(Array.isArray(familiesData.data) ? familiesData.data : []);
    } catch (err) {
      console.error('Failed to load families:', err);
      setError('Failed to load families');
    }
  };

  const loadDashboard = async (familyId: number) => {
    try {
      setLoading(true);
      const dashboardData = await practiceApi.getFamilyDashboard(familyId);
      setDashboard(dashboardData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFamily = (familyId: number) => {
    setSelectedFamily(familyId);
    loadDashboard(familyId);
  };

  return (
    <div className="practice-dashboard-page container" data-testid="practice-dashboard-page">
      <header className="page-header" data-testid="practice-dashboard-header">
        <div>
          <h1>Practice Dashboard</h1>
          <p>Monitor child practice performance and progress</p>
        </div>
      </header>

      {error && (
        <div className="error-banner" data-testid="dashboard-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="dashboard-controls" data-testid="dashboard-controls">
        <div className="form-group">
          <label htmlFor="family">Family:</label>
          <select
            id="family"
            value={selectedFamily || ''}
            onChange={(e) => handleSelectFamily(parseInt(e.target.value))}
            data-testid="family-select"
          >
            <option value="">Select family</option>
            {families.map((family) => (
              <option key={family.familyId} value={family.familyId}>
                {family.familyName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading" data-testid="dashboard-loading">
          Loading dashboard...
        </div>
      ) : dashboard && dashboard.children.length > 0 ? (
        <div className="dashboard-content" data-testid="dashboard-content">
          {dashboard.children.map((child) => (
            <div key={child.childUserId} className="child-card" data-testid={`child-${child.childUserId}`}>
              <div className="card-header">
                <h2>{child.childName}</h2>
              </div>

              <div className="stats-grid" data-testid={`stats-${child.childUserId}`}>
                <div className="stat-item">
                  <div className="stat-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Total Points</p>
                    <p className="stat-value">{child.totalPoints}</p>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon flame">
                    <Flame size={24} />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Current Streak</p>
                    <p className="stat-value">{child.currentStreak} days</p>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon">
                    <Target size={24} />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">Accuracy</p>
                    <p className="stat-value">{(child.accuracy * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              <div className="attempts-section" data-testid={`attempts-${child.childUserId}`}>
                <h3>Recent Attempts</h3>
                {child.recentAttempts.length === 0 ? (
                  <p className="empty-state">No attempts yet</p>
                ) : (
                  <div className="attempts-list">
                    {child.recentAttempts.map((attempt) => (
                      <div key={attempt.attemptId} className="attempt-item" data-testid={`attempt-${attempt.attemptId}`}>
                        <div className="attempt-info">
                          <p className="attempt-question">{attempt.questionPreview}</p>
                          <p className="attempt-lesson">{attempt.lessonTitle}</p>
                        </div>
                        <div className="attempt-result">
                          <span className={`badge ${attempt.isCorrect ? 'correct' : 'incorrect'}`}>
                            {attempt.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                          <span className="attempt-points">+{attempt.pointsAwarded}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="weak-lessons-section" data-testid={`weak-lessons-${child.childUserId}`}>
                <h3>Lessons to Focus On</h3>
                {child.weakLessons.length === 0 ? (
                  <p className="empty-state">All lessons mastered!</p>
                ) : (
                  <div className="lessons-list">
                    {child.weakLessons.map((lesson) => (
                      <div key={lesson.lessonId} className="lesson-item" data-testid={`lesson-${lesson.lessonId}`}>
                        <div className="lesson-info">
                          <p className="lesson-title">{lesson.lessonTitle}</p>
                          <p className="lesson-attempts">{lesson.attemptCount} attempts</p>
                        </div>
                        <div className="lesson-accuracy">
                          <div className="accuracy-bar">
                            <div
                              className="accuracy-fill"
                              style={{ width: `${lesson.accuracy * 100}%` }}
                            ></div>
                          </div>
                          <span className="accuracy-text">{(lesson.accuracy * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : selectedFamily ? (
        <div className="empty-state-large" data-testid="dashboard-empty">
          <p>No practice data available for this family yet.</p>
        </div>
      ) : null}
    </div>
  );
}
