using Core.Api.Models.Common;

namespace Core.Api.Models.Resume;

public class ProjectPublication : BaseEntity
{
    public Guid ProjectId { get; set; }

    public Guid PublicationId { get; set; }

    public Project? Project { get; set; }

    public Publication? Publication { get; set; }
}
