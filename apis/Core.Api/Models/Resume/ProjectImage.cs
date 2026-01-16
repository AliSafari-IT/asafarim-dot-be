using Core.Api.Models.Common;

namespace Core.Api.Models.Resume;

public class ProjectImage : BaseEntity
{
    public Guid ProjectId { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string? Caption { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsPrimary { get; set; }

    public Project? Project { get; set; }
}
