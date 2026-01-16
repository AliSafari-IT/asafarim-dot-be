using Core.Api.Models.Common;

namespace Core.Api.Models.Resume;

public class WorkAchievement : BaseEntity
{
    public Guid WorkExperienceId { get; set; }
    public string Text { get; set; } = string.Empty;

    // Navigation property
    public WorkExperience? WorkExperience { get; set; }
}
