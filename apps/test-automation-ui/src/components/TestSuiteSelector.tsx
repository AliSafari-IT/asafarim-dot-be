// apps/test-automation-ui/src/components/TestSuiteSelector.tsx
import React from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import './TestSuiteSelector.css';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  testCases: number;
}

interface TestSuiteSelectorProps {
  suites: TestSuite[];
  selectedSuites: string[];
  onSelect: (id: string) => void;
}

const TestSuiteSelector: React.FC<TestSuiteSelectorProps> = ({ suites, selectedSuites, onSelect }) => {
  return (
    <div className="suite-container">
      <div className="suite-content">
        <h2 className="suite-title">Test Suites</h2>
        <div className="suite-list">
          {suites.length === 0 ? (
            <p className="suite-empty">No test suites available</p>
          ) : (
            suites.map((suite) => (
              <div
                key={suite.id}
                className={`suite-item ${selectedSuites.includes(suite.id) ? 'suite-item--selected' : ''}`}
                onClick={() => onSelect(suite.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedSuites.includes(suite.id)}
                  onChange={() => onSelect(suite.id)}
                  className="suite-checkbox"
                />
                <div className="suite-info">
                  <p className="suite-name">{suite.name}</p>
                  <p className="suite-desc">{suite.description}</p>
                  <div className="suite-meta">
                    <Clock className="suite-icon" />
                    {suite.testCases} test cases
                  </div>
                </div>
                <div className="suite-status">
                  {suite.status === 'completed' && <CheckCircle className="status-icon success" />}
                  {suite.status === 'failed' && <XCircle className="status-icon error" />}
                  {suite.status === 'running' && <RefreshCw className="status-icon running" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSuiteSelector;
