using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;
using System.Threading.Tasks;

namespace SmartPath.Api.Services;

public class GraphService : IGraphService
{
    private readonly SmartPathDbContext _context;
    private readonly ILogger<GraphService> _logger;

    public GraphService(SmartPathDbContext context, ILogger<GraphService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<Graph>> GetAllGraphsAsync()
    {
        return await _context.Graphs
            .Include(g => g.Nodes)
            .Include(g => g.Edges)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<Graph?> GetGraphByIdAsync(int id)
    {
        return await _context.Graphs
            .Include(g => g.Nodes)
            .Include(g => g.Edges)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async System.Threading.Tasks.Task<Graph> CreateGraphAsync(CreateGraphDto dto, int userId)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new ArgumentException("Graph name is required");

        var graph = new Graph
        {
            Name = dto.Name,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.Graphs.Add(graph);
        await _context.SaveChangesAsync();

        var nodeMap = new Dictionary<int, GraphNode>();
        foreach (var nodeDto in dto.Nodes)
        {
            var node = new GraphNode
            {
                GraphId = graph.Id,
                Label = nodeDto.Label,
                X = nodeDto.X,
                Y = nodeDto.Y,
                Metadata = nodeDto.Metadata,
            };
            _context.GraphNodes.Add(node);
            nodeMap[nodeDto.GetHashCode()] = node;
        }

        await _context.SaveChangesAsync();

        var nodeIdMap = new Dictionary<int, int>();
        var nodeIndex = 0;
        foreach (var nodeDto in dto.Nodes)
        {
            nodeIdMap[nodeIndex] = nodeMap[nodeDto.GetHashCode()].Id;
            nodeIndex++;
        }

        foreach (var edgeDto in dto.Edges)
        {
            if (edgeDto.Weight < 0)
                throw new ArgumentException("Edge weight cannot be negative");

            var edge = new GraphEdge
            {
                GraphId = graph.Id,
                FromNodeId = edgeDto.FromNodeId > 0 ? edgeDto.FromNodeId : nodeIdMap.Values.ElementAt(edgeDto.FromNodeId),
                ToNodeId = edgeDto.ToNodeId > 0 ? edgeDto.ToNodeId : nodeIdMap.Values.ElementAt(edgeDto.ToNodeId),
                Weight = edgeDto.Weight,
                IsDirected = edgeDto.IsDirected,
            };
            _context.GraphEdges.Add(edge);
        }

        await _context.SaveChangesAsync();

        graph.Nodes = await _context.GraphNodes.Where(n => n.GraphId == graph.Id).ToListAsync();
        graph.Edges = await _context.GraphEdges.Where(e => e.GraphId == graph.Id).ToListAsync();

        _logger.LogInformation("Graph created: id={GraphId}, name={Name}", graph.Id, graph.Name);
        return graph;
    }

    public async System.Threading.Tasks.Task<Graph> UpdateGraphAsync(int id, UpdateGraphDto dto)
    {
        var graph = await _context.Graphs
            .Include(g => g.Nodes)
            .Include(g => g.Edges)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (graph == null)
            throw new InvalidOperationException($"Graph {id} not found");

        if (!string.IsNullOrWhiteSpace(dto.Name))
            graph.Name = dto.Name;

        if (dto.Nodes != null)
        {
            _context.GraphNodes.RemoveRange(graph.Nodes);
            await _context.SaveChangesAsync();

            var nodeMap = new Dictionary<int, GraphNode>();
            foreach (var nodeDto in dto.Nodes)
            {
                var node = new GraphNode
                {
                    GraphId = graph.Id,
                    Label = nodeDto.Label,
                    X = nodeDto.X,
                    Y = nodeDto.Y,
                    Metadata = nodeDto.Metadata,
                };
                _context.GraphNodes.Add(node);
                nodeMap[nodeDto.GetHashCode()] = node;
            }

            await _context.SaveChangesAsync();

            var nodeIdMap = new Dictionary<int, int>();
            var nodeIndex = 0;
            foreach (var nodeDto in dto.Nodes)
            {
                nodeIdMap[nodeIndex] = nodeMap[nodeDto.GetHashCode()].Id;
                nodeIndex++;
            }

            if (dto.Edges != null)
            {
                _context.GraphEdges.RemoveRange(graph.Edges);
                foreach (var edgeDto in dto.Edges)
                {
                    if (edgeDto.Weight < 0)
                        throw new ArgumentException("Edge weight cannot be negative");

                    var edge = new GraphEdge
                    {
                        GraphId = graph.Id,
                        FromNodeId = edgeDto.FromNodeId > 0 ? edgeDto.FromNodeId : nodeIdMap.Values.ElementAt(edgeDto.FromNodeId),
                        ToNodeId = edgeDto.ToNodeId > 0 ? edgeDto.ToNodeId : nodeIdMap.Values.ElementAt(edgeDto.ToNodeId),
                        Weight = edgeDto.Weight,
                        IsDirected = edgeDto.IsDirected,
                    };
                    _context.GraphEdges.Add(edge);
                }
            }
        }

        graph.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Graph updated: id={GraphId}", id);
        return graph;
    }

    public async System.Threading.Tasks.Task DeleteGraphAsync(int id)
    {
        var graph = await _context.Graphs.FirstOrDefaultAsync(g => g.Id == id);
        if (graph == null)
            throw new InvalidOperationException($"Graph {id} not found");

        _context.Graphs.Remove(graph);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Graph deleted: id={GraphId}", id);
    }
}
