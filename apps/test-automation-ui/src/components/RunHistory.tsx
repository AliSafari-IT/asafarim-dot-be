import React, { useState } from "react";
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import "./RunHistory.css";

interface TestRun {
  id: string;
  runName?: string;
  name?: string;
  status?: string;
  Status?: string;
  startedAt?: string;
  StartedAt?: string;
  duration?: string;
  totalTests?: number;
  TotalTests?: number;
  passedTests?: number;
  PassedTests?: number;
  failedTests?: number;
  FailedTests?: number;
}

interface RunHistoryProps {
  runs: TestRun[];
}

const ITEMS_PER_PAGE = 10;

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateString;
  }
};

// Helper function to get status value (handle both camelCase and PascalCase)
const getStatus = (run: TestRun): string => {
  const status = (run.status || run.Status || "running").toLowerCase();
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  return "running";
};

// Helper function to get field value (handle both camelCase and PascalCase)
const getFieldValue = <T,>(run: TestRun, camelCase: keyof TestRun, pascalCase: keyof TestRun): T | undefined => {
  return (run[camelCase] || run[pascalCase]) as T | undefined;
};

const RunHistory: React.FC<RunHistoryProps> = ({ runs }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(runs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRuns = runs.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <div className="run-history">
      <div className="run-history__content">
        <h2 className="run-history__title">Run History</h2>
        <div className="run-history__table-wrapper">
          <table className="run-history__table">
            <thead className="run-history__thead">
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Date</th>
                <th>Results</th>
              </tr>
            </thead>
            <tbody className="run-history__tbody">
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="run-history__empty">
                    No test runs yet
                  </td>
                </tr>
              ) : (
                paginatedRuns.map((run) => {
                  const runName = run.runName || run.name || "Unnamed Run";
                  const status = getStatus(run);
                  const startedAt = formatDate(run.StartedAt || run.startedAt);
                  const totalTests = getFieldValue<number>(run, "totalTests", "TotalTests") || 0;
                  const passedTests = getFieldValue<number>(run, "passedTests", "PassedTests") || 0;
                  
                  return (
                    <tr key={run.id}>
                      <td className="run-history__cell">{runName}</td>
                      <td className="run-history__cell">
                        <div
                          className={`run-history__status ${
                            status === "completed"
                              ? "run-history__status--passed"
                              : status === "failed"
                              ? "run-history__status--failed"
                              : "run-history__status--running"
                          }`}
                        >
                          {status === "completed" && (
                            <>
                              <CheckCircle size={16} />
                              <span>Passed</span>
                            </>
                          )}
                          {status === "failed" && (
                            <>
                              <XCircle size={16} />
                              <span>Failed</span>
                            </>
                          )}
                          {status === "running" && (
                            <>
                              <Clock size={16} className="run-history__icon--spin" />
                              <span>Running</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="run-history__cell">{startedAt}</td>
                      <td className="run-history__cell">
                        {passedTests}/{totalTests} passed
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        {runs.length > 0 && (
          <div className="run-history__pagination">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="run-history__pagination-btn"
              title="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="run-history__pagination-info">
              Page {currentPage} of {totalPages} ({runs.length} total runs)
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="run-history__pagination-btn"
              title="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunHistory;
