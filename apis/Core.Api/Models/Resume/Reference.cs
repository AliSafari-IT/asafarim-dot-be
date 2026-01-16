using Core.Api.Models.Common;

namespace Core.Api.Models.Resume;

public class Reference : BaseEntity
{
    public Guid ResumeId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Relationship { get; set; } = string.Empty;

    public Resume? Resume { get; set; }
}
