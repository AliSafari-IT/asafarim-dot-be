using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.DTOs;
using SmartPath.Api.Entities;
using SmartPath.Api.Services;
using Xunit;

namespace SmartPath.Api.Tests;

public class SmartPathIntegrationTests : IAsyncLifetime
{
    private SmartPathDbContext _context = null!;
    private PracticeService _practiceService = null!;
    private GraphService _graphService = null!;
    private PathfindingService _pathfindingService = null!;

    public async System.Threading.Tasks.Task InitializeAsync()
    {
        var options = new DbContextOptionsBuilder<SmartPathDbContext>()
            .UseInMemoryDatabase(databaseName: $"SmartPathTest_{Guid.NewGuid()}")
            .Options;

        _context = new SmartPathDbContext(options);
        await _context.Database.EnsureCreatedAsync();

        var practiceLogger = new MockLogger<PracticeService>();
        var graphLogger = new MockLogger<GraphService>();
        var pathfindingLogger = new MockLogger<PathfindingService>();

        _practiceService = new PracticeService(_context, practiceLogger);
        _graphService = new GraphService(_context, graphLogger);
        _pathfindingService = new PathfindingService(_context, pathfindingLogger);
    }

    public async System.Threading.Tasks.Task DisposeAsync()
    {
        await _context.Database.EnsureDeletedAsync();
        _context.Dispose();
    }

    #region Points Tests

    [Fact]
    public async System.Threading.Tasks.Task SubmitAttempt_CorrectAnswer_AwardsPoints()
    {
        // Arrange
        var userId = 1;
        var familyId = 1;
        var lessonId = 1;
        var itemId = 1;

        await SetupTestData(userId, familyId, lessonId, itemId, pointsPerItem: 10);

        var session = await _practiceService.CreateSessionAsync(
            new CreatePracticeSessionRequestDto
            {
                FamilyId = familyId,
                ChildUserId = userId,
                LessonId = lessonId,
            },
            userId
        );

        var attemptRequest = new CreatePracticeAttemptRequestDto
        {
            SessionId = session.Id,
            PracticeItemId = itemId,
            Answer = "correct_answer",
        };

        // Act
        var result = await _practiceService.SubmitAttemptAsync(attemptRequest, userId);

        // Assert
        Assert.True(result.IsCorrect);
        Assert.Equal(10, result.PointsAwarded);
    }

    [Fact]
    public async System.Threading.Tasks.Task SubmitAttempt_IncorrectAnswer_AwardsZeroPoints()
    {
        // Arrange
        var userId = 1;
        var familyId = 1;
        var lessonId = 1;
        var itemId = 1;

        await SetupTestData(userId, familyId, lessonId, itemId, pointsPerItem: 10);

        var session = await _practiceService.CreateSessionAsync(
            new CreatePracticeSessionRequestDto
            {
                FamilyId = familyId,
                ChildUserId = userId,
                LessonId = lessonId,
            },
            userId
        );

        var attemptRequest = new CreatePracticeAttemptRequestDto
        {
            SessionId = session.Id,
            PracticeItemId = itemId,
            Answer = "wrong_answer",
        };

        // Act
        var result = await _practiceService.SubmitAttemptAsync(attemptRequest, userId);

        // Assert
        Assert.False(result.IsCorrect);
        Assert.Equal(0, result.PointsAwarded);
    }

    [Fact]
    public async System.Threading.Tasks.Task CompleteSession_ComputesTotalPointsFromAttempts()
    {
        // Arrange
        var userId = 1;
        var familyId = 1;
        var lessonId = 1;

        await SetupTestData(userId, familyId, lessonId, itemId: 1, pointsPerItem: 10);
        await SetupTestData(userId, familyId, lessonId, itemId: 2, pointsPerItem: 15);

        var session = await _practiceService.CreateSessionAsync(
            new CreatePracticeSessionRequestDto
            {
                FamilyId = familyId,
                ChildUserId = userId,
                LessonId = lessonId,
            },
            userId
        );

        // Submit two correct attempts
        await _practiceService.SubmitAttemptAsync(
            new CreatePracticeAttemptRequestDto
            {
                SessionId = session.Id,
                PracticeItemId = 1,
                Answer = "correct_answer",
            },
            userId
        );
        await _practiceService.SubmitAttemptAsync(
            new CreatePracticeAttemptRequestDto
            {
                SessionId = session.Id,
                PracticeItemId = 2,
                Answer = "correct_answer",
            },
            userId
        );

        // Act
        var completed = await _practiceService.CompleteSessionAsync(session.Id, userId);

        // Assert
        Assert.Equal("Completed", completed.Status);
        Assert.Equal(25, completed.TotalPoints); // 10 + 15
    }

