using System.Text.Json;

namespace TestAutomation.Api.Models;

public class TestFixture
{
    public Guid Id { get; set; }
    public Guid FunctionalRequirementId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? PageUrl { get; set; }

    // SharedImportsPath && SharedImportsContent
    public string? SharedImportsPath { get; set; } // Relative path to shared constants/functions for example: import { BASE_URL, loginAsAdmin, resetDb } from '../../shared/test-utils';
    public string? SharedImportsContent { get; set; } // Raw TypeScript code to inject: SharedImportsContent is used to inject shared constants/functions into the test file.

    // Fixture Hooks
    public string? BeforeHook { get; set; } // Runs before the first test in the fixture
    public string? AfterHook { get; set; } // Runs after the last test in the fixture
    public string? BeforeEachHook { get; set; } // Runs before each test in the fixture
    public string? AfterEachHook { get; set; } // Runs after each test in the fixture

    // Authentication
    public string? HttpAuthUsername { get; set; } // Username for HTTP authentication
    public string? HttpAuthPassword { get; set; } // Password for HTTP authentication

    // Client Scripts
    public string? ClientScripts { get; set; } // JSON array of scripts to inject into pages

    // Request Hooks
    public string? RequestHooks { get; set; } // JSON array of request hooks

    // Metadata
    public string? Metadata { get; set; } // JSON object containing fixture metadata

    // The SetupScript and TeardownScript properties in the
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
    public string? Remark { get; set; } // Tracks generation errors and issues found during test file validation
    public Guid? CreatedById { get; set; }
    public Guid? UpdatedById { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual FunctionalRequirement FunctionalRequirement { get; set; } = null!;
    public virtual ICollection<TestSuite> TestSuites { get; set; } = new List<TestSuite>();
    public virtual ICollection<TestResult> TestResults { get; set; } = new List<TestResult>();
}
