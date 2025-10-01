namespace Core.Api.Models.Resume;

public class SocialLink
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }

    public string Platform { get; set; } = string.Empty; // e.g., "GitHub", "LinkedIn"
    public string Url { get; set; } = string.Empty;

    public Resume? Resume { get; set; }
}
