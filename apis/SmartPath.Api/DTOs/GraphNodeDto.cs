namespace SmartPath.Api.DTOs;

public class GraphNodeDto
{
    public string ClientNodeId { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public string? Metadata { get; set; }
}
