// apis/TestAutomation.Api/DTOs/TesCaseDto.cs

using System.Text.Json;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.DTOs;

public class CreateTestCaseDto
{
    // Basic properties
    public string Name { get; set; } = string.Empty;
    public Guid TestSuiteId { get; set; }
    public string? Description { get; set; }
    public TestType TestType { get; set; } = TestType.Steps;

    // Test Hooks
    public string? BeforeTestHook { get; set; }
    public string? AfterTestHook { get; set; }
    public string? BeforeEachStepHook { get; set; }
    public string? AfterEachStepHook { get; set; }

    // Test Configuration
    public bool Skip { get; set; } = false;
    public string? SkipReason { get; set; }
    public bool Only { get; set; } = false;
    public JsonDocument? Meta { get; set; }
    public string? PageUrl { get; set; }

    // Test Behavior
    public JsonDocument? RequestHooks { get; set; }
    public JsonDocument? ClientScripts { get; set; }
    public bool ScreenshotOnFail { get; set; } = true;
    public bool VideoOnFail { get; set; } = false;

    // Test Content
    public JsonDocument? Steps { get; set; }
    public string? ScriptText { get; set; }
    public string? GherkinSyntax { get; set; }
    public int TimeoutMs { get; set; } = 30000;
    public int RetryCount { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}

public class UpdateTestCaseDto : CreateTestCaseDto
{
    public Guid Id { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid UpdatedById { get; set; }
}
