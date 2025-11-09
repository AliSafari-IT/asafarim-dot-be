using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Services;

/// <summary>
/// Service for integrating with GitHub Actions to trigger workflows
/// </summary>
public interface IGitHubActionsService
{
    /// <summary>
    /// Validates GitHub credentials by testing the token
    /// </summary>
    Task<bool> ValidateCredentialsAsync(string repository, string token);

    /// <summary>
    /// Triggers a GitHub Actions workflow with test run data
    /// </summary>
    Task<bool> TriggerWorkflowAsync(
        string repository,
        string workflowPath,
        string token,
        TestRun testRun
    );
}

public class GitHubActionsService : IGitHubActionsService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GitHubActionsService> _logger;
    private const string GitHubApiBaseUrl = "https://api.github.com";
    private const int TimeoutSeconds = 10;

    public GitHubActionsService(HttpClient httpClient, ILogger<GitHubActionsService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.BaseAddress = new Uri(GitHubApiBaseUrl);
        _httpClient.Timeout = TimeSpan.FromSeconds(TimeoutSeconds);
    }

    /// <summary>
    /// Validates GitHub credentials by making a test API call
    /// </summary>
    public async Task<bool> ValidateCredentialsAsync(string repository, string token)
    {
        if (string.IsNullOrWhiteSpace(repository) || string.IsNullOrWhiteSpace(token))
        {
            _logger.LogWarning("Repository or token is empty");
            return false;
        }

        try
        {
            // Validate token by calling /user endpoint
            using var request = new HttpRequestMessage(HttpMethod.Get, "/user");
            request.Headers.Authorization = new AuthenticationHeaderValue("token", token);
            request.Headers.Add("Accept", "application/vnd.github.v3+json");
            request.Headers.Add("User-Agent", "TestAutomation.Api");

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "GitHub token validation failed with status {StatusCode}",
                    response.StatusCode
                );
                return false;
            }

            // Validate repository exists and is accessible
            var parts = repository.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 2)
            {
                _logger.LogWarning("Invalid repository format: {Repository}", repository);
                return false;
            }

            var owner = parts[0];
            var repo = parts[1];

            using var repoRequest = new HttpRequestMessage(
                HttpMethod.Get,
                $"/repos/{owner}/{repo}"
            );
            repoRequest.Headers.Authorization = new AuthenticationHeaderValue("token", token);
            repoRequest.Headers.Add("Accept", "application/vnd.github.v3+json");
            repoRequest.Headers.Add("User-Agent", "TestAutomation.Api");

            var repoResponse = await _httpClient.SendAsync(repoRequest);

            if (!repoResponse.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Repository validation failed for {Repository} with status {StatusCode}",
                    repository,
                    repoResponse.StatusCode
                );
                return false;
            }

            _logger.LogInformation(
                "GitHub credentials validated successfully for repository {Repository}",
                repository
            );
            return true;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error while validating GitHub credentials");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while validating GitHub credentials");
            return false;
        }
    }

    /// <summary>
    /// Triggers a GitHub Actions workflow with test run data
    /// </summary>
    public async Task<bool> TriggerWorkflowAsync(
        string repository,
        string workflowPath,
        string token,
        TestRun testRun
    )
    {
        if (
            string.IsNullOrWhiteSpace(repository)
            || string.IsNullOrWhiteSpace(workflowPath)
            || string.IsNullOrWhiteSpace(token)
        )
        {
            _logger.LogWarning("Repository, workflow path, or token is empty");
            return false;
        }

        try
        {
            var parts = repository.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 2)
            {
                _logger.LogWarning("Invalid repository format: {Repository}", repository);
                return false;
            }

            var owner = parts[0];
            var repo = parts[1];

            // Get workflow ID by filename
            var workflowId = await GetWorkflowIdAsync(owner, repo, workflowPath, token);
            if (string.IsNullOrEmpty(workflowId))
            {
                _logger.LogWarning(
                    "Could not find workflow {WorkflowPath} in repository {Repository}",
                    workflowPath,
                    repository
                );
                return false;
            }

            // Prepare workflow dispatch payload
            var payload = new
            {
                @ref = "main",
                inputs = new
                {
                    testRunId = testRun.Id.ToString(),
                    testName = testRun.RunName ?? "E2E Tests",
                    environment = testRun.Environment ?? "staging",
                    timestamp = DateTime.UtcNow.ToString("O"),
                },
            };

            var jsonContent = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"/repos/{owner}/{repo}/actions/workflows/{workflowId}/dispatches"
            )
            {
                Content = content,
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("token", token);
            request.Headers.Add("Accept", "application/vnd.github.v3+json");
            request.Headers.Add("User-Agent", "TestAutomation.Api");

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogError(
                    "Failed to trigger workflow {WorkflowPath} with status {StatusCode}: {Response}",
                    workflowPath,
                    response.StatusCode,
                    responseContent
                );
                return false;
            }

            _logger.LogInformation(
                "Successfully triggered workflow {WorkflowPath} for test run {TestRunId}",
                workflowPath,
                testRun.Id
            );
            return true;
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "HTTP error while triggering GitHub Actions workflow");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while triggering GitHub Actions workflow");
            return false;
        }
    }

    /// <summary>
    /// Gets the workflow ID by matching the workflow file path
    /// </summary>
    private async Task<string?> GetWorkflowIdAsync(
        string owner,
        string repo,
        string workflowPath,
        string token
    )
    {
        try
        {
            using var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"/repos/{owner}/{repo}/actions/workflows"
            );
            request.Headers.Authorization = new AuthenticationHeaderValue("token", token);
            request.Headers.Add("Accept", "application/vnd.github.v3+json");
            request.Headers.Add("User-Agent", "TestAutomation.Api");

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Failed to get workflows list with status {StatusCode}",
                    response.StatusCode
                );
                return null;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);

            var workflows = doc.RootElement.GetProperty("workflows");
            foreach (var workflow in workflows.EnumerateArray())
            {
                var path = workflow.GetProperty("path").GetString();
                if (path?.Equals(workflowPath, StringComparison.OrdinalIgnoreCase) == true)
                {
                    return workflow.GetProperty("id").GetInt64().ToString();
                }
            }

            _logger.LogWarning(
                "Workflow {WorkflowPath} not found in repository {Owner}/{Repo}",
                workflowPath,
                owner,
                repo
            );
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving workflow ID for {WorkflowPath}", workflowPath);
            return null;
        }
    }
}
