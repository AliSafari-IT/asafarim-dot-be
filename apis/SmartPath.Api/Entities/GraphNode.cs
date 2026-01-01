namespace SmartPath.Api.Entities;

public class GraphNode
{
    public int Id { get; set; }
    public int GraphId { get; set; }
    public string ClientNodeId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public string? Metadata { get; set; }

    public Graph? Graph { get; set; }
    public ICollection<GraphEdge> OutgoingEdges { get; set; } = new List<GraphEdge>();
    public ICollection<GraphEdge> IncomingEdges { get; set; } = new List<GraphEdge>();
}
