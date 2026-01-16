using Core.Api.Models.Common;

namespace Core.Api.Models.Resume;

public class ContactInfo : BaseEntity
{
    public Guid ResumeId { get; set; }

    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty; // City, Country

    public Resume? Resume { get; set; }
}
