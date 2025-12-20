namespace Core.Api.Models.Resume;

public class Reference
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Relationship { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Resume? Resume { get; set; }
}