    [Fact]
    public async System.Threading.Tasks.Task CompleteSession_IsIdempotent_DoesNotDoublePoints()
    {
        // Arrange
        var userId = 1;
        var familyId = 1;
        var lessonId = 1;

        await SetupTestData(userId, familyId, lessonId, itemId: 1, pointsPerItem: 10);

        var session = await _practiceService.CreateSessionAsync(
            new CreatePracticeSessionRequestDto
            {
                FamilyId = familyId,
                ChildUserId = userId,
                LessonId = lessonId,
            },
            userId
        );

        await _practiceService.SubmitAttemptAsync(
            new CreatePracticeAttemptRequestDto
            {
                SessionId = session.Id,
                PracticeItemId = 1,
                Answer = "correct_answer",
            },
            userId
        );

        // Act - Complete twice
        var completed1 = await _practiceService.CompleteSessionAsync(session.Id, userId);
        var completed2 = await _practiceService.CompleteSessionAsync(session.Id, userId);

        // Assert - Points should not double
        Assert.Equal(10, completed1.TotalPoints);
        Assert.Equal(10, completed2.TotalPoints);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetChildSummary_ReturnsPersistedPoints()
    {
        // Arrange
        var userId = 1;
        var familyId = 1;
        var lessonId = 1;

        await SetupTestData(userId, familyId, lessonId, itemId: 1, pointsPerItem: 20);

        var session = await _practiceService.CreateSessionAsync(
            new CreatePracticeSessionRequestDto
            {
                FamilyId = familyId,
                ChildUserId = userId,
                LessonId = lessonId,
            },
            userId
        );

        await _practiceService.SubmitAttemptAsync(
            new CreatePracticeAttemptRequestDto
            {
                SessionId = session.Id,
                PracticeItemId = 1,
                Answer = "correct_answer",
            },
            userId
        );

        await _practiceService.CompleteSessionAsync(session.Id, userId);

        // Act
        var summary = await _practiceService.GetChildSummaryAsync(userId, userId);

        // Assert
        Assert.Equal(20, summary.TotalPoints);
    }

    #endregion

    #region Graph Authorization Tests

    [Fact]
    public async System.Threading.Tasks.Task CreateGraph_SetsCreatedByUserId()
    {
        // Arrange
        var userId = 1;
        var dto = new CreateGraphDto
        {
            Name = "Test Graph",
            Nodes = new List<CreateNodeDto>
            {
                new CreateNodeDto
                {
                    Label = "A",
                    X = 0,
                    Y = 0,
                }
            },
            Edges = new List<CreateEdgeDto>()
        };

        // Act
        var graph = await _graphService.CreateGraphAsync(dto, userId);

        // Assert
        Assert.Equal(userId, graph.CreatedByUserId);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetAllGraphs_ReturnsOnlyUserGraphs()
    {
        // Arrange
        var user1 = 1;
        var user2 = 2;

        var graph1 = await _graphService.CreateGraphAsync(
            new CreateGraphDto
            {
                Name = "User1 Graph",
                Nodes = new(),
                Edges = new(),
            },
            user1
        );

        var graph2 = await _graphService.CreateGraphAsync(
            new CreateGraphDto
            {
                Name = "User2 Graph",
                Nodes = new(),
                Edges = new(),
            },
            user2
        );

        // Act
        var user1Graphs = await _graphService.GetAllGraphsAsync(user1);
        var user2Graphs = await _graphService.GetAllGraphsAsync(user2);

        // Assert
        Assert.Single(user1Graphs);
        Assert.Equal(graph1.Id, user1Graphs[0].Id);

        Assert.Single(user2Graphs);
        Assert.Equal(graph2.Id, user2Graphs[0].Id);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetGraphById_WithUserScope_ReturnsGraphIfOwner()
    {
        // Arrange
        var userId = 1;
        var graph = await _graphService.CreateGraphAsync(
            new CreateGraphDto
            {
                Name = "Test Graph",
                Nodes = new(),
                Edges = new(),
            },
            userId
        );

        // Act
        var result = await _graphService.GetGraphByIdAsync(graph.Id, userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(graph.Id, result.Id);
    }

    [Fact]
    public async System.Threading.Tasks.Task GetGraphById_WithUserScope_ReturnsNullIfNotOwner()
    {
        // Arrange
        var userId1 = 1;
        var userId2 = 2;

        var graph = await _graphService.CreateGraphAsync(
            new CreateGraphDto
            {
                Name = "User1 Graph",
                Nodes = new(),
                Edges = new(),
            },
            userId1
        );

        // Act
        var result = await _graphService.GetGraphByIdAsync(graph.Id, userId2);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async System.Threading.Tasks.Task UpdateGraph_WithUserScope_SucceedsIfOwner()
    {
        // Arrange
        var userId = 1;
        var graph = await _graphService.CreateGraphAsync(
            new CreateGraphDto
            {
                Name = "Original Name",
                Nodes = new(),
                Edges = new(),
            },
            userId
        );

        var updateDto = new UpdateGraphDto
        {
            Name = "Updated Name",
            Nodes = null,
            Edges = null,
        };

        // Act
        var result = await _graphService.UpdateGraphAsync(graph.Id, updateDto, userId);

        // Assert
        Assert.Equal("Updated Name", result.Name);
    }

    [Fact]
    public async System.Threading.Tasks.Task UpdateGraph_WithUserScope_ThrowsIfNotOwner()
    {
        // Arrange
        var userId1 = 1;
        var userId2 = 2;

        var graph = await _graphService.CreateGraphAsync(
            new CreateGraphDto
            {
                Name = "User1 Graph",
                Nodes = new(),
                Edges = new(),
            },
            userId1
        );

        var updateDto = new UpdateGraphDto
        {
            Name = "Hacked Name",
            Nodes = null,
            Edges = null,
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _graphService.UpdateGraphAsync(graph.Id, updateDto, userId2)
        );
    }

    [Fact]
    public async System.Threading.Tasks.Task DeleteGraph_WithUserScope_SucceedsIfOwner()
    {
        // Arrange
        var userId = 1;
        var graph = await _graphService.CreateGraphAsync(
            new CreateGraphDto
            {
                Name = "Test Graph",
                Nodes = new(),
                Edges = new(),
            },
            userId
        );

        // Act
        await _graphService.DeleteGraphAsync(graph.Id, userId);

        // Assert
        var result = await _graphService.GetGraphByIdAsync(graph.Id, userId);
        Assert.Null(result);
    }

    [Fact]
    public async System.Threading.Tasks.Task DeleteGraph_WithUserScope_ThrowsIfNotOwner()
    {
        // Arrange
        var userId1 = 1;
        var userId2 = 2;

        var graph = await _graphService.CreateGraphAsync(
            new CreateGraphDto
            {
                Name = "User1 Graph",
                Nodes = new(),
                Edges = new(),
            },
            userId1
        );

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _graphService.DeleteGraphAsync(graph.Id, userId2)
        );
    }

    #endregion

    #region Pathfinding Tests

    [Fact]
    public async System.Threading.Tasks.Task FindShortestPath_WithSimpleGraph_ReturnsValidPath()
    {
        // Arrange
        var userId = 1;
        var graph = await CreateSimpleGraphForPathfinding(userId);

        // Act
        var nodesList = graph.Nodes.ToList();
        var result = await _pathfindingService.FindShortestPathAsync(
            graph.Id,
            nodesList[0].Id,
            nodesList[2].Id,
            "dijkstra",
            false
        );

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.PathNodeIds);
        Assert.True(result.TotalCost >= 0);
    }

    #endregion

    #region Helper Methods

    private async System.Threading.Tasks.Task SetupTestData(
        int userId,
        int familyId,
        int lessonId,
        int itemId,
        int pointsPerItem
    )
    {
        if (_context.Users.Any(u => u.UserId == userId))
            return;

        var user = new User { UserId = userId, Email = $"user{userId}@test.com" };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var family = new Family
        {
            FamilyId = familyId,
            FamilyName = $"Family{familyId}",
            CreatedByUserId = userId,
        };
        _context.Families.Add(family);
        await _context.SaveChangesAsync();

        var familyMember = new FamilyMember { FamilyId = familyId, UserId = userId };
        _context.FamilyMembers.Add(familyMember);
        await _context.SaveChangesAsync();

        var course = new Course
        {
            FamilyId = familyId,
            Name = "Test Course",
            CreatedByUserId = userId,
        };
        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        var chapter = new Chapter
        {
            CourseId = course.CourseId,
            FamilyId = familyId,
            Title = "Test Chapter",
            CreatedByUserId = userId,
        };
        _context.Chapters.Add(chapter);
        await _context.SaveChangesAsync();

        var lesson = new Lesson
        {
            LessonId = lessonId,
            ChapterId = chapter.ChapterId,
            Title = "Test Lesson",
            CreatedByUserId = userId,
        };
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        var item = new PracticeItem
        {
            PracticeItemId = itemId,
            LessonId = lessonId,
            QuestionText = "What is the answer?",
            ExpectedAnswer = "correct_answer",
            Points = pointsPerItem,
            Difficulty = "Easy",
            IsActive = true,
            CreatedByUserId = userId,
        };
        _context.PracticeItems.Add(item);
        await _context.SaveChangesAsync();
    }

    private async System.Threading.Tasks.Task<Graph> CreateSimpleGraphForPathfinding(int userId)
    {
        var nodes = new List<CreateNodeDto>
        {
            new CreateNodeDto
            {
                Label = "A",
                X = 0,
                Y = 0,
            },
            new CreateNodeDto
            {
                Label = "B",
                X = 1,
                Y = 0,
            },
            new CreateNodeDto
            {
                Label = "C",
                X = 2,
                Y = 0,
            },
        };

        var edges = new List<CreateEdgeDto>
        {
            new CreateEdgeDto
            {
                FromNodeId = 0,
                ToNodeId = 1,
                Weight = 1,
                IsDirected = false,
            },
            new CreateEdgeDto
            {
                FromNodeId = 1,
                ToNodeId = 2,
                Weight = 1,
                IsDirected = false,
            },
        };

        var dto = new CreateGraphDto
        {
            Name = "Pathfinding Test Graph",
            Nodes = nodes,
            Edges = edges,
        };
        return await _graphService.CreateGraphAsync(dto, userId);
    }

    #endregion
}

// Mock logger for testing
public class MockLogger<T> : ILogger<T>
{
    public IDisposable? BeginScope<TState>(TState state)
        where TState : notnull => null;

    public bool IsEnabled(LogLevel logLevel) => true;

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter
    ) { }
}
