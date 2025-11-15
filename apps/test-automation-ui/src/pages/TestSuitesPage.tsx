// TestSuitesPageRefactored.tsx - Refactored version using GenericCrudPage
import { useEffect, useState } from "react";
import { GenericCrudPage } from "./GenericCrudPage";
import { ColumnDefinition } from "../components/GenericTable";
import { FormFieldDefinition } from "../components/GenericForm";
import { TestCafeFileViewer } from "../components/TestCafeFileViewer";
import { api } from "../config/api";
import { useToast } from "@asafarim/toast";
import { useNavigate } from "react-router-dom";
import { EyeIcon, Play, View, ViewIcon } from "lucide-react";
import {
  getFunctionalRequirementId,
  type TestSuite,
} from "../services/entitiesService";
import { ButtonComponent } from "@asafarim/shared-ui-react";

interface Fixture {
  id: string;
  name: string;
  remark?: string;
}

export default function TestSuitesPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [fixtureRemarks, setFixtureRemarks] = useState<Record<string, string>>(
    {}
  );
  const [viewingTestCafe, setViewingTestCafe] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadFixtures();
  }, []);

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
        environment: "Development",
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

  // Define table columns
  const columns: ColumnDefinition<TestSuite>[] = [
    {
      header: "Name",
      field: "name",
    },
    {
      header: "Fixture",
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
    },
    {
      header: "Description",
      field: "description",
    },
    {
      header: "Execution Order",
      align: "center",
      field: "executionOrder",
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
      label : "TestSuite file path",
      type: "text",
      readonly: true

    },
    {
      name: "generatedTestCafeFile",
      label: "Generated TestSuite",
      type: "textarea",
      rows: 10,
      readonly: true
    }
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
            title="Run Test Suite"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Play size={16} />
            TestSuite
          </button>
          <ButtonComponent variant="ghost" onClick={() => setViewingTestCafe({id: item.id, name: item.name})}>
            <EyeIcon size={20} />
            </ButtonComponent>
          </>
        )}
        emptyMessage="No test suites found"
        createButtonLabel="+ New Test Suite"
        editFormTitle="Edit Test Suite"
        createFormTitle="Create Test Suite"
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
