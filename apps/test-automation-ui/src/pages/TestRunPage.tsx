import { useEffect, useState } from "react";
import { Play, Square } from "lucide-react";
import { api, SIGNALR_URL } from "../config/api";
import { useAuth } from "@asafarim/shared-ui-react";
import { createHubConnection } from "../services/signalr";
import * as signalR from "@microsoft/signalr";
import TestSuiteSelector from "../components/TestSuiteSelector";
import ExecutionLogs from "../components/ExecutionLogs";
import ExecutionProgress from "../components/ExecutionProgress";
import RunHistory from "../components/RunHistory";
import "./TestRunPage.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "@asafarim/toast";

interface TestSuite {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "completed" | "failed";
  testCases: number;
  fixtureId: string;
}

interface FunctionalRequirement {
  id: string;
  name: string;
  description?: string;
}

interface FixtureSummary {
  id: string;
  name: string;
  description?: string;
  functionalRequirementId: string;
}

interface TestRun {
  id: string;
  name: string;
  status: "completed" | "failed" | "running";
  startedAt: string;
  duration?: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export default function TestRunPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [selectedSuiteIds, setSelectedSuiteIds] = useState<string[]>([]);
  const [functionalRequirements, setFunctionalRequirements] = useState<
    FunctionalRequirement[]
  >([]);
  const [fixtures, setFixtures] = useState<FixtureSummary[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [runHistory, setRunHistory] = useState<TestRun[]>([]);
  const [progress, setProgress] = useState({
    totalTests: 0,
    completedTests: 0,
    passedTests: 0,
    failedTests: 0,
  });
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Force scroll to top after initial render
    const id = window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const fetchSuites = async () => {
      try {
        const response = await api.get("/api/test-suites");
        const suitesData = response.data || [];
        setSuites(suitesData);
      } catch (error) {
        toast.error("Failed to fetch test suites");
        console.error(error);
      }
    };

    const fetchFunctionalRequirements = async () => {
      try {
        const response = await api.get("/api/functional-requirements");
        setFunctionalRequirements(response.data || []);
      } catch (error) {
        console.error("Failed to fetch functional requirements:", error);
      }
    };

    const fetchFixtures = async () => {
      try {
        const response = await api.get("/api/fixtures");
        setFixtures(response.data || []);
      } catch (error) {
        console.error("Failed to fetch fixtures:", error);
      }
    };

    fetchSuites();
    fetchFunctionalRequirements();
    fetchFixtures();
    fetchRunHistory();
  }, []);

  useEffect(() => {
    if (!token) return;

    const hubConnection = createHubConnection(SIGNALR_URL, token);

    hubConnection.on("TestUpdate", (msg: any) => {
      setLogs((prev) => [...prev, msg.message || JSON.stringify(msg)]);
    });

    hubConnection.on("TestRunUpdated", (update: any) => {
      console.log("TestRunUpdated event received:", update);
      setProgress({
        totalTests: update.totalTests || progress.totalTests,
        completedTests: update.completedTests || progress.completedTests,
        passedTests: update.passedTests || progress.passedTests,
        failedTests: update.failedTests || progress.failedTests,
      });
    });

    hubConnection.on("TestRunCompleted", (result: any) => {
      console.log("TestRunCompleted event received:", result);
      setIsRunning(false);
      setProgress({
        totalTests: result.totalTests || 0,
        completedTests: result.totalTests || 0,
        passedTests: result.passedTests || 0,
        failedTests: result.failedTests || 0,
      });
      toast.success("Test run completed!");
      setLogs((prev) => [
        ...prev,
        `Test run completed: ${result.passedTests} passed, ${result.failedTests} failed`,
      ]);
      fetchRunHistory();
    });

    hubConnection
      .start()
      .then(() => {
        console.log("SignalR Connected");
        setLogs((prev) => [...prev, "Connected to test server"]);
      })
      .catch((err) => {
        console.error("SignalR Connection Error:", err);
        toast.error("Failed to connect to test server");
      });

    setConnection(hubConnection);

    return () => {
      hubConnection.stop();
    };
  }, [token]);

  const fetchRunHistory = async () => {
    try {
      const response = await api.get("/api/test-execution/runs");
      setRunHistory(response.data || []);
    } catch (error) {
      console.error("Failed to fetch run history:", error);
    }
  };

  const getRunFunctionalRequirementId = () => {
    if (selectedSuiteIds.length === 0) return null;

    const selectedSuitesDetails = suites.filter((s) =>
      selectedSuiteIds.includes(s.id)
    );
    if (selectedSuitesDetails.length === 0) return null;

    const fixtureIds = new Set(selectedSuitesDetails.map((s) => s.fixtureId));
    const frIds = new Set(
      fixtures
        .filter((f) => fixtureIds.has(f.id))
        .map((f) => f.functionalRequirementId)
    );

    return frIds.size === 1 ? Array.from(frIds)[0] : null;
  };

  const handleSuiteSelection = (suiteIdOrMsg: string) => {
    if (suiteIdOrMsg === "create-test-suite") {
      navigate("/test-suites");
      return;
    }
    setSelectedSuiteIds((prev) =>
      prev.includes(suiteIdOrMsg)
        ? prev.filter((id) => id !== suiteIdOrMsg)
        : [...prev, suiteIdOrMsg]
    );
  };

  const handleStartRun = async () => {
    if (!isAuthenticated && !loading) {
      console.log("User is not authenticated");
      toast.error("Please log in to start a test run");
      return;
    }

    if (selectedSuiteIds.length === 0) {
      toast.error("Please select at least one test suite");
      return;
    }

    try {
      setIsRunning(true);
      setLogs(["Starting test execution..."]);
      setProgress({
        totalTests: 0,
        completedTests: 0,
        passedTests: 0,
        failedTests: 0,
      });

      const functionalRequirementIdForRun = getRunFunctionalRequirementId();

      const response = await api.post("/api/test-execution/run", {
        runName: `Manual Run - ${new Date().toLocaleString()}`,
        environment: "Development",
        browser: "chrome",
        testSuiteIds: selectedSuiteIds,
        functionalRequirementId: functionalRequirementIdForRun,
      });

      const newRunId = response.data.id;
      setRunId(newRunId);
      setLogs((prev) => [...prev, `Test run started with ID: ${newRunId}`]);

      if (connection) {
        await connection.invoke("JoinTestRun", newRunId);
      }
    } catch (error: any) {
      setIsRunning(false);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to start test run";
      toast.error(errorMsg);
      console.error("Test run error:", error);
      setLogs((prev) => [...prev, `Error: ${errorMsg}`]);
    }
  };

  const handleStopRun = async () => {
    if (!runId) return;
    try {
      await api.post(`/api/test-execution/cancel/${runId}`);
      setIsRunning(false);
      setLogs((prev) => [...prev, "Test run cancelled"]);
      toast.success("Test run cancelled");
    } catch (error) {
      toast.error("Failed to cancel test run");
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
            <p className="test-run-subtitle">
              Select test suites and execute automated tests
            </p>
          </div>
          <div className="test-run-actions">
            <button
              onClick={handleStartRun}
              disabled={isRunning || selectedSuiteIds.length === 0}
              className="test-run-button test-run-button-primary"
            >
              <Play className="test-run-button-icon" />
              {isRunning ? "Running..." : "Start Run"}
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
          {/* Test Suites & Functional Requirement filter */}
          <div className="test-run-sidebar">
            <TestSuiteSelector
              suites={suites}
              selectedSuites={selectedSuiteIds}
              onToggleSuite={handleSuiteSelection}
              onSetSelectedSuites={setSelectedSuiteIds}
              functionalRequirements={functionalRequirements}
              fixtures={fixtures}
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
