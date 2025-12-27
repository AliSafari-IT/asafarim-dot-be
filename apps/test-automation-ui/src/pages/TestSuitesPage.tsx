// TestSuitesPage.tsx - Refactored version using GenericCrudPage
import { useEffect, useState } from "react";
import { GenericCrudPage } from "./GenericCrudPage";
import { ColumnDefinition } from "../components/GenericTable";
import { FormFieldDefinition } from "../components/GenericForm";
import { TestCafeFileViewer } from "../components/TestCafeFileViewer";
import { api } from "../config/api";
import { useToast } from "@asafarim/toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { EyeIcon, Play } from "lucide-react";
import {
  getFunctionalRequirementId,
  type TestSuite,
} from "../services/entitiesService";
import { ButtonComponent, isProduction } from "@asafarim/shared-ui-react";
import { useAuth } from "@asafarim/shared-ui-react";
import { truncateAtWord } from "@asafarim/helpers";
import "./TestSuitesPage.css";

interface Fixture {
  id: string;
  name: string;
  remark?: string;
}

interface RelatedTestCase {
  id: string;
  name: string;
  description?: string;
  testType?: string;
  executionOrder?: number;
  isActive: boolean;
}

export default function TestSuitesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [fixtureRemarks, setFixtureRemarks] = useState<Record<string, string>>(
    {}
  );
  const [testCasesCache, setTestCasesCache] = useState<
    Record<string, RelatedTestCase[]>
  >({});
  const [viewingTestCafe, setViewingTestCafe] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editSuiteId, setEditSuiteId] = useState<string | null>(null);
  const [focusField, setFocusField] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadFixtures();
    // Check for edit query parameter
    const editId = searchParams.get('edit');
    const focus = searchParams.get('focus');
    if (editId) {
      setEditSuiteId(editId);
      if (focus) {
        setFocusField(focus);
      }
    }
  }, [searchParams]);

  const loadFixtures = async () => {
    try {
      const response = await api.get("/api/fixtures");
      setFixtures(response.data);

      // Load remarks for each fixture
      const remarks: Record<string, string> = {};
      for (const fixture of response.data) {
        try {
          const fixtureDetail = await api.get(`/api/fixtures/${fixture.id}`);
          if (fixtureDetail.data.remark) {
            remarks[fixture.id] = fixtureDetail.data.remark;
          }
        } catch (err) {
          console.error(
            `Failed to load fixture details for ${fixture.id}:`,
            err
          );
        }
      }
      setFixtureRemarks(remarks);
    } catch (error) {
      console.error("Failed to load fixtures:", error);
    }
  };

  const handleRunTestSuite = async (testSuite: TestSuite) => {
    try {
      // First, fetch the fixture to check for generation errors
      const fixtureResponse = await api.get(
        `/api/fixtures/${testSuite.fixtureId}`
      );
      const fixture = fixtureResponse.data;

      // Check if fixture has remark (generation errors)
      if (fixture.remark) {
        toast.error(
          `⚠️ Fixture has issues: ${fixture.remark}. Please review and fix before running tests.`
        );
        return; // Stop execution
      }

      toast.success(`Starting test run for "${testSuite.name}"...`);
      const frId = await getFunctionalRequirementId(testSuite.fixtureId);
      const response = await api.post("/api/test-execution/run", {
        runName: `${testSuite.name} - ${new Date().toLocaleString()}`,
        environment: isProduction ? "Production" : "Development",
        browser: "chrome",
        testSuiteIds: [testSuite.id],
        functionalRequirementId: frId,
      });

      const runId = response.data.id;
      toast.success(`Test run started! Redirecting to results...`);

      // Navigate to the test run results page
      setTimeout(() => {
        navigate(`/test-runs/${runId}`);
      }, 1000);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to start test run";
      toast.error(errorMsg);
      console.error("Test run error:", error);
    }
  };

  const getFixtureName = (fixtureId: string) => {
    return fixtures.find((f) => f.id === fixtureId)?.name || "Unknown";
  };

  const renderExpandedRow = (testSuite: TestSuite) => {
    const suiteCases = testCasesCache[testSuite.id] || [];
    const hasCache = testSuite.id in testCasesCache;

    if (!hasCache) {
      api
        .get(`/api/test-cases?testSuiteId=${testSuite.id}`)
        .then((response) => {
          setTestCasesCache((prev) => ({
            ...prev,
            [testSuite.id]: response.data || [],
          }));
        })
        .catch((error) => {
          console.error("Failed to fetch test cases:", error);
          setTestCasesCache((prev) => ({
            ...prev,
            [testSuite.id]: [],
          }));
        });
    }

    if (!hasCache) {
      return (
        <div className="expanded-content">
          <h5>Related Test Cases</h5>
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            Loading test cases...
          </div>
        </div>
      );
    }

    if (!suiteCases.length) {
      return (
        <div className="expanded-content">
          <h5>Related Test Cases</h5>
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              color: "var(--color-foreground-muted)",
            }}
          >
            No test cases found for this suite.
          </div>
        </div>
      );
    }

    return (
      <div className="expanded-content">
        <h5>Related Test Cases ({suiteCases.length})</h5>
        <table className="nested-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Execution Order</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {suiteCases.map((testCase) => (
              <tr key={testCase.id}>
                <td>{testCase.name}</td>
                <td>{testCase.description || "-"}</td>
                <td>{testCase.testType || "-"}</td>
                <td>
                  {typeof testCase.executionOrder === "number"
                    ? testCase.executionOrder
                    : "-"}
                </td>
                <td>
                  <span
                    className={`status-badge ${
                      testCase.isActive ? "active" : "inactive"
                    }`}
                  >
                    {testCase.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Define table columns
  const columns: ColumnDefinition<TestSuite>[] = [
    {
      header: "Name",
      field: "name",
      sortable: true,
      width: "25%",
      inListView: true,
    },
    {
      header: "Description",
      field: "description",
      render: (item) => truncateAtWord(item.description, 105),
      width: "50%",
      sortable: false,
      inListView: false,
    },
    {
      header: "Fixture",
      field: "fixtureId",
      sortable: true,
      sortAccessor: (item) => getFixtureName(item?.fixtureId ?? ""),
      render: (item) => {
        const hasIssues = fixtureRemarks[item.fixtureId];
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>{getFixtureName(item.fixtureId)}</span>
            {hasIssues && (
              <span
                title={hasIssues}
                style={{ color: "#ef4444", fontSize: "1.2rem" }}
              >
                ⚠️
              </span>
            )}
          </div>
        );
      },
      width: "20%",
      inListView: true,
    },
    {
      header: "Execution Order",
      align: "center",
      field: "executionOrder",
      width: "7.5%",
    },
    {
      header: "Active",
      align: "center",
      render: (item) => (
        <span
          className={`test-suites-status ${
            item.isActive
              ? "test-suites-status-active"
              : "test-suites-status-inactive"
          }`}
        >
          {item.isActive ? "✓" : "✗"}
        </span>
      ),
      width: "7.5%",
    },
    {
      header: "Passed",
      align: "center",
      inListView: true,
      render: (item) => (
        <span
          className={`test-suites-status ${
            item.passed
              ? "test-suites-status-passed"
              : "test-suites-status-failed"
          }`}
        >
          {item.passed ? "✓" : "✗"}
        </span>
      ),
      width: "10%",
    },
    {
      header: "Updated At",
      field: "updatedAt",
      sortable: true,
      render: (item) =>
        item.updatedAt && new Date(item.updatedAt).toLocaleString(),
      inListView: true,
      width: "20%",
    }
  ];

  // Define form fields
  const formFields: FormFieldDefinition<TestSuite>[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
    },
    {
      name: "fixtureId",
      label: "Fixture",
      type: "select",
      required: true,
      options: fixtures.map((f) => ({ value: f.id, label: f.name })),
    },

    {
      name: "description",
      label: "Description",
      type: "textarea",
      rows: 5,
    },
    {
      name: "executionOrder",
      label: "Execution Order",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
    },
    {
      name: "generatedFilePath",
      label: "TestSuite file path",
      type: "text",
      readonly: true,
    },
    {
      name: "generatedTestCafeFile",
      label: "Generated TestSuite",
      type: "textarea",
      rows: 10,
      readonly: true,
    },
  ];

  return (
    <>
      <GenericCrudPage<TestSuite>
        title="Test Suites"
        apiEndpoint="/api/test-suites"
        getItemId={(item) => item.id}
        columns={columns}
        formFields={formFields}
        getInitialFormData={() => ({
          id: "",
          fixtureId: "",
          name: "",
          description: "",
          executionOrder: 0,
          isActive: true,
          createdAt: "",
          updatedAt: "",
        })}
        customActions={(item) => (
          <>
            <button
              className="button button-primary"
              onClick={() => handleRunTestSuite(item)}
              title={
                isAuthenticated
                  ? "Run Test Suite"
                  : "You must be authenticated to run test suites."
              }
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              disabled={!isAuthenticated}
              data-testid="run-test-suite-button"
            >
              <Play size={16} />
              Tests
            </button>
            <ButtonComponent
              variant="ghost"
              onClick={() =>
                setViewingTestCafe({ id: item.id, name: item.name })
              }
            >
              <EyeIcon size={20} />
            </ButtonComponent>
          </>
        )}
        emptyMessage="No test suites found"
        createButtonLabel="+ New Test Suite"
        editFormTitle="Edit Test Suite"
        createFormTitle="Create Test Suite"
        renderExpandedRow={renderExpandedRow}
        expandLabel="View Test Cases"
        editSuiteId={editSuiteId}
        focusField={focusField}
        onEditComplete={() => {
          setEditSuiteId(null);
          setFocusField(null);
          // Clear the query parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        }}
        onEdit={(item) => {
          setEditSuiteId(item.id);
        }}
      />

      {viewingTestCafe && (
        <TestCafeFileViewer
          testSuiteId={viewingTestCafe.id}
          testSuiteName={viewingTestCafe.name}
          onClose={() => setViewingTestCafe(null)}
        />
      )}
    </>
  );
}
