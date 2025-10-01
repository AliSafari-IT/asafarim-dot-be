namespace Core.Api.Models.Resume;

public class ContactInfo
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }

    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty; // City, Country

    public Resume? Resume { get; set; }
}
