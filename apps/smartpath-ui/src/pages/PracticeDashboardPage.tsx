import { useEffect, useState } from 'react';
import { TrendingUp, Flame, Target, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import practiceApi, { PracticeDashboard, ChildDashboard } from '../api/practiceApi';
import smartpathService from '../api/smartpathService';
import './PracticeDashboardPage.css';

export default function PracticeDashboardPage() {
  const [families, setFamilies] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [dashboard, setDashboard] = useState<PracticeDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedAttempts, setExpandedAttempts] = useState<Set<number>>(new Set());
  const [modalChild, setModalChild] = useState<ChildDashboard | null>(null);

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
    setExpandedAttempts(new Set());
    setModalChild(null);
    loadDashboard(familyId);
  };

  const toggleAttempts = (childId: number) => {
    setExpandedAttempts(prev => {
      const next = new Set(prev);
      if (next.has(childId)) {
        next.delete(childId);
      } else {
        next.add(childId);
      }
      return next;
    });
  };

  const openModal = (child: ChildDashboard) => {
    setModalChild(child);
  };

  const closeModal = () => {
    setModalChild(null);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalChild) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modalChild]);

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
                    <p className="stat-value">
                      {child.totalPoints} / {child.maxPossiblePoints}
                      {child.maxPossiblePoints > 0 && (
                        <span className="stat-percentage">
                          {' '}({Math.round((child.totalPoints / child.maxPossiblePoints) * 100)}%)
                        </span>
                      )}
                    </p>
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
                <div className="attempts-header">
                  <h3>Recent Attempts</h3>
                  <div className="attempts-actions">
                    {child.recentAttempts.length > 5 && (
                      <button
                        className="btn-icon"
                        onClick={() => openModal(child)}
                        title="View all attempts"
                        aria-label="View all attempts"
                      >
                        <Maximize2 size={18} />
                      </button>
                    )}
                    {child.recentAttempts.length > 0 && (
                      <button
                        className="btn-icon"
                        onClick={() => toggleAttempts(child.childUserId)}
                        aria-label={expandedAttempts.has(child.childUserId) ? 'Collapse attempts' : 'Expand attempts'}
                      >
                        {expandedAttempts.has(child.childUserId) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    )}
                  </div>
                </div>
                {child.recentAttempts.length === 0 ? (
                  <p className="empty-state">No attempts yet</p>
                ) : (
                  <div className={`attempts-list ${expandedAttempts.has(child.childUserId) ? 'expanded' : 'collapsed'}`}>
                    {child.recentAttempts.slice(0, expandedAttempts.has(child.childUserId) ? undefined : 5).map((attempt) => (
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

      {modalChild && (
        <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="modal-title">{modalChild.childName} - All Attempts</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close modal">×</button>
            </div>
            <div className="modal-body">
              <div className="attempts-list-modal">
                {modalChild.recentAttempts.map((attempt) => (
                  <div key={attempt.attemptId} className="attempt-item" data-testid={`modal-attempt-${attempt.attemptId}`}>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
