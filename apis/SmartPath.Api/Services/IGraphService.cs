using SmartPath.Api.Entities;
using System.Threading.Tasks;

namespace SmartPath.Api.Services;

public interface IGraphService
{
    System.Threading.Tasks.Task<List<Graph>> GetAllGraphsAsync();
    System.Threading.Tasks.Task<Graph?> GetGraphByIdAsync(int id);
    System.Threading.Tasks.Task<Graph> CreateGraphAsync(CreateGraphDto dto, int userId);
    System.Threading.Tasks.Task<Graph> UpdateGraphAsync(int id, UpdateGraphDto dto);
    System.Threading.Tasks.Task DeleteGraphAsync(int id);
}

public class CreateGraphDto
{
    public string Name { get; set; } = string.Empty;
    public List<CreateNodeDto> Nodes { get; set; } = new();
    public List<CreateEdgeDto> Edges { get; set; } = new();
}

public class UpdateGraphDto
{
    public string? Name { get; set; }
    public List<CreateNodeDto>? Nodes { get; set; }
    public List<CreateEdgeDto>? Edges { get; set; }
}

public class CreateNodeDto
{
    public string Label { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public string? Metadata { get; set; }
}

public class CreateEdgeDto
{
    public int FromNodeId { get; set; }
    public int ToNodeId { get; set; }
    public double Weight { get; set; }
    public bool IsDirected { get; set; }
}

public class GraphDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<NodeDto> Nodes { get; set; } = new();
    public List<EdgeDto> Edges { get; set; } = new();
}

public class NodeDto
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public double X { get; set; }
    public double Y { get; set; }
    public string? Metadata { get; set; }
}

public class EdgeDto
{
    public int Id { get; set; }
    public int FromNodeId { get; set; }
    public int ToNodeId { get; set; }
    public double Weight { get; set; }
    public bool IsDirected { get; set; }
}
