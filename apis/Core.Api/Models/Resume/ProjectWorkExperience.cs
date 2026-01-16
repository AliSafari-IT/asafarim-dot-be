using Core.Api.Models.Common;

namespace Core.Api.Models.Resume;

public class ProjectWorkExperience : BaseEntity
{
    public Guid ProjectId { get; set; }

    public Guid WorkExperienceId { get; set; }

    public Project? Project { get; set; }

    public WorkExperience? WorkExperience { get; set; }
}
