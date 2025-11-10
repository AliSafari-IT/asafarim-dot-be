// apis/TestAutomation.Api/Models/TestCase.cs
using System.Text.Json;

namespace TestAutomation.Api.Models;

public class TestCase
{
    public Guid Id { get; set; }
    public Guid TestSuiteId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TestType TestType { get; set; }
    public JsonDocument? Steps { get; set; } // For step-based tests
    public string? ScriptText { get; set; } // For raw TestCafe scripts
    public int TimeoutMs { get; set; } = 30000;
    public int RetryCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public Guid? CreatedById { get; set; }
    public Guid? UpdatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual TestSuite TestSuite { get; set; } = null!;
    public virtual ICollection<TestDataSet> TestDataSets { get; set; } = new List<TestDataSet>();
    public virtual ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
}

public enum TestType
{
    Steps,
    Script
}