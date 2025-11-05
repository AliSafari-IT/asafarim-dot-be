import { useEffect, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { api } from '../config/api';
import { useAuth } from '@asafarim/shared-ui-react';
import { createHubConnection } from '../services/signalr';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';
import './TestRunPage.css';
import TestSuiteSelector from '../components/TestSuiteSelector';
import ExecutionLogs from '../components/ExecutionLogs';
import ExecutionProgress from '../components/ExecutionProgress';
import RunHistory from '../components/RunHistory';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  testCases: number;
}

interface TestRun {
  id: string;
  name: string;
  status: 'completed' | 'failed' | 'running';
  startedAt: string;
  duration?: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export default function TestRunPage() {
  const { token } = useAuth();
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [selectedSuiteIds, setSelectedSuiteIds] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [runHistory, setRunHistory] = useState<TestRun[]>([]);
  const [progress, setProgress] = useState({
    totalTests: 0,
    completedTests: 0,
    passedTests: 0,
    failedTests: 0
  });

  // Fetch test suites
  useEffect(() => {
    const fetchSuites = async () => {
      try {
        const response = await api.get('/api/test-suites');
        setSuites(response.data || []);
      } catch (error) {
        toast.error('Failed to fetch test suites');
        console.error(error);
      }
    };
    fetchSuites();
  }, []);

  // Setup SignalR connection
  useEffect(() => {
    if (!token) return;

    const hubUrl = (import.meta as any).env.VITE_SIGNALR_URL || 'http://testora.asafarim.local:5200/hubs/testrun';
    const hubConnection = createHubConnection(hubUrl, token);

    hubConnection.on('TestUpdate', (msg: any) => {
      setLogs(prev => [...prev, msg.message || JSON.stringify(msg)]);
    });

    hubConnection.on('TestRunUpdated', (update: any) => {
      setProgress({
        totalTests: update.totalTests || progress.totalTests,
        completedTests: update.completedTests || progress.completedTests,
        passedTests: update.passedTests || progress.passedTests,
        failedTests: update.failedTests || progress.failedTests
      });
    });

    hubConnection.on('TestRunCompleted', (result: any) => {
      setIsRunning(false);
      toast.success('Test run completed!');
      setLogs(prev => [...prev, `✓ Test run completed: ${result.passedTests} passed, ${result.failedTests} failed`]);
    });

    hubConnection.start()
      .then(() => {
        console.log('SignalR Connected');
        setLogs(prev => [...prev, '✓ Connected to test server']);
      })
      .catch(err => {
        console.error('SignalR Connection Error:', err);
        toast.error('Failed to connect to test server');
      });

    setConnection(hubConnection);

    return () => {
      hubConnection.stop();
    };
  }, [token]);

  const handleSuiteSelection = (suiteId: string) => {
    setSelectedSuiteIds(prev =>
      prev.includes(suiteId) ? prev.filter(id => id !== suiteId) : [...prev, suiteId]
    );
  };

  const handleStartRun = async () => {
    if (selectedSuiteIds.length === 0) {
      toast.error('Please select at least one test suite');
      return;
    }

    try {
      setIsRunning(true);
      setLogs(['Starting test execution...']);
      setProgress({ totalTests: 0, completedTests: 0, passedTests: 0, failedTests: 0 });

      const response = await api.post('/api/test-execution/run', {
        runName: `Manual Run - ${new Date().toLocaleString()}`,
        environment: 'Development',
        browser: 'chrome',
        testSuiteIds: selectedSuiteIds
      });

      const newRunId = response.data.id;
      setRunId(newRunId);
      setLogs(prev => [...prev, `✓ Test run started with ID: ${newRunId}`]);

      if (connection) {
        await connection.invoke('JoinTestRun', newRunId);
      }
    } catch (error) {
      setIsRunning(false);
      toast.error('Failed to start test run');
      console.error(error);
    }
  };

  const handleStopRun = async () => {
    if (!runId) return;
    try {
      await api.post(`/api/test-execution/cancel/${runId}`);
      setIsRunning(false);
      setLogs(prev => [...prev, '✓ Test run cancelled']);
      toast.success('Test run cancelled');
    } catch (error) {
      toast.error('Failed to cancel test run');
      console.error(error);
    }
  };

  return (
    <div className="test-run-container">
      <div className="test-run-content">
        {/* Header */}
        <div className="test-run-header">
          <div>
            <h1 className="test-run-title">Run Tests</h1>
            <p className="test-run-subtitle">Select test suites and execute automated tests</p>
          </div>
          <div className="test-run-actions">
            <button
              onClick={handleStartRun}
              disabled={isRunning || selectedSuiteIds.length === 0}
              className="test-run-button test-run-button-primary"
            >
              <Play className="test-run-button-icon" />
              {isRunning ? 'Running...' : 'Start Run'}
            </button>
            {isRunning && (
              <button
                onClick={handleStopRun}
                className="test-run-button test-run-button-danger"
              >
                <Square className="test-run-button-icon" />
                Stop Run
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="test-run-grid">
          {/* Test Suite Selector */}
          <div className="test-run-sidebar">
            <TestSuiteSelector
              suites={suites}
              selectedSuites={selectedSuiteIds}
              onSelect={handleSuiteSelection}
            />
          </div>

          {/* Execution Logs */}
          <div className="test-run-main">
            <ExecutionLogs logs={logs} isRunning={isRunning} />
          </div>
        </div>

        {/* Progress and History */}
        <div className="test-run-progress-grid">
          <ExecutionProgress
            totalTests={progress.totalTests}
            completedTests={progress.completedTests}
            passedTests={progress.passedTests}
            failedTests={progress.failedTests}
            runId={runId || undefined}
          />
          <RunHistory runs={runHistory} />
        </div>
      </div>
    </div>
  );
}