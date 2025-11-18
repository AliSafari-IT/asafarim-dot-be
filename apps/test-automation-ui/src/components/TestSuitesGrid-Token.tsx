import React, { useState, useMemo } from "react";
import { TestSuiteCardToken, TestSuite } from "./TestSuiteCard-Token";
import { Search, SortAsc, SortDesc } from "lucide-react";
import "./TestSuitesGrid-Token.css";

interface TestSuitesGridProps {
  suites: TestSuite[];
  onRunSuite: (suiteId: string) => void;
  onViewLogs: (suiteId: string) => void;
  onDelete: (suiteId: string) => void;
  isAuthenticated?: boolean;
  showFilter?: boolean;
  showSort?: boolean;
  selectedSuites?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

type SortField =
  | "name"
  | "totalTests"
  | "passedTests"
  | "failedTests"
  | "executionOrder";
type SortOrder = "asc" | "desc";

export const TestSuitesGridToken: React.FC<TestSuitesGridProps> = ({
  suites,
  onRunSuite,
  onViewLogs,
  onDelete,
  isAuthenticated = true,
  showFilter = true,
  showSort = true,
  selectedSuites = [],
  onSelectionChange,
}) => {
  const [filterText, setFilterText] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleToggleSelection = (suiteId: string) => {
    if (!onSelectionChange) return;

    const newSelection = selectedSuites.includes(suiteId)
      ? selectedSuites.filter((id) => id !== suiteId)
      : [...selectedSuites, suiteId];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedSuites.length === filteredAndSortedSuites.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredAndSortedSuites.map((s) => s.id));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedSuites = useMemo(() => {
    let result = [...suites];

    // Filter
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      result = result.filter(
        (suite) =>
          suite.name.toLowerCase().includes(searchLower) ||
          suite.description?.toLowerCase().includes(searchLower) ||
          suite.fixture?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aValue: string | number = a[sortField] ?? "";
      let bValue: string | number = b[sortField] ?? "";

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [suites, filterText, sortField, sortOrder]);

  const SortIcon = sortOrder === "asc" ? SortAsc : SortDesc;

  return (
    <div className="suites-grid-token">
      {/* Filter and Sort Controls */}
      {(showFilter || showSort || onSelectionChange) && (
        <div className="suites-grid-token__controls">
          {onSelectionChange && filteredAndSortedSuites.length > 0 && (
            <div className="suites-grid-token__selection-controls">
              <div className="suites-grid-token__checkbox-wrapper">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={
                    selectedSuites.length === filteredAndSortedSuites.length &&
                    filteredAndSortedSuites.length > 0
                  }
                  onChange={handleSelectAll}
                  aria-label="Select all test suites"
                />
                <label htmlFor="select-all">
                  Select All ({selectedSuites.length}/
                  {filteredAndSortedSuites.length})
                </label>
              </div>
            </div>
          )}

          {showFilter && (
            <div className="suites-grid-token__filter-container">
              <div className="suites-grid-token__search-wrapper">
                <Search size={18} className="suites-grid-token__search-icon" />
                <input
                  type="text"
                  placeholder="Search test suites..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="suites-grid-token__search-input"
                  aria-label="Filter test suites"
                />
              </div>
            </div>
          )}

          {showSort && (
            <div className="suites-grid-token__sort-container">
              <div className="suites-grid-token__sort-label">Sort by:</div>
              <div className="suites-grid-token__sort-btns">
                <button
                  className={`suites-grid-token__sort-btn ${
                    sortField === "name" ? "active" : ""
                  }`}
                  onClick={() => handleSort("name")}
                  aria-label="Sort by name"
                >
                  Name
                  {sortField === "name" && <SortIcon size={14} />}
                </button>
                <button
                  className={`suites-grid-token__sort-btn ${
                    sortField === "totalTests" ? "active" : ""
                  }`}
                  onClick={() => handleSort("totalTests")}
                  aria-label="Sort by total tests"
                >
                  Total
                  {sortField === "totalTests" && <SortIcon size={14} />}
                </button>
                <button
                  className={`suites-grid-token__sort-btn ${
                    sortField === "passedTests" ? "active" : ""
                  }`}
                  onClick={() => handleSort("passedTests")}
                  aria-label="Sort by passed tests"
                >
                  Passed
                  {sortField === "passedTests" && <SortIcon size={14} />}
                </button>
                <button
                  className={`suites-grid-token__sort-btn ${
                    sortField === "failedTests" ? "active" : ""
                  }`}
                  onClick={() => handleSort("failedTests")}
                  aria-label="Sort by failed tests"
                >
                  Failed
                  {sortField === "failedTests" && <SortIcon size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      {filterText && (
        <div className="suites-grid-token__results-info">
          <p>
            Showing {filteredAndSortedSuites.length} of {suites.length} test
            suite
            {suites.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Grid */}
      {filteredAndSortedSuites.length === 0 ? (
        <div className="suites-grid-token__empty-state">
          <div className="suites-grid-token__empty-content">
            {filterText ? (
              <>
                <h3>No test suites found</h3>
                <p>Try adjusting your search criteria</p>
                <button
                  className="suites-grid-token__button suites-grid-token__button--secondary"
                  onClick={() => setFilterText("")}
                >
                  Clear filter
                </button>
              </>
            ) : (
              <>
                <h3>No test suites available</h3>
                <p>Create your first test suite to get started</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="suites-grid-token__grid">
          {filteredAndSortedSuites.map((suite) => (
            <TestSuiteCardToken
              key={suite.id}
              suite={suite}
              onRunSuite={onRunSuite}
              onViewLogs={onViewLogs}
              onDelete={onDelete}
              isAuthenticated={isAuthenticated}
              isSelected={selectedSuites.includes(suite.id)}
              onToggleSelection={
                onSelectionChange
                  ? () => handleToggleSelection(suite.id)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};
