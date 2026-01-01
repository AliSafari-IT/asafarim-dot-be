namespace SmartPath.Api.DTOs;

public class CreateGraphDto
{
    public string Name { get; set; } = string.Empty;
    public List<GraphNodeDto> Nodes { get; set; } = new();
    public List<GraphEdgeDto> Edges { get; set; } = new();
}
