import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";
import { API_BASE } from "../config/api";
import "./TestRunDetailsPage.css";
import React from "react";
import { ButtonComponent } from "@asafarim/shared-ui-react";
import { Copy } from "lucide-react";
import { useToast } from "@asafarim/toast";
import { fetchTestRunReport } from "../hooks/useTestrunReport";

interface TestRun {
  id: string;
  runName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  duration: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  successRate: number;
  environment?: string;
  browser?: string;
}

interface TestResult {
  id: string;
  testCaseName?: string;
  status: string;
  durationMs: number;
  errorMessage?: string;
  stackTrace?: string;
  screenshotPath?: string;
  runAt: string;
}

type FilterStatus = "all" | "passed" | "failed" | "skipped";

export function TestRunDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const toast = useToast();

  // Fetch test run details and results
  useEffect(() => {
    if (!id) return;

    const fetchTestRun = async () => {
      try {
        // Fetch run metadata
        const runResponse = await fetch(`${API_BASE}/api/test-runs/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });

        if (!runResponse.ok) {
          throw new Error(
            `Failed to fetch test run: ${runResponse.statusText}`
          );
        }

        const runData = await runResponse.json();
        setTestRun(runData);

        // Fetch results
        const resultsResponse = await fetch(
          `${API_BASE}/api/test-runs/${id}/results`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            credentials: "include",
          }
        );

        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          console.log("Fetched results from API:", resultsData);
          console.log("Results count:", resultsData.length);
          if (resultsData.length > 0) {
            console.log("First result status:", resultsData[0].status);
          }
          setResults(resultsData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestRun();
  }, [id]);

  // Fetch filtered results
  useEffect(() => {
    if (!id) return;

    const fetchResults = async () => {
      // Capitalize status for API (Passed, Failed, Skipped)
      const statusParam =
        filter === "all"
          ? ""
          : `?status=${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
      const url = `${API_BASE}/api/test-runs/${id}/results${statusParam}`;

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data);
        } else {
          console.error(`Failed to fetch results: ${response.status}`);
        }
      } catch (err) {
        console.error("Failed to fetch results:", err);
      }
    };

    fetchResults();
  }, [id, filter]);

  // SignalR connection
  useEffect(() => {
    if (!id) return;

    const setupSignalR = async () => {
      const newConnection = new HubConnectionBuilder()
        .withUrl(`${API_BASE}/hubs/testrun`)
        .withAutomaticReconnect()
        .build();

      try {
        await newConnection.start();
        console.log("✅ Connected to SignalR Hub");

        await newConnection.invoke("JoinTestRun", id);
        console.log(`✅ Joined test run group: ${id}`);

        newConnection.on("TestRunUpdated", (data: any) => {
          console.log("📊 Test run updated:", data);
          setTestRun((prev) => (prev ? { ...prev, ...data } : null));
        });

        newConnection.on("TestResultAdded", (data: any) => {
          console.log("✅ Test result added:", data);
          setResults((prev) => [...prev, data]);
        });

        newConnection.on("TestRunCompleted", (data: any) => {
          console.log("🎉 Test run completed:", data);
          setTestRun((prev) =>
            prev ? { ...prev, status: data.status } : null
          );
        });

        newConnection.on("ExecutionLog", (log: string) => {
          console.log("📝 Execution log:", log);
          setExecutionLogs((prev) => [...prev, log]);
        });

        newConnection.on("TestUpdate", (msg: any) => {
          const logMessage = msg.message || JSON.stringify(msg);
          console.log("📝 Test update:", logMessage);
          setExecutionLogs((prev) => [...prev, logMessage]);
        });

        setConnection(newConnection);
      } catch (err) {
        console.error("❌ Failed to connect to SignalR:", err);
      }
    };

    setupSignalR();

    return () => {
      connection?.stop();
    };
  }, [id]);

  const downloadReport = (format: "html" | "json") => {
    window.open(
      `${API_BASE}/api/test-runs/${id}/download?format=${format}`,
      "_blank"
    );
  };

  const copyReport = async (format: "html" | "json") => {
    try {
      console.log(`📋 Fetching ${format} report for run ${id}`);
      const report = await fetchTestRunReport(id!, format);
      console.log(`📋 Report fetched, length: ${report.length}`);

      if (!report || report.length === 0) {
        toast.error("Report is empty");
        return;
      }

      // Try using Clipboard API first (modern browsers)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(report);
        console.log(`✅ Report copied to clipboard`);
        toast.info(`Report in ${format} is copied to clipboard.`);
      } else {
        // Fallback: create a temporary textarea and copy using execCommand
        const textarea = document.createElement("textarea");
        textarea.value = report;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        console.log(`✅ Report copied to clipboard (fallback method)`);
        toast.info(`Report in ${format} is copied to clipboard.`);
      }
    } catch (error: any) {
      console.error("❌ Failed to copy report:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error(`Failed to copy report: ${error.message}`);
    }
  };

  const rerunFailed = async () => {
    if (!id) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${API_BASE}/api/test-runs/${id}/rerun-failed`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        navigate(`/test-runs/${data.runId}`);
      } else if (response.status === 400) {
        const error = await response.text();
        if (error.includes("No failed tests to rerun")) {
          alert("There are no failed tests to rerun.");
        } else {
          console.error("Rerun failed:", error);
          alert(`Failed to create rerun: ${error}`);
        }
      } else {
        const error = await response.text();
        console.error("Rerun failed:", error);
        alert(`Failed to create rerun: ${error}`);
      }
    } catch (err) {
      console.error("Failed to rerun failed tests:", err);
      alert("Failed to rerun failed tests");
    }
  };

  const stopRun = async () => {
    if (!id) return;

    try {
      const response = await fetch(`${API_BASE}/api/test-runs/${id}/stop`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        setTestRun((prev) => (prev ? { ...prev, status: "Cancelled" } : null));
        alert("Test run stopped");
      } else {
        alert("Failed to stop test run");
      }
    } catch (err) {
      console.error("Failed to stop test run:", err);
      alert("Failed to stop test run");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClass = status.toLowerCase();
    return (
      <span
        className={`status-badge status-${statusClass}`}
        data-testid={`status-${statusClass}`}
      >
        {status}
      </span>
    );
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds}s`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading test run details...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!testRun) {
    return <div className="error">Test run not found</div>;
  }

  console.log("Current filter:", filter);
  console.log("All results:", results);
  console.log(
    "Filtered results:",
    results.filter(
      (result) => result.status.toLowerCase() === filter.toLowerCase()
    )
  );

  const filteredResults =
    filter === "all"
      ? results
      : results.filter(
          (result) => result.status.toLowerCase() === filter.toLowerCase()
        );

  return (
    <div className="test-run-details-page" data-testid="test-run-details-page">
      <div className="page-header" data-testid="page-header">
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
          data-testid="back-button"
        >
          ← Back to Dashboard
        </button>
        <h1 data-testid="run-title">{testRun.runName}</h1>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid" data-testid="summary-grid">
        <div className="summary-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-label">Total Tests</div>
            <div className="card-value">{testRun.totalTests}</div>
          </div>
        </div>

        <div className="summary-card success">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <div className="card-label">Passed</div>
            <div className="card-value">{testRun.passedTests}</div>
          </div>
        </div>

        <div className="summary-card failure">
          <div className="card-icon">❌</div>
          <div className="card-content">
            <div className="card-label">Failed</div>
            <div className="card-value">{testRun.failedTests}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <div className="card-label">Success Rate</div>
            <div className="card-value">
              {testRun.successRate ? testRun.successRate.toFixed(1) : 0}%
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon">⏱️</div>
          <div className="card-content">
            <div className="card-label">Duration</div>
            <div className="card-value">
              {testRun.duration ? testRun.duration.toFixed(1) : 0}s
            </div>
          </div>
        </div>

        <div
          className={`summary-card ${
            testRun.status === "running" ? "status-running" : ""
          }`}
        >
          <div className="card-icon">🔄</div>
          <div className="card-content">
            <div className="card-label">Status</div>
            <div className="card-value">{getStatusBadge(testRun.status)}</div>
          </div>
        </div>
      </div>

      {/* Run Info */}
      <div className="run-info" data-testid="run-info">
        <div className="info-item" data-testid="run-info-environment">
          <strong>Environment:</strong> {testRun.environment || "N/A"}
        </div>
        <div className="info-item" data-testid="run-info-browser">
          <strong>Browser:</strong> {testRun.browser || "N/A"}
        </div>
        <div className="info-item" data-testid="run-info-started">
          <strong>Started:</strong> {formatDateTime(testRun.startedAt)}
        </div>
        {testRun.completedAt && (
          <div className="info-item" data-testid="run-info-completed">
            <strong>Completed:</strong> {formatDateTime(testRun.completedAt)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="actions-bar" data-testid="actions-bar">
        <div className="filter-group">
          <label>Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterStatus)}
            data-testid="filter-select"
          >
            <option value="all" data-testid="filter-all">
              All Tests ({results.length})
            </option>
            <option value="passed" data-testid="filter-passed">
              Passed Only ({testRun.passedTests})
            </option>
            <option value="failed" data-testid="filter-failed">
              Failed Only ({testRun.failedTests})
            </option>
            <option value="skipped" data-testid="filter-skipped">
              Skipped Only ({testRun.skippedTests})
            </option>
          </select>
        </div>

        <div className="action-buttons">
          <ButtonComponent
            variant="secondary"
            onClick={() => downloadReport("html")}
            data-testid="download-html"
          >
            📄 Download HTML
          </ButtonComponent>
          <ButtonComponent
            variant="secondary"
            onClick={() => downloadReport("json")}
            data-testid="download-json"
          >
            📋 Download JSON
          </ButtonComponent>
          <ButtonComponent
            variant="ghost"
            title={"Copy results in json"}
            onClick={() => copyReport("json")}
            data-testid="copy-json"
          >
            <Copy />
          </ButtonComponent>

          {testRun.failedTests > 0 && testRun.status !== "Running" && (
            <ButtonComponent
              variant="success"
              onClick={rerunFailed}
              data-testid="rerun-failed"
            >
              🔄 Re-run Failed Tests
            </ButtonComponent>
          )}

          {testRun.status === "Running" && (
            <ButtonComponent
              variant="danger"
              onClick={stopRun}
              data-testid="stop-run"
            >
              🛑 Stop Run
            </ButtonComponent>
          )}
        </div>
      </div>

      {/* Execution Logs - Show while running or if no results yet */}
      {(testRun?.status === "Running" ||
        (filteredResults.length === 0 && executionLogs.length > 0)) && (
        <div
          className="execution-logs-section"
          data-testid="execution-logs-section"
        >
          <h2>Execution Logs</h2>
          <div className="execution-logs-container">
            {executionLogs.length === 0 ? (
              <div className="empty-state">Waiting for test execution...</div>
            ) : (
              <div className="execution-logs-terminal">
                {executionLogs.map((log, index) => (
                  <div key={index} className="execution-log-line">
                    <span className="log-timestamp">
                      [{new Date().toLocaleTimeString()}]
                    </span>
                    <span className="log-message">{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="results-section" data-testid="results-section">
        <h2>Test Results</h2>
        {filteredResults.length === 0 ? (
          <div className="empty-state">
            {testRun?.status === "Running"
              ? "Tests are running... Check execution logs above for progress"
              : "No test results found"}
          </div>
        ) : (
          <table className="results-table" data-testid="results-table">
            <thead>
              <tr>
                <th>Test Case</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Run At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <React.Fragment key={result.id}>
                  <tr
                    className={`result-row status-${result.status.toLowerCase()}`}
                    data-testid={`result-row-${result.id}`}
                  >
                    <td>{result.testCaseName || "Unknown Test"}</td>
                    <td>{getStatusBadge(result.status)}</td>
                    <td>{formatDuration(result.durationMs)}</td>
                    <td>{formatDateTime(result.runAt)}</td>
                    <td>
                      {result.errorMessage && (
                        <button
                          className="btn-link"
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === result.id ? null : result.id
                            )
                          }
                          data-testid={`toggle-error-${result.id}`}
                        >
                          {expandedRow === result.id ? "▼ Hide" : "▶ Details"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRow === result.id && result.errorMessage && (
                    <tr
                      className="error-details-row"
                      data-testid={`error-details-row-${result.id}`}
                    >
                      <td colSpan={5}>
                        <div
                          className="error-details"
                          data-testid={`error-details-${result.id}`}
                        >
                          <div
                            className="error-message"
                            data-testid={`error-message-${result.id}`}
                          >
                            <strong>Error:</strong>
                            <pre>{result.errorMessage}</pre>
                          </div>
                          {result.stackTrace && (
                            <div
                              className="stack-trace"
                              data-testid={`stack-trace-${result.id}`}
                            >
                              <strong>Stack Trace:</strong>
                              <pre>{result.stackTrace}</pre>
                            </div>
                          )}
                          {result.screenshotPath && (
                            <div
                              className="screenshot-section"
                              data-testid={`screenshot-section-${result.id}`}
                            >
                              <strong>Screenshot:</strong>
                              <div className="screenshot-container">
                                <img
                                  src={result.screenshotPath}
                                  alt="Test failure screenshot"
                                  className="screenshot-image"
                                  data-testid={`screenshot-image-${result.id}`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
