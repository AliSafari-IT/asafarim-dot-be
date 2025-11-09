# GitHub Actions Integration - Backend Implementation Prompt

## Overview
The frontend UI has been updated to collect GitHub Actions configuration (repository, workflow path, and personal access token). Now we need to implement the backend to actually trigger GitHub Actions workflows when test runs are created.

## Current State

### Frontend (✅ COMPLETED)
- **File**: `apps/test-automation-ui/src/pages/IntegrationsPage.tsx`
- **What's Done**:
  - GitHub Actions connect modal collects:
    - Repository (owner/repo format)
    - Workflow file path (.github/workflows/e2e-tests.yml)
    - GitHub Personal Access Token
  - Stores config as JSON in `Integration.Credentials` field
  - Sends to backend via `POST /api/integrations/{id}/connect` with credentials

### Backend (❌ NEEDS IMPLEMENTATION)
- **Files to Create/Modify**:
  - `apis/TestAutomation.Api/Services/GitHubActionsService.cs` (NEW)
  - `apis/TestAutomation.Api/Controllers/TestRunsController.cs` (MODIFY)
  - `apis/TestAutomation.Api/Models/Integration.cs` (MODIFY)

## Implementation Tasks

### 1. Create GitHubActionsService
**File**: `apis/TestAutomation.Api/Services/GitHubActionsService.cs`

```csharp
public interface IGitHubActionsService
{
    Task<bool> TriggerWorkflowAsync(string repository, string workflowPath, string token, TestRun testRun);
    Task<bool> ValidateCredentialsAsync(string repository, string token);
}

public class GitHubActionsService : IGitHubActionsService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GitHubActionsService> _logger;
    
    // Implementation needed:
    // 1. Parse repository (owner/repo) into owner and repo
    // 2. Validate GitHub token by making test API call
    // 3. Trigger workflow using GitHub API:
    //    POST https://api.github.com/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches
    // 4. Handle errors and return success/failure
    // 5. Log all operations
}
```

**Key Methods**:
- `TriggerWorkflowAsync()`: Triggers GitHub Actions workflow with test run data
- `ValidateCredentialsAsync()`: Validates token has required permissions

### 2. Update Integration Model
**File**: `apis/TestAutomation.Api/Models/Integration.cs`

Add a method to parse stored GitHub config:
```csharp
public GitHubConfig? GetGitHubConfig()
{
    if (Type != IntegrationType.CiCd || Credentials == null)
        return null;
    
    try
    {
        return JsonSerializer.Deserialize<GitHubConfig>(Credentials.RootElement.GetRawText());
    }
    catch
    {
        return null;
    }
}
```

### 3. Update IntegrationsController
**File**: `apis/TestAutomation.Api/Controllers/IntegrationsController.cs`

Modify `ConnectIntegration` endpoint to validate GitHub credentials:
```csharp
[HttpPost("{id}/connect")]
public async Task<IActionResult> ConnectIntegration(int id, [FromBody] ConnectIntegrationDto dto)
{
    // For GitHub Actions, validate credentials
    if (integration.Type == IntegrationType.CiCd && integration.Name == "GitHub Actions")
    {
        var config = JsonSerializer.Deserialize<GitHubConfig>(dto.Credentials);
        var isValid = await _gitHubService.ValidateCredentialsAsync(config.Repository, config.Token);
        
        if (!isValid)
            return BadRequest("Invalid GitHub credentials or insufficient permissions");
    }
    
    // Store encrypted credentials
    integration.Credentials = JsonDocument.Parse(dto.Credentials);
    integration.Status = IntegrationStatus.Connected;
    
    await _db.SaveChangesAsync();
    return Ok();
}
```

### 4. Update TestRunsController
**File**: `apis/TestAutomation.Api/Controllers/TestRunsController.cs`

Modify `CreateTestRun` to trigger GitHub Actions:
```csharp
[HttpPost]
public async Task<IActionResult> CreateTestRun([FromBody] CreateTestRunDto dto)
{
    var testRun = new TestRun { /* ... */ };
    _db.TestRuns.Add(testRun);
    await _db.SaveChangesAsync();
    
    // Trigger GitHub Actions if connected
    var githubIntegration = await _db.Integrations
        .FirstOrDefaultAsync(i => 
            i.UserId == userId && 
            i.Type == IntegrationType.CiCd && 
            i.Name == "GitHub Actions" &&
            i.Status == IntegrationStatus.Connected);
    
    if (githubIntegration != null)
    {
        var config = githubIntegration.GetGitHubConfig();
        if (config != null)
        {
            try
            {
                await _gitHubService.TriggerWorkflowAsync(
                    config.Repository,
                    config.WorkflowPath,
                    _encryptionService.Decrypt(config.Token),
                    testRun
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to trigger GitHub Actions workflow");
                // Don't fail the test run creation, just log the error
            }
        }
    }
    
    return CreatedAtAction(nameof(GetTestRun), new { id = testRun.Id }, testRun);
}
```

