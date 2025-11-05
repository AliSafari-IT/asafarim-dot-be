using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TestAutomation.Api.Hubs;

[Authorize]
public class TestRunHub : Hub
{
    private readonly ILogger<TestRunHub> _logger;

    public TestRunHub(ILogger<TestRunHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var user = Context.User?.Identity?.Name;
        _logger.LogInformation($"User {user} connected to TestRunHub");

        await Clients.Caller.SendAsync("Connected", $"Welcome {user}!");
        await Groups.AddToGroupAsync(Context.ConnectionId, "testRuns");

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var user = Context.User?.Identity?.Name;
        _logger.LogInformation($"User {user} disconnected from TestRunHub");
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "testRuns");

        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinTestRun(string testRunId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"testrun-{testRunId}");
        await Clients.Caller.SendAsync("JoinedTestRun", testRunId);
        _logger.LogInformation($"User {Context.User?.Identity?.Name} joined test run {testRunId}");
    }

    public async Task LeaveTestRun(string testRunId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"testrun-{testRunId}");
        await Clients.Caller.SendAsync("LeftTestRun", testRunId);
        _logger.LogInformation($"User {Context.User?.Identity?.Name} left test run {testRunId}");
    }

    public async Task SendTestUpdate(string testRunId, TestUpdateMessage message)
    {
        await Clients.Group($"testrun-{testRunId}").SendAsync("TestUpdate", message);
    }
}

public class TestUpdateMessage
{
    public string TestRunId { get; set; } = string.Empty;
    public string TestCaseId { get; set; } = string.Empty;
    public string TestCaseName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? CurrentStep { get; set; }
    public int? Progress { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
