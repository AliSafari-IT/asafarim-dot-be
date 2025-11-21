// apps/test-automation-ui/src/components/TestSuiteSelector.tsx
import React from "react";
import { Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { ButtonComponent } from "@asafarim/shared-ui-react";
import "./TestSuiteSelector.css";

interface TestSuite {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "completed" | "failed";
  testCases: number;
  fixtureId: string;
}

interface FunctionalRequirementOption {
  id: string;
  name: string;
  description?: string;
}

interface FixtureSummaryOption {
  id: string;
  name: string;
  description?: string;
  functionalRequirementId: string;
}

interface TestSuiteSelectorProps {
  suites: TestSuite[];
  selectedSuites: string[];
  onToggleSuite: (id: string) => void;
  onSetSelectedSuites: (ids: string[]) => void;
  functionalRequirements: FunctionalRequirementOption[];
  fixtures: FixtureSummaryOption[];
}

const TestSuiteSelector: React.FC<TestSuiteSelectorProps> = ({
  suites,
  selectedSuites,
  onToggleSuite,
  onSetSelectedSuites,
  functionalRequirements,
  fixtures,
}) => {
  // TODO: Add select all/none suites functionality
  const handleSelectAllSuites = () => {
    onSetSelectedSuites(suites.map((s) => s.id));
  };
  const handleSelectNoneSuites = () => {
    onSetSelectedSuites([]);
  };
  const handleToggleFunctionalRequirement = (functionalRequirementId: string) => {
    const frFixtures = fixtures.filter(
      (f) => f.functionalRequirementId === functionalRequirementId
    );
    const frFixtureIds = new Set(frFixtures.map((f) => f.id));
    const frSuiteIds = suites
      .filter((s) => frFixtureIds.has(s.fixtureId))
      .map((s) => s.id);

    if (frSuiteIds.length === 0) return;

    const allSelected = frSuiteIds.every((id) => selectedSuites.includes(id));
    if (allSelected) {
      const next = selectedSuites.filter((id) => !frSuiteIds.includes(id));
      onSetSelectedSuites(next);
    } else {
      const combined = new Set([...selectedSuites, ...frSuiteIds]);
      onSetSelectedSuites(Array.from(combined));
    }
  };

  const handleToggleFixture = (fixtureId: string) => {
    const fixtureSuiteIds = suites
      .filter((s) => s.fixtureId === fixtureId)
      .map((s) => s.id);
    if (fixtureSuiteIds.length === 0) return;

    const allSelected = fixtureSuiteIds.every((id) => selectedSuites.includes(id));
    if (allSelected) {
      const next = selectedSuites.filter((id) => !fixtureSuiteIds.includes(id));
      onSetSelectedSuites(next);
    } else {
      const combined = new Set([...selectedSuites, ...fixtureSuiteIds]);
      onSetSelectedSuites(Array.from(combined));
    }
  };

  return (
    <div className="suite-container">
      <div className="suite-content">
        <div className="suite-header">
          <div className="suite-header-title">
            <h2 className="suite-title">Test Suites</h2>
            <p className="suite-subtitle">
              Select the suites you want to run. Optionally filter by functional
              requirement.
            </p>
            <p className="suite-selection-summary">
              {selectedSuites.length} of {suites.length} suites selected
            </p>
          </div>
          <div className="suite-filter">
            <span className="suite-filter-label">Select suites</span>
            <ButtonComponent
              variant="ghost"
              onClick={() => handleSelectAllSuites()}
            >
              All
              <CheckCircle />
            </ButtonComponent>
            <ButtonComponent
              variant="ghost"
              onClick={() => handleSelectNoneSuites()}
            >
              None
              <XCircle />
            </ButtonComponent>
          </div>
        </div>
        <div className="suite-list">
          {suites.length === 0 ? (
            <div className="suite-empty">
              <p>
                No test suites available to run. Please create a test suite
                first.
              </p>
              <ButtonComponent
                variant="link"
                onClick={() => onToggleSuite("create-test-suite")}
              >
                Create Test Suite
              </ButtonComponent>
            </div>
          ) : (
            functionalRequirements.map((fr) => {
              const frFixtures = fixtures.filter(
                (f) => f.functionalRequirementId === fr.id
              );
              const frFixtureIds = new Set(frFixtures.map((f) => f.id));
              const frSuites = suites.filter((s) => frFixtureIds.has(s.fixtureId));
              const frSuiteIds = frSuites.map((s) => s.id);
              const frSelectedCount = frSuiteIds.filter((id) =>
                selectedSuites.includes(id)
              ).length;
              const frTotalCount = frSuiteIds.length;

              if (frTotalCount === 0) {
                return null;
              }

              return (
                <div key={fr.id} className="suite-fr-group">
                  <div className="suite-fr-header">
                    <label className="suite-fr-label">
                      <input
                        className="suite-fr-checkbox"
                        type="checkbox"
                        checked={
                          frTotalCount > 0 && frSelectedCount === frTotalCount
                        }
                        onChange={() => handleToggleFunctionalRequirement(fr.id)}
                      />
                      <span className="suite-fr-name">{fr.name}</span>
                    </label>
                    <span className="suite-fr-count">
                      {frSelectedCount}/{frTotalCount} suites
                    </span>
                  </div>

                  <div className="suite-fr-body">
                    {frFixtures.map((fixture) => {
                      const fixtureSuites = suites.filter(
                        (s) => s.fixtureId === fixture.id
                      );
                      if (fixtureSuites.length === 0) return null;

                      const fixtureSuiteIds = fixtureSuites.map((s) => s.id);
                      const fixtureSelectedCount = fixtureSuiteIds.filter((id) =>
                        selectedSuites.includes(id)
                      ).length;

                      return (
                        <div
                          key={fixture.id}
                          className="suite-fixture-group"
                        >
                          <div className="suite-fixture-header">
                            <label className="suite-fixture-label">
                              <input
                                className="suite-fixture-checkbox"
                                type="checkbox"
                                checked={
                                  fixtureSuiteIds.length > 0 &&
                                  fixtureSelectedCount === fixtureSuiteIds.length
                                }
                                onChange={() => handleToggleFixture(fixture.id)}
                              />
                              <span className="suite-fixture-name">
                                {fixture.name}
                              </span>
                            </label>
                            <span className="suite-fixture-count">
                              {fixtureSelectedCount}/{fixtureSuiteIds.length} suites
                            </span>
                          </div>

                          <div className="suite-fixture-suites">
                            {fixtureSuites.map((suite) => (
                              <div
                                key={suite.id}
                                className={`suite-item ${
                                  selectedSuites.includes(suite.id)
                                    ? "suite-item--selected"
                                    : ""
                                }`}
                                onClick={() => onToggleSuite(suite.id)}
                              >
                                <input
                                  className="suite-checkbox"
                                  type="checkbox"
                                  checked={selectedSuites.includes(suite.id)}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    onToggleSuite(suite.id);
                                  }}
                                  disabled={suite.status === "running"}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="suite-info">
                                  <p className="suite-name">{suite.name}</p>
                                  <p className="suite-desc">
                                    {suite.description.slice(0, 40).concat("...")}
                                  </p>
                                  <div className="suite-meta">
                                    <Clock className="suite-icon" />
                                    {suite.testCases} test cases
                                  </div>
                                </div>
                                <div className="suite-status">
                                  {suite.status === "completed" && (
                                    <CheckCircle className="status-icon success" />
                                  )}
                                  {suite.status === "failed" && (
                                    <XCircle className="status-icon error" />
                                  )}
                                  {suite.status === "running" && (
                                    <RefreshCw className="status-icon running" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSuiteSelector;