### 5. Register Service in DI
**File**: `apis/TestAutomation.Api/Program.cs`

```csharp
builder.Services.AddScoped<IGitHubActionsService, GitHubActionsService>();
builder.Services.AddHttpClient<IGitHubActionsService, GitHubActionsService>();
```

## GitHub API Details

### Trigger Workflow Endpoint
```
POST https://api.github.com/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches

Headers:
  Authorization: token {github_token}
  Accept: application/vnd.github.v3+json
  Content-Type: application/json

Body:
{
  "ref": "main",
  "inputs": {
    "testRunId": "12345",
    "testName": "E2E Tests",
    "environment": "staging"
  }
}
```

### Validate Token Endpoint
```
GET https://api.github.com/user
Authorization: token {github_token}

Response: 200 OK with user data = valid token
Response: 401 Unauthorized = invalid token
```

### Get Workflow ID
```
GET https://api.github.com/repos/{owner}/{repo}/actions/workflows

Response contains list of workflows with their IDs
Match by filename (.github/workflows/e2e-tests.yml)
```

## Data Models

### GitHubConfig
```csharp
public class GitHubConfig
{
    public string Repository { get; set; } // owner/repo
    public string WorkflowPath { get; set; } // .github/workflows/test.yml
    public string Token { get; set; } // Encrypted GitHub token
}
```

## Error Handling

- Invalid repository format → Return 400 with message
- Invalid token → Return 400 with message
- Workflow file not found → Log warning, continue
- API rate limit → Log error, retry with exponential backoff
- Network timeout → Log error, don't fail test run creation

## Security Considerations

1. **Token Encryption**: GitHub token must be encrypted before storage
   - Already handled by `IEncryptionService`
   - Decrypt only when needed to call GitHub API

2. **Token Scope Validation**: Verify token has required scopes
   - `repo` - Full control of private repositories
   - `workflow` - Update GitHub Action workflows

3. **No Token Exposure**: Never log or return the token
   - Only log success/failure of operations

4. **HTTPS Only**: All GitHub API calls must use HTTPS

## Testing Checklist

- [ ] Create test GitHub repository with workflow file
- [ ] Generate GitHub Personal Access Token with required scopes
- [ ] Test connecting GitHub Actions integration
- [ ] Test creating test run triggers workflow
- [ ] Verify workflow receives correct inputs
- [ ] Test with invalid credentials (should fail gracefully)
- [ ] Test with invalid repository (should fail gracefully)
- [ ] Test with missing workflow file (should log warning)
- [ ] Verify token is encrypted in database
- [ ] Verify token is not exposed in API responses

## Implementation Notes

1. **Async Operations**: All GitHub API calls should be async
2. **Logging**: Log all important operations for debugging
3. **Idempotency**: Workflow triggers should be idempotent (safe to call multiple times)
4. **Timeout**: Set reasonable timeout for GitHub API calls (e.g., 10 seconds)
5. **Retry Logic**: Consider retry with exponential backoff for transient failures
6. **User Feedback**: Return clear error messages to frontend on failure

## Next Steps After Implementation

1. **Webhook Support**: Implement GitHub webhook to receive workflow status updates
   - Endpoint: `POST /api/webhooks/github`
   - Update test run status based on workflow completion
   - Handle workflow success/failure/cancellation

2. **Workflow Output Parsing**: Parse GitHub Actions output
   - Extract test results
   - Update test run with results
   - Link to GitHub Actions run

3. **UI Enhancements**:
   - Show workflow run link in test run details
   - Display workflow status in real-time
   - Show GitHub Actions logs in UI

## References

- GitHub Actions API: https://docs.github.com/en/rest/actions
- Workflow Dispatch: https://docs.github.com/en/rest/actions/workflows#create-a-workflow-dispatch-event
- Personal Access Tokens: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
