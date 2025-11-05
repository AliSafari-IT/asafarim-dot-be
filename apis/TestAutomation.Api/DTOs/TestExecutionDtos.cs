using System.ComponentModel.DataAnnotations;

namespace TestAutomation.Api.DTOs;

public class StartTestRunDto
{
    [Required]
    public string RunName { get; set; } = string.Empty;
    
    public Guid? FunctionalRequirementId { get; set; }
    public List<Guid>? TestSuiteIds { get; set; }
    public List<Guid>? TestCaseIds { get; set; }
    public string Environment { get; set; } = "Development";
    public string Browser { get; set; } = "chrome";
    public Dictionary<string, object>? RunConfiguration { get; set; }
}

public class TestRunDto
{
    public Guid Id { get; set; }
    public string? RunName { get; set; }
    public Guid? FunctionalRequirementId { get; set; }
    public string? FunctionalRequirementName { get; set; }
    public string? Environment { get; set; }
    public string? Browser { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? ExecutedBy { get; set; }
    public string TriggerType { get; set; } = string.Empty;
    public int TotalTests { get; set; }
    public int PassedTests { get; set; }
    public int FailedTests { get; set; }
    public int SkippedTests { get; set; }
    public double? SuccessRate { get; set; }
    public List<TestResultDto>? Results { get; set; }
}

public class TestResultDto
{
    public Guid Id { get; set; }
    public Guid TestRunId { get; set; }
    public Guid? TestCaseId { get; set; }
    public string? TestCaseName { get; set; }
    public Guid? TestDataSetId { get; set; }
    public string? TestDataSetName { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? DurationMs { get; set; }
    public string? ErrorMessage { get; set; }
    public string? StackTrace { get; set; }
    public List<string>? Screenshots { get; set; }
    public object? JsonReport { get; set; }
    public DateTime RunAt { get; set; }
}