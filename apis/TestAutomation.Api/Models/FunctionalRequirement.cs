namespace TestAutomation.Api.Models;

public class FunctionalRequirement
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ProjectName { get; set; }
    public Guid? CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual ICollection<TestFixture> TestFixtures { get; set; } = new List<TestFixture>();
    public virtual ICollection<TestRun> TestRuns { get; set; } = new List<TestRun>();
    public virtual ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
}