import { useEffect, useMemo, useState } from "react";
import { Button } from "@asafarim/shared-ui-react";
import { apiGet } from "../api/core";
import type { PagedResponse } from "../api/core";

// Simple placeholder for a future GitHub-driven feed of commits / WIP notes.
// Later, we can plug in an API or direct GitHub API call to render recent activity.
export default function WhatIsBuilding() {
  type Item = { id: string; title: string; date: string; link?: string };
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null); // -1 if unknown

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    []
  );

  useEffect(() => {
    let cancelled = false; // To handle cleanup
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
          const msg = e instanceof Error ? e.message : "Failed to load updates";
          setError(msg);
          // Fallback: show a small static hint so the page still has value
          setItems([
            {
              id: "fallback-1",
              title: "Could not load updates; showing fallback entry",
              date: new Date().toISOString(),
              link: "https://github.com/AliSafari-IT/asafarim-dot-be",
            },
          ]);
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
    <section className="section">
      <div className="container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-phosphor">
            What I’m Building Now
          </h1>
          <p className="text-secondary">
            A feed of recent work-in-progress across apps and APIs
          </p>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-700 bg-red-900/20 p-3 text-sm">
                {error}
              </div>
            )}
            {items.length === 0 && (
              <div className="rounded-md border border-neutral-800 p-6 text-center">
                <p className="mb-2">No updates yet. Check back soon!</p>
                <Button
                  href="https://github.com/AliSafari-IT/asafarim-dot-be"
                  variant="link"
                >
                  View repository
                </Button>
              </div>
            )}
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-neutral-800 p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg ">{item.title}</h3>
                  <span className="text-xs opacity-70">
                    {formatter.format(new Date(item.date))}
                  </span>
                </div>
                {item.link && (
                  <div className="mt-2">
                    <Button href={item.link} variant="link">
                      View details
                    </Button>
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm opacity-80">
                Page {page}
                {typeof total === "number" && total > 0
                  ? ` of ${Math.ceil(total / pageSize)} (${total} total)`
                  : ""}
              </span>
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function SkeletonStyles() {
  return (
    <style>
      {`
      /* Theme-aware variables (default to light-friendly) */
      :root {
        --skeleton-base: rgba(0, 0, 0, 0.06);
        --skeleton-highlight: rgba(0, 0, 0, 0.12);
        --card-border: rgba(0, 0, 0, 0.12);
      }
      /* Respect data-theme if provided by ThemeProvider */
      [data-theme="dark"] {
        --skeleton-base: rgba(255, 255, 255, 0.08);
        --skeleton-highlight: rgba(255, 255, 255, 0.18);
        --card-border: rgba(255, 255, 255, 0.12);
      }
      [data-theme="light"] {
        --skeleton-base: rgba(0, 0, 0, 0.06);
        --skeleton-highlight: rgba(0, 0, 0, 0.12);
        --card-border: rgba(0, 0, 0, 0.12);
      }
      /* Fallback to system preference */
      @media (prefers-color-scheme: dark) {
        :root {
          --skeleton-base: rgba(255, 255, 255, 0.08);
          --skeleton-highlight: rgba(255, 255, 255, 0.18);
          --card-border: rgba(255, 255, 255, 0.12);
        }
      }

      .skeleton-line {
        height: 12px;
        background: linear-gradient(90deg, var(--skeleton-base) 25%, var(--skeleton-highlight) 37%, var(--skeleton-base) 63%);
        background-size: 400% 100%;
        border-radius: 4px;
        animation: skeleton-shimmer 1.4s ease infinite;
      }
      @keyframes skeleton-shimmer {
        0% { background-position: 100% 0; }
        100% { background-position: -100% 0; }
      }
      .loading-card { border: 1px solid var(--card-border); }
      `}
    </style>
  );
}

function Loading() {
  return (
    <div className="space-y-4">
      <SkeletonStyles />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="loading-card rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="skeleton-line w-2/3" />
            <div className="skeleton-line w-32" />
          </div>
          <div className="mt-2 skeleton-line w-24" />
        </div>
      ))}
    </div>
  );
}
