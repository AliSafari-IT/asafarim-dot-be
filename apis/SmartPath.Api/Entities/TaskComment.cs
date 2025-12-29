namespace SmartPath.Api.Entities;

public class TaskComment
{
    public int CommentId { get; set; }
    public int TaskId { get; set; }
    public int UserId { get; set; }
    public string CommentText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public Task? Task { get; set; }
    public User? User { get; set; }
}
