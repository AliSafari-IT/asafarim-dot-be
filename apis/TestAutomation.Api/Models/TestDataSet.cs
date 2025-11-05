// apis/TestAutomation.Api/Models/TestDataSet.cs
using System.Text.Json;

namespace TestAutomation.Api.Models;

public class TestDataSet
{
    public Guid Id { get; set; }
    public Guid TestCaseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public JsonDocument? Data { get; set; } // Changed from InputData/ExpectedOutput
    public bool IsActive { get; set; } = true;
    public Guid CreatedById { get; set; }
    public Guid UpdatedById { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual TestCase TestCase { get; set; } = null!;
    public virtual ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
}
