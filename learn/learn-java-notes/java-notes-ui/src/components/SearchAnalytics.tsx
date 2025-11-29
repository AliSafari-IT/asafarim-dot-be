import { useState, useEffect } from "react";
import { getSearchAnalytics, type SearchAnalytics as SearchAnalyticsType } from "../api/notesApi";
import { getTagColorStyle } from "../utils/colorUtils";
import "./SearchAnalytics.css";

interface SearchAnalyticsProps {
  days?: number;
  compact?: boolean;
}

export default function SearchAnalytics({ days = 30, compact = false }: SearchAnalyticsProps) {
  const [analytics, setAnalytics] = useState<SearchAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(days);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSearchAnalytics(selectedPeriod);
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load search analytics:", err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="search-analytics-loading">
        <div className="search-analytics-spinner" />
        <span>Loading analytics...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="search-analytics-error">
        <span>{error || "No data available"}</span>
      </div>
    );
  }

  const maxTrendCount = Math.max(...analytics.searchTrend.map((t) => t.count), 1);

  return (
    <div className={`search-analytics ${compact ? "compact" : ""}`}>
      {/* Period Selector */}
      {!compact && (
        <div className="search-analytics-header">
          <h3>Search Analytics</h3>
          <div className="search-analytics-period">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                className={`period-btn ${selectedPeriod === d ? "active" : ""}`}
                onClick={() => setSelectedPeriod(d)}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="search-analytics-stats">
        <div className="stat-card">
          <div className="stat-value">{analytics.totalSearches.toLocaleString()}</div>
          <div className="stat-label">Total Searches</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {analytics.averageResultCount?.toFixed(1) || "—"}
          </div>
          <div className="stat-label">Avg Results</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {analytics.clickThroughRate ? `${analytics.clickThroughRate.toFixed(1)}%` : "—"}
          </div>
          <div className="stat-label">Click Rate</div>
        </div>
      </div>

      {/* Search Trend Chart */}
      {!compact && analytics.searchTrend.length > 0 && (
        <div className="search-analytics-section">
          <h4>Search Trend</h4>
          <div className="search-trend-chart">
            {analytics.searchTrend.map((point, i) => (
              <div
                key={i}
                className="trend-bar-container"
                title={`${point.date}: ${point.count} searches`}
              >
                <div
                  className="trend-bar"
                  style={{ height: `${(point.count / maxTrendCount) * 100}%` }}
                />
                <span className="trend-label">
                  {new Date(point.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Queries */}
      {analytics.topQueries.length > 0 && (
        <div className="search-analytics-section">
          <h4>🔥 Top Searches</h4>
          <div className="top-queries-list">
            {analytics.topQueries.slice(0, compact ? 5 : 10).map((q, i) => (
              <div key={i} className="top-query-item">
                <span className="query-rank">{i + 1}</span>
                <span className="query-text">{q.query || "(empty)"}</span>
                <span className="query-count">{q.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zero Result Queries */}
      {!compact && analytics.zeroResultQueries.length > 0 && (
        <div className="search-analytics-section">
          <h4>⚠️ Zero Results</h4>
          <p className="section-hint">
            These searches returned no results - consider creating content for them!
          </p>
          <div className="zero-results-list">
            {analytics.zeroResultQueries.slice(0, 5).map((q, i) => (
              <div key={i} className="zero-result-item">
                <span className="query-text">{q.query}</span>
                <span className="query-count">{q.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Tags in Searches */}
      {analytics.popularTags.length > 0 && (
        <div className="search-analytics-section">
          <h4>🏷️ Hot Tags</h4>
          <div className="hot-tags-cloud">
            {analytics.popularTags.slice(0, compact ? 8 : 15).map((t, i) => (
              <span
                key={i}
                className="hot-tag"
                style={{
                  ...getTagColorStyle(t.tag),
                  fontSize: `${Math.max(0.75, Math.min(1.25, 0.75 + t.count * 0.1))}rem`,
                }}
              >
                {t.tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
