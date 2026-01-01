namespace SmartPath.Api.DTOs;

public class GraphEdgeDto
{
    public string FromClientNodeId { get; set; } = string.Empty;
    public string ToClientNodeId { get; set; } = string.Empty;
    public double Weight { get; set; } = 1.0;
    public bool IsDirected { get; set; } = true;
}
