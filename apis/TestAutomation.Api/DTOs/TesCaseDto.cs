// apis/TestAutomation.Api/DTOs/TesCaseDto.cs

using System.Text.Json;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.DTOs;

// In TesCaseDto.cs
public class CreateTestCaseDto
{
    public string Name { get; set; } = string.Empty;
    public Guid TestSuiteId { get; set; }
    public string? Description { get; set; }
    public TestType TestType { get; set; } = TestType.Steps;
    public JsonDocument? Steps { get; set; }
    public string? ScriptText { get; set; }
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
