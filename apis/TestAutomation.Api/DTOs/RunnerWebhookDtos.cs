namespace TestAutomation.Api.DTOs;

public class RunnerStatusUpdateDto
{
    public string RunId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // running|completed|failed|cancelled
    public int? TotalTests { get; set; }
    public int? CompletedTests { get; set; }
    public int? PassedTests { get; set; }
    public int? FailedTests { get; set; }
    public int? SkippedTests { get; set; }
}

public class RunnerTestResultDto
{
    public string RunId { get; set; } = string.Empty;
    public string? TestCaseId { get; set; }
    public string? TestCaseName { get; set; }
    public string? TestDataSetId { get; set; }
    public string Status { get; set; } = string.Empty; // passed|failed|skipped|error
    public int? DurationMs { get; set; }
    public string? ErrorMessage { get; set; }
    public string? StackTrace { get; set; }
    public object? JsonReport { get; set; }
}