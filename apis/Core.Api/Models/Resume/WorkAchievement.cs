namespace Core.Api.Models.Resume;

public class WorkAchievement
{
    public Guid Id { get; set; }
    public Guid WorkExperienceId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    public WorkExperience? WorkExperience { get; set; }
}
