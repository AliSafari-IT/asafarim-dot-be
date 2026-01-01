namespace SmartPath.Api.DTOs;

public class UpdateGraphDto
{
    public string? Name { get; set; }
    public List<GraphNodeDto>? Nodes { get; set; }
    public List<GraphEdgeDto>? Edges { get; set; }
}
