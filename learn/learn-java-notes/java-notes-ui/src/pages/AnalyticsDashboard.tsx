import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardAnalytics, type DashboardAnalytics } from "../api/notesApi";
import "./AnalyticsDashboard.css";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const data = await getDashboardAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner">📊</div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="analytics-error">
        <h2>⚠️ {error || "No analytics data available"}</h2>
        <Link to="/">← Back to Notes</Link>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <header className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Insights into your study notes</p>
      </header>

      {/* Summary Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <span className="stat-value">{analytics.totalNotes}</span>
            <span className="stat-label">Total Notes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <span className="stat-value">{analytics.publicNotes}</span>
            <span className="stat-label">Public Notes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-content">
            <span className="stat-value">{analytics.privateNotes}</span>
            <span className="stat-label">Private Notes</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <span className="stat-value">{analytics.totalViews}</span>
            <span className="stat-label">Total Views</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <span className="stat-value">{analytics.totalWords.toLocaleString()}</span>
            <span className="stat-label">Total Words</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <span className="stat-value">{analytics.totalReadingTimeMinutes}</span>
            <span className="stat-label">Minutes to Read</span>
          </div>
        </div>
      </section>

      {/* Views Timeline */}
      <section className="analytics-section">
        <h2>📈 Views (Last 7 Days: {analytics.viewsLast7Days} | Last 30 Days: {analytics.viewsLast30Days})</h2>
        <div className="chart-container">
          <div className="simple-chart">
            {Object.entries(analytics.viewsPerDay).slice(-14).map(([date, count]) => (
              <div key={date} className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ 
                    height: `${Math.max(4, (count / Math.max(...Object.values(analytics.viewsPerDay), 1)) * 100)}%` 
                  }}
                  title={`${date}: ${count} views`}
                />
                <span className="chart-label">{date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tag Distribution */}
      <section className="analytics-section">
        <h2>🏷️ Tag Distribution</h2>
        {analytics.tagDistribution.length > 0 ? (
          <div className="tag-distribution">
            {analytics.tagDistribution.map((tag) => (
              <div key={tag.tag} className="tag-item">
                <span className="tag-name">{tag.tag}</span>
                <div className="tag-bar-container">
                  <div 
                    className="tag-bar" 
                    style={{ 
                      width: `${(tag.count / analytics.tagDistribution[0].count) * 100}%` 
                    }}
                  />
                </div>
                <span className="tag-count">{tag.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No tags yet. Add tags to your notes to see distribution.</p>
        )}
      </section>

      {/* Most Viewed Notes */}
      <section className="analytics-section">
        <h2>🔥 Most Viewed Notes</h2>
        {analytics.mostViewedNotes.length > 0 ? (
          <div className="most-viewed-list">
            {analytics.mostViewedNotes.map((note, index) => (
              <Link key={note.id} to={`/note/${note.id}`} className="most-viewed-item">
                <span className="rank">#{index + 1}</span>
                <span className="note-title">{note.title}</span>
                <span className={`visibility ${note.isPublic ? 'public' : 'private'}`}>
                  {note.isPublic ? '🌍' : '🔒'}
                </span>
                <span className="view-count">{note.viewCount} views</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="no-data">No views recorded yet. Views will appear here once your notes are viewed.</p>
        )}
      </section>

      {/* Notes Created Timeline */}
      <section className="analytics-section">
        <h2>✍️ Notes Created (Last 30 Days)</h2>
        <div className="chart-container">
          <div className="simple-chart">
            {Object.entries(analytics.notesCreatedPerDay).slice(-14).map(([date, count]) => (
              <div key={date} className="chart-bar-container">
                <div 
                  className="chart-bar notes-bar" 
                  style={{ 
                    height: `${Math.max(4, (count / Math.max(...Object.values(analytics.notesCreatedPerDay), 1)) * 100)}%` 
                  }}
                  title={`${date}: ${count} notes`}
                />
                <span className="chart-label">{date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
