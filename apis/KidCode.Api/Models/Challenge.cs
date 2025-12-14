namespace KidCode.Api.Models;

public class Challenge
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public ProjectMode Mode { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string? StarterBlocksJson { get; set; }
    public string? SuccessCriteria { get; set; }
    public int Level { get; set; } = 1;
    public string? RewardSticker { get; set; }
    public bool IsDaily { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
