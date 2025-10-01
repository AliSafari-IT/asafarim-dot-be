namespace Core.Api.Models.Resume;

public class Award
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime AwardedDate { get; set; }
    public string Description { get; set; } = string.Empty;

    public Resume? Resume { get; set; }
}
