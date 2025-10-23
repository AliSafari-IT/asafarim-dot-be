import { useEffect, useMemo, useState } from "react";
import { apiGetPaged } from "../api/web";
import "./WhatIsBuilding.css";

function WhatIsBuilding() {
  type Item = { id: string; title: string; date: string; link?: string };
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [sortBy, setSortBy] = useState<"title" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGetPaged<Item>(
          `/what-is-building?page=${page}&pageSize=${pageSize}`
        );
        if (cancelled) return;
        setItems(data.items || []);
        setTotal(typeof data.total === "number" ? data.total : -1);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load recent updates"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize]);

  const sortedItems = useMemo(() => {
    const sorted = [...items];
    sorted.sort((a, b) => {
      const aVal = sortBy === "date" ? new Date(a.date).getTime() : a.title;
      const bVal = sortBy === "date" ? new Date(b.date).getTime() : b.title;
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === "desc" ? -comparison : comparison;
    });
    return sorted;
  }, [items, sortBy, sortOrder]);

  const toggleSort = (field: "title" | "date") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <section className="what-is-building">
      <div className="what-is-building-heading">
        <h1 className="title">🚀 What I'm Building</h1>
        <p className="subtitle">
          Live snapshots of recent ASafariM projects & microservices
        </p>
        {!loading && items.length > 0 && (
          <div className="stats-card">
            <div className="stat-item">
              <span className="stat-label">Latest Update</span>
              <span className="stat-value">
                {items.length > 0
                  ? formatter.format(new Date(items[0].date))
                  : "N/A"}
              </span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-label">Total Commits</span>
              <span className="stat-value">{total === -1 ? "∞" : total}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-label">Repository</span>
              <span className="stat-value">
                <a
                  href="https://github.com/AliSafari-IT/asafarim-dot-be"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub ↗
                </a>
              </span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading updates...</p>
        </div>
      ) : (
        <div className="updates-wrapper">
          {error && <div className="error-banner">⚠️ {error}</div>}

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="emoji">📭</div>
              <h3>No updates yet</h3>
              <p>New builds will appear here soon. Stay tuned!</p>
              <button
                aria-label="View Repository"
                id="view-repository"
                type="button"
                onClick={() =>
                  window.open(
                    "https://github.com/AliSafari-IT/asafarim-dot-be",
                    "_blank"
                  )
                }
              >
                View Repository →
              </button>
            </div>
          ) : (
            <>
              <div className="view-controls">
                <div className="view-toggle">
                  <button
                    className={`toggle-btn ${
                      viewMode === "table" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("table")}
                    aria-label="Table view"
                  >
                    📋 Table
                  </button>
                  <button
                    className={`toggle-btn ${
                      viewMode === "card" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("card")}
                    aria-label="Card view"
                  >
                    🗂 Cards
                  </button>
                </div>
              </div>

              {viewMode === "table" ? (
                <div className="table-wrapper">
                  <table className="updates-table">
                    <thead>
                      <tr>
                        <th
                          onClick={() => toggleSort("title")}
                          className="sortable"
                        >
                          Title{" "}
                          {sortBy === "title" && (
                            <span className="sort-indicator">
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </th>
                        <th
                          onClick={() => toggleSort("date")}
                          className="sortable"
                        >
                          Date{" "}
                          {sortBy === "date" && (
                            <span className="sort-indicator">
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedItems.map((item) => (
                        <tr key={item.id}>
                          <td className="title-cell">{item.title}</td>
                          <td className="date-cell">
                            {formatter.format(new Date(item.date))}
                          </td>
                          <td className="action-cell">
                            {item.link && (
                              <button
                                className="link-btn"
                                onClick={() => window.open(item.link, "_blank")}
                                aria-label="View details"
                              >
                                🔗
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="cards-grid">
                  {sortedItems.map((item) => (
                    <div key={item.id} className="build-card">
                      <div className="card-top">
                        <h3>{item.title}</h3>
                        <span>{formatter.format(new Date(item.date))}</span>
                      </div>
                      {item.link && (
                        <button
                          aria-label="View Details"
                          id="view-details"
                          type="button"
                          onClick={() => window.open(item.link, "_blank")}
                        >
                          🔗 View Details
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <div className="pagination">
                  <button
                    aria-label="Previous Page"
                    id="previous-page"
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(Math.max(1, page - 1))}
                  >
                    ← Previous
                  </button>
                  <span>Page {page}</span>
                  <button
                    aria-label="Next Page"
                    id="next-page"
                    type="button"
                    disabled={items.length < pageSize}
                    onClick={() => setPage(page + 1)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default WhatIsBuilding;
