import React, { useState, useEffect } from 'react';
import { TestSuitesGridToken } from '../components/TestSuitesGrid-Token';
import { TestSuite } from '../components/TestSuiteCard-Token';
import { useAuth } from '@asafarim/shared-ui-react';
import { useToast } from '@asafarim/toast';
import { Play } from 'lucide-react';
import { api } from '../config/api';
import './RunTestsPage-Token.css';

interface ApiTestSuite {
  id: string;
  name: string;
  description?: string;
  fixtureId?: string;
  executionOrder?: number;
  isActive?: boolean;
}

interface ApiTestCase {
  id: string;
  name: string;
  testSuiteId: string;
}

interface ApiFixture {
  id: string;
  name: string;
}

export const RunTestsPageToken: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  useEffect(() => {
    loadTestSuites();
  }, []);

  const loadTestSuites = async () => {
    try {
      setLoading(true);
      
      const [suitesResponse, testCasesResponse, fixturesResponse] = await Promise.all([
        api.get('/api/test-suites'),
        api.get('/api/test-cases'),
        api.get('/api/fixtures'),
      ]);

      const apiSuites: ApiTestSuite[] = suitesResponse.data || [];
      const apiTestCases: ApiTestCase[] = testCasesResponse.data || [];
      const apiFixtures: ApiFixture[] = fixturesResponse.data || [];

      const fixtureMap = new Map(apiFixtures.map(f => [f.id, f.name]));

      const transformedSuites: TestSuite[] = apiSuites.map(suite => {
        const suiteCases = apiTestCases.filter(tc => tc.testSuiteId === suite.id);
        
        return {
          id: suite.id,
          name: suite.name,
          description: suite.description,
          fixture: suite.fixtureId ? fixtureMap.get(suite.fixtureId) : undefined,
          testCases: suiteCases.map(tc => ({
            id: tc.id,
            name: tc.name,
            status: 'pending' as const,
          })),
          totalTests: suiteCases.length,
          passedTests: 0,
          failedTests: 0,
          runningTests: 0,
          pendingTests: suiteCases.length,
          executionOrder: suite.executionOrder,
          isActive: suite.isActive,
        };
      });

      setTestSuites(transformedSuites);
    } catch (error) {
      console.error('Failed to load test suites:', error);
      toast.error('Failed to load test suites');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSuite = async (suiteId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be authenticated to run test suites');
      return;
    }
    try {
      toast.info(`Starting test suite...`);
      
      const response = await api.post('/api/test-execution/run', {
        runName: `Test Suite Run - ${new Date().toLocaleString()}`,
        environment: 'Development',
        browser: 'chrome',
        testSuiteIds: [suiteId],
      });

      const runId = response.data.id;
      
      setTestSuites((prev) =>
        prev.map((suite) =>
          suite.id === suiteId ? { ...suite, runningTests: suite.totalTests, passedTests: 0, failedTests: 0, pendingTests: 0 } : suite
        )
      );
      toast.success(`Test suite started (Run ID: ${runId})`);
    } catch (error: any) {
      console.error('Failed to run test suite:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to start test suite';
      toast.error(errorMsg);
    }
  };

  const handleViewLogs = (suiteId: string) => {
    window.location.href = '/test-runs';
  };

  const handleDelete = async (suiteId: string) => {
    if (!isAuthenticated) {
      toast.error('You must be authenticated to delete test suites');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this test suite?')) return;
    try {
      await api.delete(`/api/test-suites/${suiteId}`);
      setTestSuites((prev) => prev.filter((suite) => suite.id !== suiteId));
      toast.success('Test suite deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete test suite:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete test suite';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="run-tests-page-token">
        <div className="run-tests-page-token__loading">
          <div className="run-tests-page-token__spinner" />
          <p>Loading test suites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="run-tests-page-token">
      <div className="run-tests-page-token__header">
        <div className="run-tests-page-token__header-content">
          <h1 className="run-tests-page-token__title">Run Tests</h1>
          <p className="run-tests-page-token__subtitle">Select test suites and execute automated tests</p>
        </div>
        <div className="run-tests-page-token__header-actions">
          <button
            className="run-tests-page-token__btn-primary"
            disabled={!isAuthenticated}
            title={!isAuthenticated ? 'Authentication required' : 'Run all test suites'}
          >
            <Play size={20} />
            <span>Run All</span>
          </button>
        </div>
      </div>
      <TestSuitesGridToken
        suites={testSuites}
        onRunSuite={handleRunSuite}
        onViewLogs={handleViewLogs}
        onDelete={handleDelete}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};
