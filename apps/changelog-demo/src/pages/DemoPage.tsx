import { useState } from "react";
import { ChangelogTimeline } from "@asafarim/changelog-timeline";
import { sampleChangelog } from "../data/sampleChangelog";

export function DemoPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [paginationMode, setPaginationMode] = useState<"client" | "server">(
    "client"
  );
  const [showFilter, setShowFilter] = useState(true);
  const [groupByVersion, setGroupByVersion] = useState(false);

  return (
    <div className="demo-page">
      <section className="demo-controls">
        <h2>Demo Controls</h2>
        <div className="control-grid">
          <label className="control-item">
            <input
              type="checkbox"
              checked={showFilter}
              onChange={(e) => setShowFilter(e.target.checked)}
            />
            <span>Show Category Filter</span>
          </label>

          <label className="control-item">
            <input
              type="checkbox"
              checked={groupByVersion}
              onChange={(e) => setGroupByVersion(e.target.checked)}
            />
            <span>Group by Version</span>
          </label>

          <label className="control-item">
            <span>Pagination Mode:</span>
            <select
              value={paginationMode}
              onChange={(e) =>
                setPaginationMode(e.target.value as "client" | "server")
              }
            >
              <option value="client">Client</option>
              <option value="server">Server</option>
            </select>
          </label>

          <div className="control-item">
            <span>Page Size: {pageSize}</span>
          </div>

          <div className="control-item">
            <span>Total Entries: {sampleChangelog.length}</span>
          </div>
        </div>
      </section>

      <section className="demo-timeline">
        <ChangelogTimeline
          entries={sampleChangelog}
          showCategoryFilter={showFilter}
          groupByVersion={groupByVersion}
          pagination={{
            page,
            pageSize,
            totalCount: sampleChangelog.length,
            onPageChange: setPage,
            mode: paginationMode,
          }}
        />
      </section>

      <section className="demo-info">
        <h2>Features Demonstrated</h2>
        <ul>
          <li>
            ✨ <strong>Category filtering</strong> - Toggle filter bar to filter
            by category
          </li>
          <li>
            📦 <strong>Version grouping</strong> - Group entries by version
            number
          </li>
          <li>
            📄 <strong>Pagination</strong> - Client-side and server-side modes
          </li>
          <li>
            🎨 <strong>Token-based styling</strong> - All colors from
            @asafarim/shared-tokens
          </li>
          <li>
            🌗 <strong>Theme support</strong> - Toggle light/dark with button
            above
          </li>
          <li>
            📱 <strong>Responsive</strong> - Try resizing your browser window
          </li>
          <li>
            ♿ <strong>Accessible</strong> - Keyboard navigation and screen
            reader support
          </li>
        </ul>
      </section>

      <section className="demo-code">
        <h2>Usage Example</h2>
        <pre>
          <code>{`import { ChangelogTimeline } from '@asafarim/changelog-timeline';
import '@asafarim/shared-tokens/base.css';

<ChangelogTimeline
  entries={entries}
  showCategoryFilter
  groupByVersion
  pagination={{
    page: 1,
    pageSize: 10,
    totalCount: entries.length,
    onPageChange: setPage,
    mode: 'client',
  }}
/>`}</code>
        </pre>
      </section>
    </div>
  );
}
