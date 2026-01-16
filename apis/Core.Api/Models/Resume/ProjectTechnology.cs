using Core.Api.Models.Common;

namespace Core.Api.Models.Resume;

public class ProjectTechnology : BaseEntity
{
    public Guid ProjectId { get; set; }

    public Guid TechnologyId { get; set; }

    public Project? Project { get; set; }

    public Technology? Technology { get; set; }
}
