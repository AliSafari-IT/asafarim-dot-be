namespace SmartPath.Api.Entities;

public class Graph
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<GraphNode> Nodes { get; set; } = new List<GraphNode>();
    public virtual ICollection<GraphEdge> Edges { get; set; } = new List<GraphEdge>();
    public virtual ICollection<PathRun> PathRuns { get; set; } = new List<PathRun>();
}
