namespace Core.Api.Models.Resume;

public class Reference
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Relationship { get; set; } = string.Empty;
    public string ContactInfo { get; set; } = string.Empty;

    public Resume? Resume { get; set; }
}
