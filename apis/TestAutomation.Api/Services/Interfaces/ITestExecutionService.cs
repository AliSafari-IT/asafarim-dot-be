using TestAutomation.Api.DTOs;

namespace TestAutomation.Api.Services.Interfaces;

public interface ITestExecutionService
{
    Task<TestRunDto> StartTestRunAsync(StartTestRunDto request, string userId);
    Task<bool> CancelTestRunAsync(Guid testRunId, string userId);
    Task<TestRunDto?> GetTestRunStatusAsync(Guid testRunId);
    Task<List<TestRunDto>> GetActiveTestRunsAsync();
    Task<List<TestRunDto>> GetTestRunHistoryAsync(int pageNumber = 1, int pageSize = 20);
    Task UpdateTestRunStatusAsync(Guid testRunId, string status, int? totalTests = null, int? passedTests = null, int? failedTests = null);
    Task ProcessTestResultAsync(TestResultDto testResult);
}