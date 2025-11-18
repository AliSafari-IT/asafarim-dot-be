import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Play, Eye, Trash2, CheckCircle, XCircle, Clock, Circle } from 'lucide-react';
import './TestSuiteCard-Token.css';

export interface TestCase {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration?: number;
  lastRun?: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  fixture?: string;
  testCases: TestCase[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  runningTests: number;
  pendingTests: number;
  executionOrder?: number;
  isActive?: boolean;
}

interface TestSuiteCardProps {
  suite: TestSuite;
  onRunSuite: (suiteId: string) => void;
  onViewLogs: (suiteId: string) => void;
  onDelete: (suiteId: string) => void;
  isAuthenticated?: boolean;
  isExpanded?: boolean;
}

export const TestSuiteCardToken: React.FC<TestSuiteCardProps> = ({
  suite,
  onRunSuite,
  onViewLogs,
  onDelete,
  isAuthenticated = true,
  isExpanded: initialExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const getStatusBadge = (status: TestCase['status']) => {
    const badges = {
      passed: { icon: <CheckCircle size={14} />, label: 'Passed', className: 'badge-passed' },
      failed: { icon: <XCircle size={14} />, label: 'Failed', className: 'badge-failed' },
      running: { icon: <Clock size={14} />, label: 'Running', className: 'badge-running' },
      pending: { icon: <Circle size={14} />, label: 'Pending', className: 'badge-pending' },
    };
    return badges[status];
  };

  const getOverallStatus = (): TestCase['status'] => {
    if (suite.runningTests > 0) return 'running';
    if (suite.failedTests > 0) return 'failed';
    // Check if all tests have completed (passed + failed + skipped = total)
    const totalCompleted = suite.passedTests + suite.failedTests + suite.pendingTests;
    if (totalCompleted === suite.totalTests && suite.totalTests > 0) {
      // All tests completed - show passed if no failures
      return suite.failedTests === 0 ? 'passed' : 'failed';
    }
    return 'pending';
  };

  const overallStatus = getOverallStatus();
  const statusBadge = getStatusBadge(overallStatus);

  return (
    <div className="suite-card-token" data-testid={`suite-card-${suite.id}`}>
      {/* Card Header */}
      <div className="suite-card-token__header">
        <div className="suite-card-token__header-left">
          <button
            className="suite-card-token__expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse test cases' : 'Expand test cases'}
            aria-expanded={isExpanded}
            data-testid={`expand-suite-${suite.id}`}
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          <div className="suite-card-token__info">
            <h3 className="suite-card-token__name">{suite.name}</h3>
            {suite.description && <p className="suite-card-token__description">{suite.description}</p>}
            {suite.fixture && (
              <span className="suite-card-token__fixture">
                <span className="suite-card-token__fixture-label">Fixture:</span> {suite.fixture}
              </span>
            )}
          </div>
        </div>
        <div className="suite-card-token__header-right">
          <div className={`suite-card-token__status-badge ${statusBadge.className}`}>
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </div>
        </div>
      </div>

      {/* Test Stats */}
      <div className="suite-card-token__stats">
        <div className="suite-card-token__stat suite-card-token__stat--total">
          <span className="suite-card-token__stat-value">{suite.totalTests}</span>
          <span className="suite-card-token__stat-label">Total</span>
        </div>
        <div className="suite-card-token__stat suite-card-token__stat--passed">
          <span className="suite-card-token__stat-value">{suite.passedTests}</span>
          <span className="suite-card-token__stat-label">Passed</span>
        </div>
        <div className="suite-card-token__stat suite-card-token__stat--failed">
          <span className="suite-card-token__stat-value">{suite.failedTests}</span>
          <span className="suite-card-token__stat-label">Failed</span>
        </div>
        {suite.runningTests > 0 && (
          <div className="suite-card-token__stat suite-card-token__stat--running">
            <span className="suite-card-token__stat-value">{suite.runningTests}</span>
            <span className="suite-card-token__stat-label">Running</span>
          </div>
        )}
        {suite.pendingTests > 0 && (
          <div className="suite-card-token__stat suite-card-token__stat--pending">
            <span className="suite-card-token__stat-value">{suite.pendingTests}</span>
            <span className="suite-card-token__stat-label">Pending</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="suite-card-token__actions">
        <button
          className="suite-card-token__btn suite-card-token__btn--primary"
          onClick={() => onRunSuite(suite.id)}
          disabled={!isAuthenticated}
          title={isAuthenticated ? 'Run test suite' : 'Authentication required'}
          data-testid={`run-suite-${suite.id}`}
        >
          <Play size={16} />
          <span>Run Suite</span>
        </button>
        <button
          className="suite-card-token__btn suite-card-token__btn--secondary"
          onClick={() => onViewLogs(suite.id)}
          data-testid={`view-logs-${suite.id}`}
        >
          <Eye size={16} />
          <span>View Logs</span>
        </button>
        <button
          className="suite-card-token__btn suite-card-token__btn--danger"
          onClick={() => onDelete(suite.id)}
          disabled={!isAuthenticated}
          title={isAuthenticated ? 'Delete test suite' : 'Authentication required'}
          data-testid={`delete-suite-${suite.id}`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Expandable Test Cases */}
      {isExpanded && (
        <div className="suite-card-token__test-cases" data-testid={`test-cases-${suite.id}`}>
          <div className="suite-card-token__test-cases-header">
            <h4>Test Cases ({suite.testCases.length})</h4>
          </div>
          <div className="suite-card-token__test-cases-list">
            {suite.testCases.length === 0 ? (
              <div className="suite-card-token__empty-state">
                <p>No test cases in this suite</p>
              </div>
            ) : (
              suite.testCases.map((testCase, index) => {
                const caseBadge = getStatusBadge(testCase.status);
                return (
                  <div
                    key={testCase.id}
                    className={`suite-card-token__test-case ${index % 2 === 0 ? 'suite-card-token__test-case--even' : 'suite-card-token__test-case--odd'}`}
                    data-testid={`test-case-${testCase.id}`}
                  >
                    <div className="suite-card-token__test-case-info">
                      <span className="suite-card-token__test-case-name">{testCase.name}</span>
                      {testCase.lastRun && (
                        <span className="suite-card-token__test-case-meta">
                          Last run: {new Date(testCase.lastRun).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="suite-card-token__test-case-right">
                      {testCase.duration && (
                        <span className="suite-card-token__test-case-duration">{testCase.duration}ms</span>
                      )}
                      <div className={`suite-card-token__status-badge suite-card-token__status-badge--sm ${caseBadge.className}`}>
                        {caseBadge.icon}
                        <span>{caseBadge.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
