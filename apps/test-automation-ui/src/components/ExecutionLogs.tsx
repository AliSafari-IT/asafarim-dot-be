import React, { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";
import "./ExecutionLogs.css";

interface ExecutionLogsProps {
  logs: string[];
  isRunning: boolean;
}

const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ logs, isRunning }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="execution-logs">
      <div className="execution-logs__content">
        <div className="execution-logs__header">
          <h2 className="execution-logs__title">Execution Logs</h2>
          <div className="execution-logs__header-icons">
            <Terminal size={20} />
            {isRunning && <div className="execution-logs__indicator" />}
          </div>
        </div>

        <div className="execution-logs__terminal">
          {logs.length === 0 ? (
            <div className="execution-logs__empty">Waiting for test execution...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="execution-logs__line">
                <span className="execution-logs__timestamp">
                  [{new Date().toLocaleTimeString()}]
                </span>{" "}
                {log}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};

export default ExecutionLogs;
