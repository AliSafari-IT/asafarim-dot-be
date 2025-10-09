import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api/core";
import type { PagedResponse } from "../api/core";

function WhatIsBuilding() {
  type Item = { id: string; title: string; date: string; link?: string };
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);

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
        const data = await apiGet<PagedResponse<Item>>(
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

  return (
    <section className="what-is-building">
      <header className="hero">
        <div className="hero-glow"></div>
        <h1>🚀 What I’m Building</h1>
        <p>Live snapshots of recent ASafariM projects & microservices</p>
      </header>

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
                onClick={() => window.open("https://github.com/AliSafari-IT/asafarim-dot-be", "_blank")}
              >
                View Repository →
              </button>
            </div>
          ) : (
            <>
              <div className="cards-grid">
                {items.map((item) => (
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

              {total && total > pageSize && (
                <div className="pagination">
                  <button
                    aria-label="Previous Page"
                    id="previous-page"
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    ← Previous
                  </button>
                  <span>
                    Page {page} of {Math.ceil(total / pageSize)}
                  </span>
                  <button
                    aria-label="Next Page"
                    id="next-page"
                    type="button"
                    disabled={page >= Math.ceil(total / pageSize)}
                    onClick={() => setPage((p) => p + 1)}
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
