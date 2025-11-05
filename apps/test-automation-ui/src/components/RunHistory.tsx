import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import "./RunHistory.css";

interface TestRun {
  id: string;
  name: string;
  status: "completed" | "failed" | "running";
  startedAt: string;
  duration?: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

interface RunHistoryProps {
  runs: TestRun[];
}

const RunHistory: React.FC<RunHistoryProps> = ({ runs }) => {
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
                runs.map((run) => (
                  <tr key={run.id}>
                    <td className="run-history__cell">{run.name}</td>
                    <td className="run-history__cell">
                      <div
                        className={`run-history__status ${
                          run.status === "completed"
                            ? "run-history__status--passed"
                            : run.status === "failed"
                            ? "run-history__status--failed"
                            : "run-history__status--running"
                        }`}
                      >
                        {run.status === "completed" && (
                          <>
                            <CheckCircle size={16} />
                            <span>Passed</span>
                          </>
                        )}
                        {run.status === "failed" && (
                          <>
                            <XCircle size={16} />
                            <span>Failed</span>
                          </>
                        )}
                        {run.status === "running" && (
                          <>
                            <Clock size={16} className="run-history__icon--spin" />
                            <span>Running</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="run-history__cell">{run.startedAt}</td>
                    <td className="run-history__cell">
                      {run.passedTests}/{run.totalTests} passed
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RunHistory;
