namespace SmartPath.Api.Entities;

public class PathRun
{
    public int Id { get; set; }
    public int StartNodeId { get; set; }
    public int EndNodeId { get; set; }
    public string Algorithm { get; set; } = string.Empty;
    public double TotalCost { get; set; }
    public DateTime CreatedAt { get; set; }
}
