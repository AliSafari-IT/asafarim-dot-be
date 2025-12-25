namespace TaskManagement.Api.Models;

public class ProjectInvitation
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Email { get; set; } = string.Empty;
    public ProjectRole Role { get; set; }
    public string InvitedBy { get; set; } = string.Empty;
    public DateTime InvitedAt { get; set; }
    public bool IsAccepted { get; set; }
    public DateTime? AcceptedAt { get; set; }
    public string? AcceptedByUserId { get; set; }

    public TaskProject? Project { get; set; }
}
