// apps/test-automation-ui/src/components/ExecutionProgress.tsx
import React from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import './ExecutionProgress.css';

interface ExecutionProgressProps {
  totalTests: number;
  completedTests: number;
  passedTests: number;
  failedTests: number;
  runId?: string;
}

const ExecutionProgress: React.FC<ExecutionProgressProps> = ({
  totalTests,
  completedTests,
  passedTests,
  failedTests,
  runId,
}) => {
  const progress = totalTests === 0 ? 0 : (completedTests / totalTests) * 100;
  const remainingTests = totalTests - completedTests;

  return (
    <div className="exec-container">
      <div className="exec-content">
        <div className="exec-header">
          <h2 className="exec-title">Test Progress</h2>
          {runId && <span className="exec-runid">Run ID: {runId}</span>}
        </div>

        <div className="exec-progress-section">
          <div className="exec-progress-info">
            <span>{completedTests} of {totalTests} tests completed</span>
            <span className="exec-progress-percent">{Math.round(progress)}%</span>
          </div>
          <div className="exec-progress-bar">
            <div className="exec-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="exec-grid">
          <div className="exec-card success">
            <div className="exec-card-header">
              <CheckCircle className="exec-icon success" />
              <span>Passed</span>
            </div>
            <p className="exec-count success">{passedTests}</p>
          </div>

          <div className="exec-card error">
            <div className="exec-card-header">
              <XCircle className="exec-icon error" />
              <span>Failed</span>
            </div>
            <p className="exec-count error">{failedTests}</p>
          </div>

          <div className="exec-card running">
            <div className="exec-card-header">
              <RefreshCw className="exec-icon running" />
              <span>Remaining</span>
            </div>
            <p className="exec-count running">{remainingTests}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionProgress;
