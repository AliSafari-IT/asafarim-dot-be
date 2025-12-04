import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./Pagination.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  size: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  sizes?: number[];
  showSizeSelector?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  size,
  onPageChange,
  onSizeChange,
  sizes = [10, 20, 50],
  showSizeSelector = true,
}: PaginationProps) {
  const startItem = page * size + 1;
  const endItem = Math.min((page + 1) * size, totalItems);

  const canGoPrevious = page > 0;
  const canGoNext = page < totalPages - 1;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      // Show first, last, and pages around current
      pages.push(0);
      
      let start = Math.max(1, page - 1);
      let end = Math.min(totalPages - 2, page + 1);
      
      if (page <= 2) {
        end = Math.min(3, totalPages - 2);
      } else if (page >= totalPages - 3) {
        start = Math.max(1, totalPages - 4);
      }

      if (start > 1) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 2) pages.push("...");
      
      if (totalPages > 1) pages.push(totalPages - 1);
    }

    return pages;
  };

  if (totalPages <= 1 && !showSizeSelector) {
    return null;
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of{" "}
        <strong>{totalItems}</strong> notes
      </div>

      <div className="pagination-controls">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoPrevious}
        >
          ← Previous
        </Button>

        <div className="pagination-pages">
          {getPageNumbers().map((p, idx) =>
            typeof p === "number" ? (
              <button
                key={idx}
                className={`page-btn ${p === page ? "active" : ""}`}
                onClick={() => onPageChange(p)}
              >
                {p + 1}
              </button>
            ) : (
              <span key={idx} className="page-ellipsis">
                {p}
              </span>
            )
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoNext}
        >
          Next →
        </Button>
      </div>

      {showSizeSelector && onSizeChange && (
        <div className="pagination-size">
          <label htmlFor="page-size">Per page:</label>
          <select
            id="page-size"
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="size-select"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
