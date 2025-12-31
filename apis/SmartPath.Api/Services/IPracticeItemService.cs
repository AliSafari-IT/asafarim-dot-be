using System.Threading.Tasks;

namespace SmartPath.Api.Services;

public interface IPracticeItemService
{
    System.Threading.Tasks.Task<List<PracticeItemDto>> GetItemsByLessonAsync(int lessonId);
    System.Threading.Tasks.Task<PracticeItemDto> CreateItemAsync(
        CreatePracticeItemDto dto,
        int userId
    );
    System.Threading.Tasks.Task<PracticeItemDto> UpdateItemAsync(
        int itemId,
        UpdatePracticeItemDto dto,
        int userId
    );
    System.Threading.Tasks.Task DeleteItemAsync(int itemId, int userId);
    System.Threading.Tasks.Task<PracticeItemDto> GetNextItemAsync(int sessionId, int userId);
    System.Threading.Tasks.Task<PracticeDashboardDto> GetFamilyDashboardAsync(
        int familyId,
        int userId
    );
}

public class PracticeItemDto
{
    public int Id { get; set; }
    public int LessonId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int Points { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePracticeItemDto
{
    public int LessonId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public string ExpectedAnswer { get; set; } = string.Empty;
    public int Points { get; set; }
    public string Difficulty { get; set; } = "Medium";
}

public class UpdatePracticeItemDto
{
    public string QuestionText { get; set; } = string.Empty;
    public string ExpectedAnswer { get; set; } = string.Empty;
    public int Points { get; set; }
    public string Difficulty { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class PracticeDashboardDto
{
    public List<ChildDashboardDto> Children { get; set; } = new();
}

public class ChildDashboardDto
{
    public int ChildUserId { get; set; }
    public string ChildName { get; set; } = string.Empty;
    public int TotalPoints { get; set; }
    public int CurrentStreak { get; set; }
    public double Accuracy { get; set; }
    public List<AttemptSummaryDto> RecentAttempts { get; set; } = new();
    public List<WeakLessonDto> WeakLessons { get; set; } = new();
}

public class AttemptSummaryDto
{
    public int AttemptId { get; set; }
    public string QuestionPreview { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int PointsAwarded { get; set; }
    public int LessonId { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public DateTime AttemptedAt { get; set; }
}

public class WeakLessonDto
{
    public int LessonId { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public double Accuracy { get; set; }
    public int AttemptCount { get; set; }
}
