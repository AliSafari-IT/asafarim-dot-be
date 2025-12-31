namespace SmartPath.Api.Entities;

public class GraphEdge
{
    public int Id { get; set; }
    public int GraphId { get; set; }
    public int FromNodeId { get; set; }
    public int ToNodeId { get; set; }
    public double Weight { get; set; }
    public bool IsDirected { get; set; }

    public virtual Graph? Graph { get; set; }
    public virtual GraphNode? FromNode { get; set; }
    public virtual GraphNode? ToNode { get; set; }
}
