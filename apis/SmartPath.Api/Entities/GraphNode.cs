namespace SmartPath.Api.Entities;

public class GraphNode
{
    public int Id { get; set; }
    public int GraphId { get; set; }
    public string Label { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public string? Metadata { get; set; }

    public virtual Graph? Graph { get; set; }
}
