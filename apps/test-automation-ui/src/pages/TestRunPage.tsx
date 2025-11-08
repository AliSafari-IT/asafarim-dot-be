import { useEffect, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { api } from '../config/api';
import { useAuth } from '@asafarim/shared-ui-react';
import { createHubConnection } from '../services/signalr';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';
import TestSuiteSelector from '../components/TestSuiteSelector';
import ExecutionLogs from '../components/ExecutionLogs';
import ExecutionProgress from '../components/ExecutionProgress';
import RunHistory from '../components/RunHistory';
import './TestRunPage.css';
import { useNavigate } from 'react-router-dom';

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
  const [allSuites, setAllSuites] = useState<TestSuite[]>([]); // Store all suites
  const [suites, setSuites] = useState<TestSuite[]>([]); // Filtered suites to display
  const [selectedSuiteIds, setSelectedSuiteIds] = useState<string[]>([]);
  const [selectedFunctionalRequirementId, setSelectedFunctionalRequirementId] = useState<string>('');
  const [functionalRequirements, setFunctionalRequirements] = useState<any[]>([]);
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
  const navigate = useNavigate();

  // Fetch test suites, functional requirements, and run history on page load
  useEffect(() => {
    const fetchSuites = async () => {
      try {
        const response = await api.get('/api/test-suites');
        const suitesData = response.data || [];
        setAllSuites(suitesData);
        setSuites(suitesData); // Initially show all suites
      } catch (error) {
        toast.error('Failed to fetch test suites');
        console.error(error);
      }
    };
    
    const fetchFunctionalRequirements = async () => {
      try {
        const response = await api.get('/api/functional-requirements');
        setFunctionalRequirements(response.data || []);
      } catch (error) {
        console.error('Failed to fetch functional requirements:', error);
      }
    };
    
    fetchSuites();
    fetchFunctionalRequirements();
    fetchRunHistory();
  }, []);

  // Filter test suites when functional requirement changes
  useEffect(() => {
    if (!selectedFunctionalRequirementId) {
      // No FR selected, show all suites
      setSuites(allSuites);
      setSelectedSuiteIds([]); // Clear selection when filter changes
    } else {
      // FR selected, fetch filtered suites
      const fetchFilteredSuites = async () => {
        try {
          const response = await api.get(`/api/test-suites?functionalRequirementId=${selectedFunctionalRequirementId}`);
          setSuites(response.data || []);
          setSelectedSuiteIds([]); // Clear selection when filter changes
        } catch (error) {
          console.error('Failed to fetch filtered test suites:', error);
          toast.error('Failed to filter test suites');
        }
      };
      fetchFilteredSuites();
    }
  }, [selectedFunctionalRequirementId, allSuites]);

  // Setup SignalR connection
  useEffect(() => {
    if (!token) return;

    const hubUrl = (import.meta as any).env.VITE_SIGNALR_URL || 'http://testora.asafarim.local:5200/hubs/testrun';
    const hubConnection = createHubConnection(hubUrl, token);

    hubConnection.on('TestUpdate', (msg: any) => {
      setLogs(prev => [...prev, msg.message || JSON.stringify(msg)]);
    });

    hubConnection.on('TestRunUpdated', (update: any) => {
      console.log('TestRunUpdated event received:', update);
      setProgress({
        totalTests: update.totalTests || progress.totalTests,
        completedTests: update.completedTests || progress.completedTests,
        passedTests: update.passedTests || progress.passedTests,
        failedTests: update.failedTests || progress.failedTests
      });
    });

    hubConnection.on('TestRunCompleted', (result: any) => {
      console.log('✅ TestRunCompleted event received:', result);
      setIsRunning(false);
      setProgress({
        totalTests: result.totalTests || 0,
        completedTests: result.totalTests || 0,
        passedTests: result.passedTests || 0,
        failedTests: result.failedTests || 0
      });
      toast.success('Test run completed!');
      setLogs(prev => [...prev, `✓ Test run completed: ${result.passedTests} passed, ${result.failedTests} failed`]);
      // Fetch updated run history
      fetchRunHistory();
    });

    // Fallback for lowercase event name (SignalR case sensitivity)
    hubConnection.on('testruncompleted', (result: any) => {
      console.log('✅ testruncompleted event received:', result);
      setIsRunning(false);
      setProgress({
        totalTests: result.totalTests || 0,
        completedTests: result.totalTests || 0,
        passedTests: result.passedTests || 0,
        failedTests: result.failedTests || 0
      });
      toast.success('Test run completed!');
      setLogs(prev => [...prev, `✓ Test run completed: ${result.passedTests} passed, ${result.failedTests} failed`]);
      // Fetch updated run history
      fetchRunHistory();
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

  const fetchRunHistory = async () => {
    try {
      const response = await api.get('/api/test-execution/runs');
      setRunHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch run history:', error);
    }
  };

  const handleSuiteSelection = (suiteIdOrMsg: string) => {
    if (suiteIdOrMsg === "create-test-suite") {
      navigate('/test-suites');
      return;
    }
    setSelectedSuiteIds(prev =>
      prev.includes(suiteIdOrMsg) ? prev.filter(id => id !== suiteIdOrMsg) : [...prev, suiteIdOrMsg]
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
        testSuiteIds: selectedSuiteIds,
        functionalRequirementId: selectedFunctionalRequirementId || null
      });

      const newRunId = response.data.id;
      setRunId(newRunId);
      setLogs(prev => [...prev, `✓ Test run started with ID: ${newRunId}`]);

      if (connection) {
        await connection.invoke('JoinTestRun', newRunId);
      }
    } catch (error: any) {
      setIsRunning(false);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to start test run';
      toast.error(errorMsg);
      console.error('Test run error:', error);
      setLogs(prev => [...prev, `✗ Error: ${errorMsg}`]);
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
            {/* Functional Requirement Selector */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Functional Requirement (Optional)
              </label>
              <select
                value={selectedFunctionalRequirementId}
                onChange={(e) => setSelectedFunctionalRequirementId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-background)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">-- Select Functional Requirement --</option>
                {functionalRequirements.map((fr) => (
                  <option key={fr.id} value={fr.id}>
                    {fr.name}
                  </option>
                ))}
              </select>
            </div>
            
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