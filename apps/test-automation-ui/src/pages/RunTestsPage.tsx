import React, { useState, useEffect } from "react";
import { TestSuitesGrid } from "../components/TestSuitesGrid";
import { TestSuite, TestCase } from "../components/TestSuiteCard";
import { useAuth } from "@asafarim/shared-ui-react";
import { useToast } from "@asafarim/toast";
import { Play } from "lucide-react";
import { api } from "../config/api";
import "./RunTestsPage.css";

interface ApiTestSuite {
  id: string;
  name: string;
  description?: string;
  fixtureId?: string;
  executionOrder?: number;
  isActive?: boolean;
  passed?: boolean | null; // Last run result
}

interface ApiTestCase {
  id: string;
  name: string;
  testSuiteId: string;
  passed?: boolean | null; // Last run result
}

interface TestResult {
  id: string;
  testCaseId: string;
  testSuiteId: string;
  testCaseName?: string;
  status: "Passed" | "Failed" | "Skipped" | "Error";
}

interface ApiFixture {
  id: string;
  name: string;
}

export const RunTestsPage: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuites, setSelectedSuites] = useState<string[]>([]);
  const [runningTestIds, setRunningTestIds] = useState<Set<string>>(new Set());
  const [lastRunId, setLastRunId] = useState<string | null>(null);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [suiteRunIds, setSuiteRunIds] = useState<Map<string, string>>(new Map());
  const { isAuthenticated } = useAuth();
  const toast = useToast();

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
            };
          }),
          totalTests: suiteCases.length,
          passedTests,
          failedTests,
          runningTests: 0,
          pendingTests,
          executionOrder: suite.executionOrder,
          isActive: suite.isActive,
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
            };
          }),
          totalTests: suiteCases.length,
          passedTests,
          failedTests,
          runningTests: 0,
          pendingTests,
          executionOrder: suite.executionOrder,
          isActive: suite.isActive,
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
      toast.info(`Starting test suite...`);

      // Start test execution using the same API as TestRunPage
      const response = await api.post("/api/test-execution/run", {
        runName: `Test Suite Run - ${new Date().toLocaleString()}`,
        environment: "Development",
        browser: "chrome",
        testSuiteIds: [suiteId],
      });

      const runId = response.data.id;

      // Store run ID and add to running tests set for auto-refresh
      setLastRunId(runId);
      setRunningTestIds((prev) => new Set([...prev, suiteId]));
      
      // Track the run ID for this suite so we can link to the correct test run
      setSuiteRunIds((prev) => new Map([...prev, [suiteId, runId]]));
      
      // Expand the suite to show test cases
      setExpandedSuites((prev) => new Set([...prev, suiteId]));

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

  const handleViewResults = (suiteId: string) => {
    // Navigate to the specific test run for this suite
    const runId = suiteRunIds.get(suiteId);
    if (runId) {
      window.location.href = `/test-runs/${runId}`;
    } else {
      // Fallback to test runs page if no specific run ID
      window.location.href = "/test-runs";
    }
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
      <div className="run-tests-page">
        <div className="page-loading">
          <div className="loading-spinner" />
          <p>Loading test suites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="run-tests-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Run Tests</h1>
          <p className="page-subtitle">
            Select test suites and execute automated tests
          </p>
        </div>
        <div className="header-actions">
          <button
            className="button button-primary button-lg"
            onClick={handleRunSelected}
            disabled={!isAuthenticated || selectedSuites.length === 0}
            title={
              !isAuthenticated
                ? "Authentication required"
                : selectedSuites.length === 0
                ? "Select test suites to run"
                : "Run selected test suites"
            }
          >
            <Play size={20} />
            <span>Start Run</span>
          </button>
        </div>
      </div>

      <TestSuitesGrid
        suites={testSuites}
        onRunSuite={handleRunSuite}
        onViewLogs={handleViewResults}
        onDelete={handleDelete}
        isAuthenticated={isAuthenticated}
        selectedSuites={selectedSuites}
        onSelectionChange={setSelectedSuites}
        showFilter={true}
        showSort={true}
        expandedSuites={expandedSuites}
        onToggleExpand={(suiteId: string) => {
          setExpandedSuites((prev) => {
            const next = new Set(prev);
            if (next.has(suiteId)) {
              next.delete(suiteId);
            } else {
              next.add(suiteId);
            }
            return next;
          });
        }}
      />
    </div>
  );
};
