import React, { useState, useMemo } from 'react';
import { TestSuiteCard, TestSuite } from './TestSuiteCard';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import './TestSuitesGrid.css';

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
  expandedSuites?: Set<string>;
  onToggleExpand?: (suiteId: string) => void;
}

type SortField = 'name' | 'totalTests' | 'passedTests' | 'failedTests' | 'executionOrder';
type SortOrder = 'asc' | 'desc';

export const TestSuitesGrid: React.FC<TestSuitesGridProps> = ({
  suites,
  onRunSuite,
  onViewLogs,
  onDelete,
  isAuthenticated = true,
  showFilter = true,
  showSort = true,
  selectedSuites = [],
  onSelectionChange,
  expandedSuites = new Set(),
  onToggleExpand,
}) => {
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleToggleSelection = (suiteId: string) => {
    if (!onSelectionChange) return;
    
    const newSelection = selectedSuites.includes(suiteId)
      ? selectedSuites.filter(id => id !== suiteId)
      : [...selectedSuites, suiteId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedSuites.length === filteredAndSortedSuites.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredAndSortedSuites.map(s => s.id));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
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
      let aValue: string | number = a[sortField] ?? '';
      let bValue: string | number = b[sortField] ?? '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [suites, filterText, sortField, sortOrder]);

  const SortIcon = sortOrder === 'asc' ? SortAsc : SortDesc;

  return (
    <div className="test-suites-grid-container">
      {/* Filter and Sort Controls */}
      {(showFilter || showSort || onSelectionChange) && (
        <div className="grid-controls">
          {onSelectionChange && filteredAndSortedSuites.length > 0 && (
            <div className="selection-controls">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedSuites.length === filteredAndSortedSuites.length && filteredAndSortedSuites.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all test suites"
                />
                <span>Select All ({selectedSuites.length}/{filteredAndSortedSuites.length})</span>
              </label>
            </div>
          )}
          
          {showFilter && (
            <div className="filter-container">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search test suites..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="search-input"
                  aria-label="Filter test suites"
                />
              </div>
            </div>
          )}

          {showSort && (
            <div className="sort-container">
              <label className="sort-label">Sort by:</label>
              <div className="sort-buttons">
                <button
                  className={`sort-button ${sortField === 'name' ? 'active' : ''}`}
                  onClick={() => handleSort('name')}
                  aria-label="Sort by name"
                >
                  Name
                  {sortField === 'name' && <SortIcon size={14} />}
                </button>
                <button
                  className={`sort-button ${sortField === 'totalTests' ? 'active' : ''}`}
                  onClick={() => handleSort('totalTests')}
                  aria-label="Sort by total tests"
                >
                  Total
                  {sortField === 'totalTests' && <SortIcon size={14} />}
                </button>
                <button
                  className={`sort-button ${sortField === 'passedTests' ? 'active' : ''}`}
                  onClick={() => handleSort('passedTests')}
                  aria-label="Sort by passed tests"
                >
                  Passed
                  {sortField === 'passedTests' && <SortIcon size={14} />}
                </button>
                <button
                  className={`sort-button ${sortField === 'failedTests' ? 'active' : ''}`}
                  onClick={() => handleSort('failedTests')}
                  aria-label="Sort by failed tests"
                >
                  Failed
                  {sortField === 'failedTests' && <SortIcon size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      {filterText && (
        <div className="results-info">
          <p>
            Showing {filteredAndSortedSuites.length} of {suites.length} test suite
            {suites.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Grid */}
      {filteredAndSortedSuites.length === 0 ? (
        <div className="empty-grid-state">
          <div className="empty-content">
            {filterText ? (
              <>
                <h3>No test suites found</h3>
                <p>Try adjusting your search criteria</p>
                <button className="button button-secondary" onClick={() => setFilterText('')}>
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
        <div className="test-suites-grid">
          {filteredAndSortedSuites.map((suite) => (
            <TestSuiteCard
              key={suite.id}
              suite={suite}
              onRunSuite={onRunSuite}
              onViewLogs={onViewLogs}
              onDelete={onDelete}
              isAuthenticated={isAuthenticated}
              isSelected={selectedSuites.includes(suite.id)}
              onToggleSelection={onSelectionChange ? () => handleToggleSelection(suite.id) : undefined}
              isExpanded={expandedSuites.has(suite.id)}
              onToggleExpand={onToggleExpand ? () => onToggleExpand(suite.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
