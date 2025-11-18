import React, { useState, useMemo } from 'react';
import { TestSuiteCardToken, TestSuite } from './TestSuiteCard-Token';
import { Search, ArrowUpDown } from 'lucide-react';
import './TestSuitesGrid-Token.css';

interface TestSuitesGridProps {
  suites: TestSuite[];
  onRunSuite: (suiteId: string) => void;
  onViewLogs: (suiteId: string) => void;
  onDelete: (suiteId: string) => void;
  isAuthenticated?: boolean;
}

type SortField = 'name' | 'totalTests' | 'passedTests' | 'failedTests';
type SortOrder = 'asc' | 'desc';

export const TestSuitesGridToken: React.FC<TestSuitesGridProps> = ({
  suites,
  onRunSuite,
  onViewLogs,
  onDelete,
  isAuthenticated = true,
}) => {
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

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
    if (filterText) {
      const searchLower = filterText.toLowerCase();
      result = result.filter(
        (suite) =>
          suite.name.toLowerCase().includes(searchLower) ||
          suite.description?.toLowerCase().includes(searchLower) ||
          suite.fixture?.toLowerCase().includes(searchLower)
      );
    }
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

  return (
    <div className="suites-grid-token">
      <div className="suites-grid-token__controls">
        <div className="suites-grid-token__search">
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
        <div className="suites-grid-token__sort">
          <label className="suites-grid-token__sort-label">Sort:</label>
          <div className="suites-grid-token__sort-buttons">
            {(['name', 'totalTests', 'passedTests', 'failedTests'] as SortField[]).map((field) => (
              <button
                key={field}
                className={`suites-grid-token__sort-btn ${sortField === field ? 'active' : ''}`}
                onClick={() => handleSort(field)}
                aria-label={`Sort by ${field}`}
              >
                {field === 'name' ? 'Name' : field === 'totalTests' ? 'Total' : field === 'passedTests' ? 'Passed' : 'Failed'}
                {sortField === field && <ArrowUpDown size={14} />}
              </button>
            ))}
          </div>
        </div>
      </div>
      {filterText && (
        <div className="suites-grid-token__results">
          <p>Showing {filteredAndSortedSuites.length} of {suites.length} suite{suites.length !== 1 ? 's' : ''}</p>
        </div>
      )}
      {filteredAndSortedSuites.length === 0 ? (
        <div className="suites-grid-token__empty">
          <div className="suites-grid-token__empty-content">
            {filterText ? (
              <>
                <h3>No test suites found</h3>
                <p>Try adjusting your search</p>
                <button className="suites-grid-token__btn-secondary" onClick={() => setFilterText('')}>Clear filter</button>
              </>
            ) : (
              <>
                <h3>No test suites</h3>
                <p>Create your first test suite</p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
