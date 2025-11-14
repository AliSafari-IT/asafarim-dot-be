namespace TestAutomation.Api.Models;

public class TestSuite
{
    public Guid Id { get; set; }
    public Guid FixtureId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int ExecutionOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public string? GeneratedTestCafeFile { get; set; }
    public string? GeneratedFilePath { get; set; } // Relative path to the generated test file
    public DateTime? GeneratedAt { get; set; }
    public Guid? CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual TestFixture Fixture { get; set; } = null!;
    public virtual ICollection<TestCase> TestCases { get; set; } = new List<TestCase>();
    public virtual ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
}
