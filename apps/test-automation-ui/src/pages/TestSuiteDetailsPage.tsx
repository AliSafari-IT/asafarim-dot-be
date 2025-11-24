import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../config/api';
import { useToast } from '@asafarim/toast';
import { ButtonComponent } from '@asafarim/shared-ui-react';
import { ArrowLeft, Play, Eye, Edit } from 'lucide-react';
import { TestCafeFileViewer } from '../components/TestCafeFileViewer';
import './TestSuiteDetailsPage.css';

interface TestSuite {
  id: string;
  name: string;
  description?: string;
  fixtureId: string;
  executionOrder: number;
  isActive: boolean;
  generatedTestCafeFile?: string;
  generatedFilePath?: string;
  generatedAt?: string;
  passed?: boolean;
}

interface Fixture {
  id: string;
  name: string;
  description?: string;
  pageUrl?: string;
  remark?: string;
}

interface TestCase {
  id: string;
  name: string;
  description?: string;
  testType: string;
  executionOrder: number;
  isActive: boolean;
}

export default function TestSuiteDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [fixture, setFixture] = useState<Fixture | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingTestCafe, setViewingTestCafe] = useState(false);

  useEffect(() => {
    if (id) {
      loadTestSuiteDetails();
    }
  }, [id]);

  const loadTestSuiteDetails = async () => {
    try {
      setLoading(true);
      
      // Load test suite
      const suiteResponse = await api.get(`/api/test-suites/${id}`);
      setTestSuite(suiteResponse.data);

      // Load fixture
      const fixtureResponse = await api.get(`/api/fixtures/${suiteResponse.data.fixtureId}`);
      setFixture(fixtureResponse.data);

      // Load test cases
      const casesResponse = await api.get(`/api/test-cases?testSuiteId=${id}`);
      setTestCases(casesResponse.data || []);
    } catch (error: any) {
      console.error('Failed to load test suite details:', error);
      toast.error('Failed to load test suite details');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTestSuite = async () => {
    if (!testSuite) return;

    try {
      toast.success(`Starting test run for "${testSuite.name}"...`);
      
      const response = await api.post('/api/test-execution/run', {
        runName: `${testSuite.name} - ${new Date().toLocaleString()}`,
        environment: 'Development',
        browser: 'chrome',
        testSuiteIds: [testSuite.id],
        functionalRequirementId: fixture?.id,
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
      <div className="test-suite-details-page">
        <div className="loading">Loading test suite details...</div>
      </div>
    );
  }

  if (!testSuite) {
    return (
      <div className="test-suite-details-page">
        <div className="error">Test suite not found</div>
        <ButtonComponent onClick={() => navigate('/test-suites')}>
          <ArrowLeft size={16} /> Back to Test Suites
        </ButtonComponent>
      </div>
    );
  }

  return (
    <div className="test-suite-details-page">
      <div className="page-header">
        <ButtonComponent variant="secondary" onClick={() => navigate('/test-suites')}>
          <ArrowLeft size={16} /> Back
        </ButtonComponent>
        <h1>{testSuite.name}</h1>
        <div className="header-actions">
          <ButtonComponent variant="secondary" onClick={() => navigate(`/test-suites?edit=${testSuite.id}`)}>
            <Edit size={16} /> Edit
          </ButtonComponent>
          {testSuite.generatedTestCafeFile && (
            <ButtonComponent variant="secondary" onClick={() => setViewingTestCafe(true)}>
              <Eye size={16} /> View Test File
            </ButtonComponent>
          )}
          <ButtonComponent onClick={handleRunTestSuite}>
            <Play size={16} /> Run Tests
          </ButtonComponent>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-section">
          <h2>Test Suite Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{testSuite.name}</span>
            </div>
            <div className="info-item">
              <label>Description:</label>
              <span>{testSuite.description || 'No description'}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status ${testSuite.isActive ? 'active' : 'inactive'}`}>
                {testSuite.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="info-item">
              <label>Execution Order:</label>
              <span>{testSuite.executionOrder}</span>
            </div>
            <div className="info-item">
              <label>Last Run:</label>
              <span className={`status ${testSuite.passed === true ? 'passed' : testSuite.passed === false ? 'failed' : 'never-run'}`}>
                {testSuite.passed === true ? '✓ Passed' : testSuite.passed === false ? '✗ Failed' : 'Never run'}
              </span>
            </div>
            {testSuite.generatedAt && (
              <div className="info-item">
                <label>Generated At:</label>
                <span>{new Date(testSuite.generatedAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {fixture && (
          <div className="details-section">
            <h2>Fixture Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{fixture.name}</span>
              </div>
              <div className="info-item">
                <label>Description:</label>
                <span>{fixture.description || 'No description'}</span>
              </div>
              {fixture.pageUrl && (
                <div className="info-item">
                  <label>Page URL:</label>
                  <span><a href={fixture.pageUrl} target="_blank" rel="noopener noreferrer">{fixture.pageUrl}</a></span>
                </div>
              )}
              {fixture.remark && (
                <div className="info-item warning">
                  <label>⚠️ Issues:</label>
                  <span>{fixture.remark}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="details-section">
          <h2>Test Cases ({testCases.length})</h2>
          {testCases.length === 0 ? (
            <p className="empty-state">No test cases found for this suite.</p>
          ) : (
            <div className="test-cases-list">
              {testCases.map((testCase) => (
                <div key={testCase.id} className="test-case-item" onClick={() => navigate(`/test-cases/${testCase.id}`)}>
                  <div className="test-case-header">
                    <h3>{testCase.name}</h3>
                    <span className={`badge ${testCase.isActive ? 'active' : 'inactive'}`}>
                      {testCase.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {testCase.description && <p className="test-case-description">{testCase.description}</p>}
                  <div className="test-case-meta">
                    <span>Type: {testCase.testType}</span>
                    <span>Order: {testCase.executionOrder}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewingTestCafe && testSuite.id && (
        <TestCafeFileViewer
          testSuiteId={testSuite.id}
          testSuiteName={testSuite.name}
          onClose={() => setViewingTestCafe(false)}
        />
      )}
    </div>
  );
}
