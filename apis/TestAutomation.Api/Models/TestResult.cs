using System.Text.Json;

namespace TestAutomation.Api.Models;

public class TestResult
{
    public Guid Id { get; set; }
    public Guid TestRunId { get; set; }
    public Guid? TestCaseId { get; set; }
    public Guid? TestDataSetId { get; set; }
    public Guid? TestSuiteId { get; set; }
    public Guid? FixtureId { get; set; }
    public Guid? FunctionalRequirementId { get; set; }
    public TestStatus Status { get; set; }
    public int? DurationMs { get; set; }
    public string? ErrorMessage { get; set; }
    public string? StackTrace { get; set; }
    public JsonDocument? Screenshots { get; set; }
    public JsonDocument? JsonReport { get; set; }
    public DateTime RunAt { get; set; } = DateTime.UtcNow;
    public Guid? ExecutedById { get; set; }

    // Navigation properties
    public virtual TestRun TestRun { get; set; } = null!;
    public virtual TestCase? TestCase { get; set; }
    public virtual TestDataSet? TestDataSet { get; set; }
    public virtual TestSuite? TestSuite { get; set; }
    public virtual TestFixture? Fixture { get; set; }
    public virtual FunctionalRequirement? FunctionalRequirement { get; set; }
}

public enum TestStatus
{
    Passed,
    Failed,
    Skipped,
    Error
}