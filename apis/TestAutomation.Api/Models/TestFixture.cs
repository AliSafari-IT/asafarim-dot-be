using System.Text.Json;

namespace TestAutomation.Api.Models;

public class TestFixture
{
    public Guid Id { get; set; }
    public Guid FunctionalRequirementId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? PageUrl { get; set; }

    //    The SetupScript and TeardownScript properties in the
    // TestFixture
    //  class are used to store JSON-encoded scripts that run before and after test execution. Here's a quick breakdown:

    // SetupScript:
    // Runs before the main test execution
    // Use cases:
    // Setting up test data
    // Logging in users
    // Configuring test environment
    // Initializing test conditions
    // TeardownScript:
    // Runs after the test execution
    // Use cases:
    // Cleaning up test data
    // Logging out users
    // Restoring system state
    // Releasing resources
    public JsonDocument? SetupScript { get; set; }
    public JsonDocument? TeardownScript { get; set; }
    public Guid? CreatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual FunctionalRequirement FunctionalRequirement { get; set; } = null!;
    public virtual ICollection<TestSuite> TestSuites { get; set; } = new List<TestSuite>();
    public virtual ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
}
