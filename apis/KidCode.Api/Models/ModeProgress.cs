namespace KidCode.Api.Models;

public class ModeProgress
{
    public int Level { get; set; } = 1;
    public List<string> Stickers { get; set; } = new();
    public List<string> Badges { get; set; } = new();
    public List<string> CompletedChallenges { get; set; } = new();
}
