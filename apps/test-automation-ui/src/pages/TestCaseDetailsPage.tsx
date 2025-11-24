import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { useToast } from '@asafarim/toast';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import { ArrowLeft, Play, Edit } from 'lucide-react';
import './TestCaseDetailsPage.css';

interface TestCase {
  id: string;
  name: string;
  description?: string;
  testSuiteId: string;
  testType: string;
  executionOrder: number;
  isActive: boolean;
  scriptText?: string;
  beforeTestHook?: string;
  afterTestHook?: string;
  beforeEachStepHook?: string;
  afterEachStepHook?: string;
  requestHooks?: string;
  createdAt: string;
  updatedAt: string;
}

interface TestSuite {
  id: string;
  name: string;
  description?: string;
  fixtureId: string;
}

interface TestResult {
  id: string;
  testRunId: string;
  status: string;
  durationMs: number;
  errorMessage?: string;
  stackTrace?: string;
  runAt: string;
}

export default function TestCaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [testCase, setTestCase] = useState<TestCase | null>(null);
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [recentResults, setRecentResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadTestCaseDetails();
    }
  }, [id]);

  const loadTestCaseDetails = async () => {
    try {
      setLoading(true);
      
      // Load test case
      const caseResponse = await api.get(`/api/test-cases/${id}`);
      setTestCase(caseResponse.data);

      // Load test suite
      const suiteResponse = await api.get(`/api/test-suites/${caseResponse.data.testSuiteId}`);
      setTestSuite(suiteResponse.data);

      // Load recent test results for this test case
      try {
        const resultsResponse = await api.get(`/api/test-results?testCaseId=${id}&limit=10`);
        setRecentResults(resultsResponse.data || []);
      } catch (err) {
        console.warn('Could not load test results:', err);
      }
    } catch (error: any) {
      console.error('Failed to load test case details:', error);
      toast.error('Failed to load test case details');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTestCase = async () => {
    if (!testCase || !testSuite) return;

    try {
      toast.success(`Starting test run for "${testCase.name}"...`);
      
      const response = await api.post('/api/test-execution/run', {
        runName: `${testCase.name} - ${new Date().toLocaleString()}`,
        environment: 'Development',
        browser: 'chrome',
        testSuiteIds: [testSuite.id],
      });

      const runId = response.data.id;
      toast.success('Test run started! Redirecting to results...');
      
      setTimeout(() => {
        navigate(`/test-runs/${runId}`);
      }, 1000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to start test run';
      toast.error(errorMsg);
      console.error('Test run error:', error);
    }
  };

  if (loading) {
    return (
      <div className="test-case-details-page">
        <div className="loading">Loading test case details...</div>
      </div>
    );
  }

  if (!testCase) {
    return (
      <div className="test-case-details-page">
        <div className="error">Test case not found</div>
        <ButtonComponent onClick={() => navigate('/test-cases')}>
          <ArrowLeft size={16} /> Back to Test Cases
        </ButtonComponent>
      </div>
    );
  }

  return (
    <div className="test-case-details-page">
      <div className="page-header">
        <ButtonComponent variant="secondary" onClick={() => navigate('/test-cases')}>
          <ArrowLeft size={16} /> Back
        </ButtonComponent>
        <h1>{testCase.name}</h1>
        <div className="header-actions">
          <ButtonComponent variant="secondary" onClick={() => navigate(`/test-cases?edit=${testCase.id}`)}>
            <Edit size={16} /> Edit
          </ButtonComponent>
          <ButtonComponent onClick={handleRunTestCase}>
            <Play size={16} /> Run Test
          </ButtonComponent>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-section">
          <h2>Test Case Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{testCase.name}</span>
            </div>
            <div className="info-item">
              <label>Description:</label>
              <span>{testCase.description || 'No description'}</span>
            </div>
            <div className="info-item">
              <label>Type:</label>
              <span className="badge">{testCase.testType}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status ${testCase.isActive ? 'active' : 'inactive'}`}>
                {testCase.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="info-item">
              <label>Execution Order:</label>
              <span>{testCase.executionOrder}</span>
            </div>
            <div className="info-item">
              <label>Test Suite:</label>
              <span 
                className="link" 
                onClick={() => navigate(`/test-suites/${testSuite?.id}`)}
              >
                {testSuite?.name || 'Unknown'}
              </span>
            </div>
            <div className="info-item">
              <label>Created:</label>
              <span>{new Date(testCase.createdAt).toLocaleString()}</span>
            </div>
            <div className="info-item">
              <label>Updated:</label>
              <span>{new Date(testCase.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {testCase.scriptText && (
          <div className="details-section">
            <h2>Test Script</h2>
            <pre className="code-block">{testCase.scriptText}</pre>
          </div>
        )}

        {(testCase.beforeTestHook || testCase.afterTestHook || testCase.beforeEachStepHook || testCase.afterEachStepHook) && (
          <div className="details-section">
            <h2>Hooks</h2>
            {testCase.beforeTestHook && (
              <div className="hook-section">
                <h3>Before Test Hook</h3>
                <pre className="code-block">{testCase.beforeTestHook}</pre>
              </div>
            )}
            {testCase.afterTestHook && (
              <div className="hook-section">
                <h3>After Test Hook</h3>
                <pre className="code-block">{testCase.afterTestHook}</pre>
              </div>
            )}
            {testCase.beforeEachStepHook && (
              <div className="hook-section">
                <h3>Before Each Step Hook</h3>
                <pre className="code-block">{testCase.beforeEachStepHook}</pre>
              </div>
            )}
            {testCase.afterEachStepHook && (
              <div className="hook-section">
                <h3>After Each Step Hook</h3>
                <pre className="code-block">{testCase.afterEachStepHook}</pre>
              </div>
            )}
          </div>
        )}

        {recentResults.length > 0 && (
          <div className="details-section">
            <h2>Recent Test Results ({recentResults.length})</h2>
            <div className="results-list">
              {recentResults.map((result) => (
                <div 
                  key={result.id} 
                  className={`result-item ${result.status.toLowerCase()}`}
                  onClick={() => navigate(`/test-runs/${result.testRunId}`)}
                >
                  <div className="result-header">
                    <span className={`status-badge ${result.status.toLowerCase()}`}>
                      {result.status}
                    </span>
                    <span className="result-date">
                      {new Date(result.runAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="result-meta">
                    <span>Duration: {result.durationMs}ms</span>
                  </div>
                  {result.errorMessage && (
                    <div className="result-error">
                      <strong>Error:</strong> {result.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
