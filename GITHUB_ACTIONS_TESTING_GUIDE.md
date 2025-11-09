# GitHub Actions Integration - Testing Guide

## Prerequisites

1. **GitHub Repository**: Create a test repository with a workflow file
2. **GitHub Personal Access Token**: Generate token with `repo` and `workflow` scopes
3. **Testora Running**: API and frontend must be running

## Step 1: Create GitHub Workflow File

Create `.github/workflows/e2e-tests.yml` in your test repository:

```yaml
name: E2E Tests

on:
  workflow_dispatch:
    inputs:
      testRunId:
        description: 'Test Run ID'
        required: true
      testName:
        description: 'Test Name'
        required: true
      environment:
        description: 'Target Environment'
        required: true
      timestamp:
        description: 'Trigger Timestamp'
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Log inputs
        run: |
          echo "Test Run ID: ${{ github.event.inputs.testRunId }}"
          echo "Test Name: ${{ github.event.inputs.testName }}"
          echo "Environment: ${{ github.event.inputs.environment }}"
          echo "Timestamp: ${{ github.event.inputs.timestamp }}"
      
      - name: Run tests
        run: |
          echo "Running tests for ${{ github.event.inputs.testName }}"
          # Add your test commands here
          echo "Tests completed successfully"
```

## Step 2: Generate GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token"
3. Select scopes:
   - ✅ `repo` - Full control of private repositories
   - ✅ `workflow` - Update GitHub Action workflows
4. Copy the token (you won't see it again)

## Step 3: Test Frontend Connection

1. Navigate to `http://testora.asafarim.local:5180/integrations`
2. Click "Add Integration" and select "GitHub Actions"
3. Click "Connect" button
4. Fill in the modal:
   - **Repository**: `owner/repo` (e.g., `mycompany/e2e-tests`)
   - **Workflow File Path**: `.github/workflows/e2e-tests.yml`
   - **GitHub Personal Access Token**: Paste your token
5. Click "Connect GitHub Actions"

### Expected Results:
- ✅ Modal closes
- ✅ Success message appears
- ✅ Integration status shows "Connected"
- ✅ No error messages

### If Connection Fails:
- Check token is valid
- Verify repository format (owner/repo)
- Ensure token has required scopes
- Check API logs for detailed error

## Step 4: Test Workflow Trigger

1. Navigate to Test Runs page
2. Create a new test run:
   - Fill in test run details
   - Click "Start Test Run"

### Expected Results:
- ✅ Test run created successfully
- ✅ Status shows "Running"
- ✅ GitHub Actions workflow triggered in your repository

### Verify Workflow Triggered:
1. Go to your GitHub repository
2. Click "Actions" tab
3. Look for "E2E Tests" workflow run
4. Verify inputs match what you sent:
   - `testRunId` - Should match test run ID
   - `testName` - Should match test run name
   - `environment` - Should match environment selected
   - `timestamp` - Should be recent

## Step 5: Check Backend Logs

### API Logs:
```bash
# Watch API logs
tail -f d:\repos\asafarim-dot-be\apis\TestAutomation.Api\logs\testora-api-*.txt

# Look for messages like:
# 🚀 Triggering GitHub Actions workflow for test run {TestRunId}
# ✅ Successfully triggered GitHub Actions workflow for test run {TestRunId}
# ❌ Error triggering GitHub Actions workflow for test run {TestRunId}
```

### Expected Log Entries:
```
[INFO] Created test run {TestRunId} (Test Run Name)
[INFO] 🚀 Triggering GitHub Actions workflow for test run {TestRunId}
[INFO] ✅ Successfully triggered GitHub Actions workflow for test run {TestRunId}
```

## Troubleshooting

### Error: "Invalid GitHub credentials or insufficient permissions"
- **Cause**: Token is invalid or doesn't have required scopes
- **Fix**: 
  1. Regenerate token with correct scopes
  2. Ensure token has `repo` and `workflow` scopes
  3. Try connecting again

### Error: "Repository validation failed"
- **Cause**: Repository doesn't exist or token can't access it
- **Fix**:
  1. Verify repository format: `owner/repo`
  2. Ensure token has access to the repository
  3. Check if repository is private/public

### Error: "Could not find workflow"
- **Cause**: Workflow file doesn't exist at specified path
- **Fix**:
  1. Verify workflow file exists in repository
  2. Check exact path: `.github/workflows/e2e-tests.yml`
  3. Ensure file is committed to main branch

### Workflow not triggering
- **Cause**: GitHub API call failed silently
- **Fix**:
  1. Check API logs for errors
  2. Verify GitHub token is still valid
  3. Check GitHub API rate limits
  4. Verify workflow file syntax is correct

### Test run created but workflow not triggered
- **Cause**: Background task may still be running
- **Fix**:
  1. Wait a few seconds
  2. Check GitHub Actions tab
  3. Check API logs for errors
  4. Verify GitHub integration is connected

## API Endpoints

### Create Test Run (Triggers GitHub Actions)
```http
POST /api/test-runs
Authorization: Bearer {token}
Content-Type: application/json

{
  "runName": "E2E Tests - Chrome",
  "environment": "staging",
  "browser": "chrome",
  "functionalRequirementId": null,
  "testSuiteIds": [],
  "testCaseIds": []
}
```

### Connect GitHub Actions Integration
```http
POST /api/integrations/{id}/connect
Authorization: Bearer {token}
Content-Type: application/json

{
  "credentials": "{\"repository\":\"owner/repo\",\"workflowPath\":\".github/workflows/e2e-tests.yml\",\"token\":\"ghp_xxx\"}"
}
```

### Get Integration Status
```http
GET /api/integrations/{id}
Authorization: Bearer {token}
```

## Database Verification

### Check Encrypted Credentials
```sql
SELECT 
  id, 
  name, 
  status, 
  credentials,
  last_sync
FROM integrations
WHERE user_id = '{userId}' 
  AND name = 'GitHub Actions';
```

The `credentials` column should contain encrypted JSON (not readable).

## Performance Considerations

- Workflow trigger is asynchronous (background task)
- Test run creation returns immediately
- GitHub API calls have 10-second timeout
- Failures don't block test run creation
- All operations are logged

## Security Notes

- GitHub tokens are encrypted before storage
- Tokens are decrypted only when needed
- Tokens are never logged or exposed in API responses
- All GitHub API calls use HTTPS
- Token validation happens before storage

## Next Steps After Testing

1. **Webhook Integration**: Set up GitHub webhook to receive workflow status
2. **Status Updates**: Implement polling to update test run status
3. **Result Parsing**: Parse workflow output and update test results
4. **UI Enhancements**: Show workflow run link in test run details
5. **Error Handling**: Add retry logic for transient failures

## Support

If you encounter issues:
1. Check API logs for detailed error messages
2. Verify GitHub token and repository access
3. Ensure workflow file syntax is correct
4. Check GitHub Actions tab in repository
5. Review this guide for troubleshooting steps
