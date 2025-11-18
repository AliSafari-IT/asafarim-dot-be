import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Circle,
} from "lucide-react";
import "./TestSuiteCard.css";

export interface TestCase {
  id: string;
  name: string;
  status: "passed" | "failed" | "running" | "pending";
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
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export const TestSuiteCard: React.FC<TestSuiteCardProps> = ({
  suite,
  onRunSuite,
  onViewLogs,
  onDelete,
  isAuthenticated = true,
  isExpanded: initialExpanded = false,
  isSelected = false,
  onToggleSelection,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const getStatusBadge = (status: TestCase["status"]) => {
    const badges = {
      passed: {
        icon: <CheckCircle size={14} />,
        label: "Passed",
        className: "badge-passed",
      },
      failed: {
        icon: <XCircle size={14} />,
        label: "Failed",
        className: "badge-failed",
      },
      running: {
        icon: <Clock size={14} />,
        label: "Running",
        className: "badge-running",
      },
      pending: {
        icon: <Circle size={14} />,
        label: "Pending",
        className: "badge-pending",
      },
    };
    return badges[status];
  };

  const getOverallStatus = (): TestCase["status"] => {
    if (suite.runningTests > 0) return "running";
    if (suite.failedTests > 0) return "failed";
    // Check if all tests have completed (passed + failed + skipped = total)
    const totalCompleted =
      suite.passedTests + suite.failedTests + suite.pendingTests;
    if (totalCompleted === suite.totalTests && suite.totalTests > 0) {
      // All tests completed - show passed if no failures
      return suite.failedTests === 0 ? "passed" : "failed";
    }
    return "pending";
  };

  const overallStatus = getOverallStatus();
  const statusBadge = getStatusBadge(overallStatus);

  return (
    <div
      className={`test-suite-card ${isSelected ? "selected" : ""}`}
      data-testid={`suite-card-${suite.id}`}
    >
      {/* Card Header */}
      <div className="suite-card-header">
        <div className="suite-header-left">
          {onToggleSelection && (
            <label
              className="suite-checkbox"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelection}
                aria-label={`Select ${suite.name}`}
              />
            </label>
          )}
          <button
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={
              isExpanded ? "Collapse test cases" : "Expand test cases"
            }
            data-testid={`expand-suite-${suite.id}`}
          >
            {isExpanded ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
          <div className="suite-info">
            <h3 className="suite-name">{suite.name}</h3>
            {suite.description && (
              <p className="suite-description">{suite.description}</p>
            )}
            {suite.fixture && (
              <span className="suite-fixture">
                <span className="fixture-label">Fixture:</span> {suite.fixture}
              </span>
            )}
          </div>
        </div>
        <div className="suite-header-right">
          <div className={`status-badge ${statusBadge.className}`}>
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </div>
        </div>
      </div>

      {/* Test Stats */}
      <div className="suite-stats">
        <div className="stat-item stat-total">
          <span className="stat-value">{suite.totalTests}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item stat-passed">
          <span className="stat-value">{suite.passedTests}</span>
          <span className="stat-label">Passed</span>
        </div>
        <div className="stat-item stat-failed">
          <span className="stat-value">{suite.failedTests}</span>
          <span className="stat-label">Failed</span>
        </div>
        {suite.runningTests > 0 && (
          <div className="stat-item stat-running">
            <span className="stat-value">{suite.runningTests}</span>
            <span className="stat-label">Running</span>
          </div>
        )}
        {suite.pendingTests > 0 && (
          <div className="stat-item stat-pending">
            <span className="stat-value">{suite.pendingTests}</span>
            <span className="stat-label">Pending</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="suite-actions">
        <button
          className="button button-primary"
          onClick={() => onRunSuite(suite.id)}
          disabled={!isAuthenticated}
          title={isAuthenticated ? "Run test suite" : "Authentication required"}
          data-testid={`run-suite-${suite.id}`}
        >
          <Play size={16} />
          <span>Run Suite</span>
        </button>
        <button
          className="button button-secondary"
          onClick={() => onViewLogs(suite.id)}
          data-testid={`view-logs-${suite.id}`}
        >
          <Eye size={16} />
          <span>View Logs</span>
        </button>
        <button
          className="button button-danger"
          onClick={() => onDelete(suite.id)}
          disabled={!isAuthenticated}
          title={
            isAuthenticated ? "Delete test suite" : "Authentication required"
          }
          data-testid={`delete-suite-${suite.id}`}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Expandable Test Cases */}
      {isExpanded && (
        <div
          className="test-cases-container"
          data-testid={`test-cases-${suite.id}`}
        >
          <div className="test-cases-header">
            <h4>Test Cases ({suite.testCases.length})</h4>
          </div>
          <div className="test-cases-list">
            {suite.testCases.length === 0 ? (
              <div className="empty-state">
                <p>No test cases in this suite</p>
              </div>
            ) : (
              suite.testCases.map((testCase) => {
                const caseBadge = getStatusBadge(testCase.status);
                return (
                  <div
                    key={testCase.id}
                    className="test-case-item"
                    data-testid={`test-case-${testCase.id}`}
                  >
                    <div className="test-case-info">
                      <span className="test-case-name">{testCase.name}</span>
                      {testCase.lastRun && (
                        <span className="test-case-meta">
                          Last run:{" "}
                          {new Date(testCase.lastRun).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="test-case-right">
                      {testCase.duration && (
                        <span className="test-case-duration">
                          {testCase.duration}ms
                        </span>
                      )}
                      <div
                        className={`status-badge status-badge-sm ${caseBadge.className}`}
                      >
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
