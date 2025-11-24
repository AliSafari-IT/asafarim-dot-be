namespace TestAutomation.Api.DTOs;

using System.Text.Json.Serialization;

public class RunnerStatusUpdateDto
{
    [JsonPropertyName("runId")]
    public string RunId { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty; // running|completed|failed|cancelled

    [JsonPropertyName("totalTests")]
    public int? TotalTests { get; set; }

    [JsonPropertyName("completedTests")]
    public int? CompletedTests { get; set; }

    [JsonPropertyName("passedTests")]
    public int? PassedTests { get; set; }

    [JsonPropertyName("failedTests")]
    public int? FailedTests { get; set; }

    [JsonPropertyName("skippedTests")]
    public int? SkippedTests { get; set; }
}

public class RunnerTestResultDto
{
    [JsonPropertyName("runId")]
    public string RunId { get; set; } = string.Empty;

    [JsonPropertyName("testCaseId")]
    public string? TestCaseId { get; set; }

    [JsonPropertyName("testCaseName")]
    public string? TestCaseName { get; set; }

    [JsonPropertyName("testSuiteId")]
    public string? TestSuiteId { get; set; }

    [JsonPropertyName("testDataSetId")]
    public string? TestDataSetId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty; // passed|failed|skipped|error

    [JsonPropertyName("durationMs")]
    public int? DurationMs { get; set; }

    [JsonPropertyName("errorMessage")]
    public string? ErrorMessage { get; set; }

    [JsonPropertyName("stackTrace")]
    public string? StackTrace { get; set; }

    [JsonPropertyName("jsonReport")]
    public object? JsonReport { get; set; }
}
