import { useEffect, useState } from "react";
import { Button } from "@asafarim/shared-ui-react";

// Simple placeholder for a future GitHub-driven feed of commits / WIP notes.
// Later, we can plug in an API or direct GitHub API call to render recent activity.
export default function WhatIsBuilding() {
  const [items, setItems] = useState<Array<{ id: string; title: string; date: string; link?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  type GitCommitResp = {
    sha: string;
    html_url: string;
    commit: {
      message: string;
      author?: { date: string };
    };
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://api.github.com/repos/AliSafari-IT/asafarim-dot-be/commits?per_page=10"
        );
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data = (await res.json()) as GitCommitResp[];
        if (cancelled) return;

        const mapped = data.map((c: GitCommitResp) => ({
          id: c.sha as string,
          title: c.commit?.message?.split("\n")[0] || "Commit",
          date: c.commit?.author?.date || new Date().toISOString(),
          link: c.html_url as string
        }));

        setItems(mapped);
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load updates";
          setError(msg);
          // Fallback: show a small static hint so the page still has value
          setItems([
            {
              id: "fallback-1",
              title: "Could not load GitHub commits; showing fallback entry",
              date: new Date().toISOString(),
              link: "https://github.com/AliSafari-IT/asafarim-dot-be"
            }
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
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-phosphor">What I’m Building Now</h1>
          <p className="text-secondary">A feed of recent work-in-progress across apps and APIs</p>
        </div>

        {loading ? (
          <p>Loading latest updates…</p>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-700 bg-red-900/20 p-3 text-sm">
                {error}
              </div>
            )}
            {items.length === 0 && <p>No updates yet. Check back soon!</p>}
            {items.map((item) => (
              <div key={item.id} className="rounded-md border border-neutral-800 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <span className="text-xs opacity-70">{new Date(item.date).toLocaleString()}</span>
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
          </div>
        )}

        <div className="mt-8 opacity-80 text-sm">
          <p>
            This page is a placeholder. We’ll enhance it to pull real activity from GitHub commits
            or a dedicated Core API endpoint like <code>/what-is-building</code>.
          </p>
        </div>
      </div>
    </section>
  );
}
