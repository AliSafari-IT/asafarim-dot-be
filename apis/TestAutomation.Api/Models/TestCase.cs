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

    // Test Hooks
    public string? BeforeTestHook { get; set; } // Runs before the test starts
    public string? AfterTestHook { get; set; } // Runs after the test completes
    public string? BeforeEachStepHook { get; set; } // Runs before each step in the test
    public string? AfterEachStepHook { get; set; } // Runs after each step in the test

    // Test Configuration
    public bool Skip { get; set; } = false; // Skip this test
    public string? SkipReason { get; set; } // Reason for skipping
    public bool Only { get; set; } = false; // Run only this test
    public JsonDocument? Meta { get; set; } // Test metadata (JSON)
    public string? PageUrl { get; set; } // URL to navigate to before test

    // Test Behavior
    public JsonDocument? RequestHooks { get; set; } // Request hooks for this test
    public JsonDocument? ClientScripts { get; set; } // Client scripts for this test
    public bool ScreenshotOnFail { get; set; } = true; // Take screenshot on failure
    public bool VideoOnFail { get; set; } = false; // Record video on failure

    public JsonDocument? Steps { get; set; } // For step-based tests
    public string? ScriptText { get; set; } // For raw TestCafe scripts
    public string? GherkinSyntax { get; set; }
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
    Script,
}
