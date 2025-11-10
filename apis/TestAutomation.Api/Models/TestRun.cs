namespace TestAutomation.Api.Models;

public class TestRun
{
    public Guid Id { get; set; }
    public string? RunName { get; set; }
    public Guid? FunctionalRequirementId { get; set; }
    public string? Environment { get; set; }
    public string? Browser { get; set; }
    public TestRunStatus Status { get; set; } = TestRunStatus.Pending;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? ExecutedById { get; set; }
    public TriggerType TriggerType { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid? UpdatedById { get; set; }
    public Guid? CreatedById { get; set; }

    // Test result counts
    public int TotalTests { get; set; }
    public int PassedTests { get; set; }
    public int FailedTests { get; set; }
    public int SkippedTests { get; set; }

    // Navigation properties
    public virtual FunctionalRequirement? FunctionalRequirement { get; set; }
    public virtual ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
}

public enum TestRunStatus
{
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled,
}

public enum TriggerType
{
    Manual,
    Scheduled,
    CiCd,
}
