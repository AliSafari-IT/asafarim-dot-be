// apps/test-automation-ui/src/components/GenericListView.tsx
import React from "react";
import "./GenericListView.css";
import { Eye } from "lucide-react";
import { useViewportCategory } from "../hooks/useViewportCategory";

export interface ListViewColumn {
  key: string;
  header: string;
  inListView?: boolean;
  width?: string;
  updatedAt?: any;
  render?: (value: any, item: any) => React.ReactNode;
  align?: "left" | "center" | "right";
}

export interface GenericListViewProps {
  items: any[];
  columns: ListViewColumn[];
  isAuthenticated?: boolean;
  onView?: (item: any) => void;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

export const GenericListView: React.FC<GenericListViewProps> = ({
  items,
  columns,
  isAuthenticated = false,
  onView,
  loading = false,
  error = null,
  emptyMessage = "No items found",
}) => {
  const viewportCategory = useViewportCategory();

  if (loading) {
    return (
      <div className="list-view-loading">
        <div className="list-view-spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-view-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="list-view-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Build grid template columns from visible columns
  const visibleColumns = columns.filter((col) => col.inListView);
  const gridTemplateColumns = visibleColumns
    .map((col) => col.width || "1fr")
    .join(" ");

  // Decide where to show the View button based on viewport
  const isDesktop = viewportCategory === "desktop";
  const isTablet = viewportCategory === "tablet";
  const isMobile = viewportCategory === "mobile";
  const firstVisibleKey = visibleColumns[0]?.key;
  const lastVisibleKey = visibleColumns[visibleColumns.length - 1]?.key;

  return (
    <div className="list-view-container">
      <div className="list-view-header" style={{ gridTemplateColumns }}>
        {columns.map(
          (column) =>
            column.inListView && (
              <div
                key={column.key}
                className="list-view-header-cell"
                style={{ textAlign: column.align }}
              >
                {column.header}
              </div>
            )
        )}
      </div>

      <div className="list-view-body">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="list-view-row"
            style={{ gridTemplateColumns }}
          >
            {columns.map(
              (column, colIndex) =>
                column.inListView && (
                  <div
                    key={column.key}
                    className={`list-view-cell ${
                      colIndex === 0 ? "list-view-cell--first" : ""
                    }`}
                    style={{ textAlign: column.align || "left" }}
                  >
                    <div className="list-view-cell-content">
                      {column.render
                        ? column.render(item, column.key)
                        : String(item[column.key as keyof typeof item] || "")}
                    </div>
                    {isAuthenticated &&
                      onView &&
                      ((isDesktop && column.key === firstVisibleKey) ||
                        (!isDesktop && column.key === lastVisibleKey)) && (
                        <button
                          className="list-view-hover-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(item);
                          }}
                          title="View details"
                          aria-label="View item details"
                        >
                          <Eye />
                        </button>
                      )}
                  </div>
                )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
