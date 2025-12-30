import React, { useState, useEffect } from 'react';
import { TestSuitesGridToken } from '../components/TestSuitesGrid-Token';
import { TestCase, TestSuite } from '../components/TestSuiteCard-Token';
import { useAuth } from '@asafarim/shared-ui-react';
import { useToast } from '@asafarim/toast';
import { Play } from 'lucide-react';
import { api } from '../config/api';
import './RunTestsPage-Token.css';
import { useNavigate } from 'react-router-dom';

interface ApiTestSuite {
  id: string;
  name: string;
  description?: string;
  fixtureId?: string;
  executionOrder?: number;
  isActive?: boolean;
  passed?: boolean | null; // Last run result
  updatedAt: any;
}

interface ApiTestCase {
  id: string;
  name: string;
  testSuiteId: string;
  passed?: boolean | null; // Last run result
  updatedAt: any;
}

interface TestResult {
  id: string;
  testCaseId: string;
  testSuiteId: string;
  testCaseName?: string;
  status: "Passed" | "Failed" | "Skipped" | "Error";
  updatedAt?: any; // Last run timestamp
}

interface ApiFixture {
  id: string;
  name: string;
}

export const RunTestsPageToken: React.FC = () => {
const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuites, setSelectedSuites] = useState<string[]>([]);
  const [runningTestIds, setRunningTestIds] = useState<Set<string>>(new Set());
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    loadTestSuites();
  }, []);

  // Auto-refresh test results every 2 seconds if any tests are running
  useEffect(() => {
    if (runningTestIds.size === 0) return;

    const interval = setInterval(() => {
      refreshTestResults();
    }, 5000);

    return () => clearInterval(interval);
  }, [runningTestIds]);

  const loadTestSuites = async () => {
    try {
      setLoading(true);

      // Fetch test suites, test cases, and fixtures in parallel
      const [suitesResponse, testCasesResponse, fixturesResponse] =
        await Promise.all([
          api.get("/api/test-suites"),
          api.get("/api/test-cases"),
          api.get("/api/fixtures"),
        ]);

      const apiSuites: ApiTestSuite[] = suitesResponse.data || [];
      const apiTestCases: ApiTestCase[] = testCasesResponse.data || [];
      const apiFixtures: ApiFixture[] = fixturesResponse.data || [];

      // Create fixture lookup map
      const fixtureMap = new Map(apiFixtures.map((f) => [f.id, f.name]));

      // Transform API data to component format
      const transformedSuites: TestSuite[] = apiSuites.map((suite) => {
        const suiteCases = apiTestCases.filter(
          (tc) => tc.testSuiteId === suite.id
        );

        // Calculate stats from Passed property
        const passedTests = suiteCases.filter((tc) => tc.passed === true).length;
        const failedTests = suiteCases.filter((tc) => tc.passed === false).length;
        const pendingTests = suiteCases.filter((tc) => tc.passed === null || tc.passed === undefined).length;

        return {
          id: suite.id,
          name: suite.name,
          description: suite.description,
          fixture: suite.fixtureId
            ? fixtureMap.get(suite.fixtureId)
            : undefined,
          testCases: suiteCases.map((tc) => {
            // Map Passed property to status
            let status: TestCase['status'] = 'pending';
            if (tc.passed === true) status = 'passed';
            else if (tc.passed === false) status = 'failed';

            
            return {
              id: tc.id,
              name: tc.name,
              status,
              updatedAt: tc.updatedAt,
            };
          }),
          totalTests: suiteCases.length,
          passedTests,
          failedTests,
          runningTests: 0,
          pendingTests,
          executionOrder: suite.executionOrder,
          isActive: suite.isActive,
          updatedAt: suite.updatedAt,
        };
      });

      setTestSuites(transformedSuites);
    } catch (error) {
      console.error("Failed to load test suites:", error);
      toast.error("Failed to load test suites");
    } finally {
      setLoading(false);
    }
  };

  const refreshTestResults = async () => {
    try {
      // Reload test suites and test cases to get updated Passed properties
      const [suitesResponse, testCasesResponse, fixturesResponse] =
        await Promise.all([
          api.get("/api/test-suites"),
          api.get("/api/test-cases"),
          api.get("/api/fixtures"),
        ]);

      const apiSuites: ApiTestSuite[] = suitesResponse.data || [];
      const apiTestCases: ApiTestCase[] = testCasesResponse.data || [];
      const apiFixtures: ApiFixture[] = fixturesResponse.data || [];

      const fixtureMap = new Map(apiFixtures.map((f) => [f.id, f.name]));

      // Transform API data with updated Passed properties
      const transformedSuites: TestSuite[] = apiSuites.map((suite) => {
        const suiteCases = apiTestCases.filter(
          (tc) => tc.testSuiteId === suite.id
        );

        // Calculate stats from Passed property
        const passedTests = suiteCases.filter((tc) => tc.passed === true).length;
        const failedTests = suiteCases.filter((tc) => tc.passed === false).length;
        const pendingTests = suiteCases.filter((tc) => tc.passed === null || tc.passed === undefined).length;

        return {
          id: suite.id,
          name: suite.name,
          description: suite.description,
          fixture: suite.fixtureId
            ? fixtureMap.get(suite.fixtureId)
            : undefined,
          testCases: suiteCases.map((tc) => {
            // Map Passed property to status
            let status: TestCase['status'] = 'pending';
            if (tc.passed === true) status = 'passed';
            else if (tc.passed === false) status = 'failed';
            
            return {
              id: tc.id,
              name: tc.name,
              status,
              updatedAt: tc.updatedAt,
            };
          }),
          totalTests: suiteCases.length,
          passedTests,
          failedTests,
          runningTests: 0,
          pendingTests,
          executionOrder: suite.executionOrder,
          isActive: suite.isActive,
          updatedAt: suite.updatedAt,
        };
      });

      setTestSuites(transformedSuites);

      // Check if all running tests are done
      const allDone = Array.from(runningTestIds).every((suiteId) => {
        const suite = transformedSuites.find((s) => s.id === suiteId);
        return suite && suite.runningTests === 0 && suite.pendingTests === 0;
      });

      if (allDone && runningTestIds.size > 0) {
        setRunningTestIds(new Set());
      }
    } catch (error) {
      console.error("Failed to refresh test results:", error);
    }
  };

  const handleRunSuite = async (suiteId: string) => {
    if (!isAuthenticated) {
      toast.error("You must be authenticated to run test suites");
      return;
    }

    try {
      // Find the suite name from testSuites array
      const suite = testSuites.find((s) => s.id === suiteId);
      const suiteName = suite?.name || "Test Suite";

      toast.info(`Starting test suite...`);

      // Start test execution using the same API as TestRunPage
      const response = await api.post("/api/test-execution/run", {
        runName: `${suiteName} - ${new Date().toLocaleString()}`,
        environment: "Development",
        browser: "chrome",
        testSuiteIds: [suiteId],
      });

      const runId = response.data.id;

      // Store run ID and add to running tests set for auto-refresh
      setLastRunId(runId);
      setRunningTestIds((prev) => new Set([...prev, suiteId]));

      // Update suite status to running
      setTestSuites((prev) =>
        prev.map((suite) =>
          suite.id === suiteId
            ? {
                ...suite,
                runningTests: suite.totalTests,
                passedTests: 0,
                failedTests: 0,
                pendingTests: 0,
              }
            : suite
        )
      );

      toast.success(`Test suite started (Run ID: ${runId})`);
    } catch (error: any) {
      console.error("Failed to run test suite:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to start test suite";
      toast.error(errorMsg);
    }
  };

  const onViewLastResults = async (suiteId: string) => {
    try {
      console.log(`🔍 Looking for test runs for suite: ${suiteId}`);
      
      // Fetch all test runs
      const response = await api.get("/api/test-runs");
      const allRuns = response.data || [];
      console.log(`📊 Found ${allRuns.length} total test runs`);
      
      // For each run, check if it contains results for this suite
      const suiteRuns = [];
      for (const run of allRuns) {
        try {
          // Fetch test results for this run
          const resultsResponse = await api.get(`/api/test-runs/${run.id}/results`);
          const results = resultsResponse.data || [];
          console.log(`  Run ${run.id}: ${results.length} results`);
          
          // Check if any result belongs to this suite
          const matchingResults = results.filter((result: any) => {
            console.log(`    Result testSuiteId: ${result.testSuiteId}, looking for: ${suiteId}, match: ${result.testSuiteId === suiteId}`);
            return result.testSuiteId === suiteId;
          });
          
          if (matchingResults.length > 0) {
            console.log(`  ✅ Found ${matchingResults.length} matching results in run ${run.id}`);
            suiteRuns.push(run);
          }
        } catch (error) {
          // Skip runs where we can't fetch results
          console.debug(`Could not fetch results for run ${run.id}:`, error);
        }
      }
      
      console.log(`🎯 Found ${suiteRuns.length} runs for this suite`);
      
      // Sort by date (newest first)
      suiteRuns.sort((a: any, b: any) => {
        const dateA = new Date(a.completedAt || a.startedAt || 0).getTime();
        const dateB = new Date(b.completedAt || b.startedAt || 0).getTime();
        return dateB - dateA;
      });
      
      if (suiteRuns.length === 0) {
        toast.warning("No test runs found for this suite");
        return;
      }
      
      // Navigate to the latest run
      const latestRun = suiteRuns[0];
      console.log(`🚀 Navigating to run: ${latestRun.id}`);
      window.location.href = `/test-runs/${latestRun.id}`;
    } catch (error: any) {
      console.error("Failed to fetch test runs:", error);
      toast.error("Failed to fetch test runs. Please try again.");
    }
  };

  const handleEdit = (suiteId: string) => {
    // Navigate to test suites page with edit mode and suite ID
    navigate(`/test-suites?edit=${suiteId}&focus=name`);
  };

  const handleDelete = async (suiteId: string) => {
    if (!isAuthenticated) {
      toast.error("You must be authenticated to delete test suites");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this test suite?")) {
      return;
    }

    try {
      await api.delete(`/api/test-suites/${suiteId}`);
      setTestSuites((prev) => prev.filter((suite) => suite.id !== suiteId));
      toast.success("Test suite deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete test suite:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete test suite";
      toast.error(errorMsg);
    }
  };

  const handleRunSelected = async () => {
    if (selectedSuites.length === 0) {
      toast.warning("Please select at least one test suite");
      return;
    }

    if (!isAuthenticated) {
      toast.error("You must be authenticated to run test suites");
      return;
    }

    try {
      toast.info(`Starting ${selectedSuites.length} test suite(s)...`);

      const response = await api.post("/api/test-execution/run", {
        runName: `Bulk Run - ${new Date().toLocaleString()}`,
        environment: "Development",
        browser: "chrome",
        testSuiteIds: selectedSuites,
      });

      const runId = response.data.id;

      // Store run ID and add all selected suites to running set
      setLastRunId(runId);
      setRunningTestIds((prev) => new Set([...prev, ...selectedSuites]));

      toast.success(`Test run started (Run ID: ${runId})`);

      // Wait a moment for results to start coming in, then navigate
      setTimeout(() => {
        window.location.href = "/test-runs";
      }, 2000);
    } catch (error: any) {
      console.error("Failed to start test run:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to start test run";
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
            onClick={handleRunSelected}
            disabled={!isAuthenticated || selectedSuites.length === 0}
            title={
              !isAuthenticated
                ? 'Authentication required'
                : selectedSuites.length === 0
                ? 'Select test suites to run'
                : 'Run selected test suites'
            }
          >
            <Play size={20} />
            <span>Start Run All</span>
          </button>
        </div>
      </div>
      <div className="run-tests-page-token__content">
        <TestSuitesGridToken
          suites={testSuites}
          onRunSuite={handleRunSuite}
          onViewLastResults={onViewLastResults}
          onDelete={handleDelete}
          onEdit={handleEdit}
          isAuthenticated={isAuthenticated}
          selectedSuites={selectedSuites}
          onSelectionChange={setSelectedSuites}
          showFilter={true}
          showSort={true}
        />
      </div>
    </div>
  );
};
