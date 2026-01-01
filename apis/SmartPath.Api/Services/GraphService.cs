using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.DTOs;
using SmartPath.Api.Entities;
using Microsoft.Extensions.Logging;

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
        return await _context
            .Graphs.Where(g => g.CreatedByUserId > 0)
            .Include(g => g.Nodes)
            .Include(g => g.Edges)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Graph>> GetAllGraphsAsync(int userId)
    {
        return await _context
            .Graphs.Where(g => g.CreatedByUserId == userId)
            .Include(g => g.Nodes)
            .Include(g => g.Edges)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<Graph?> GetGraphByIdAsync(int id)
    {
        return await _context
            .Graphs.Where(g => g.CreatedByUserId > 0)
            .Include(g => g.Nodes)
            .Include(g => g.Edges)
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<Graph?> GetGraphByIdAsync(int id, int userId)
    {
        return await _context
            .Graphs.Where(g => g.Id == id && g.CreatedByUserId == userId)
            .Include(g => g.Nodes)
            .Include(g => g.Edges)
            .FirstOrDefaultAsync();
    }

    public async Task<Graph> CreateGraphAsync(CreateGraphDto dto, int userId)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new ArgumentException("Graph name is required");

        dto.Nodes ??= new List<NodeDto>();
        dto.Edges ??= new List<EdgeDto>();

        await using var tx = await _context.Database.BeginTransactionAsync();

        var graph = new Graph
        {
            Name = dto.Name.Trim(),
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.Graphs.Add(graph);
        await _context.SaveChangesAsync();

        var nodeMap = new Dictionary<string, GraphNode>();
        foreach (var nodeDto in dto.Nodes)
        {
            if (string.IsNullOrWhiteSpace(nodeDto.ClientNodeId))
                throw new ArgumentException("Node ClientNodeId is required");

            var node = new GraphNode
            {
                GraphId = graph.Id,
                ClientNodeId = nodeDto.ClientNodeId,
                Label = nodeDto.Label,
                X = nodeDto.X,
                Y = nodeDto.Y,
                Metadata = nodeDto.Metadata,
            };
            _context.GraphNodes.Add(node);
            nodeMap[nodeDto.ClientNodeId] = node;
        }

        await _context.SaveChangesAsync();

        foreach (var edgeDto in dto.Edges)
        {
            if (edgeDto.Weight < 0)
                throw new ArgumentException("Edge weight cannot be negative");

            if (!nodeMap.TryGetValue(edgeDto.FromClientNodeId, out var fromNode))
                throw new ArgumentException($"FromClientNodeId '{edgeDto.FromClientNodeId}' not found");

            if (!nodeMap.TryGetValue(edgeDto.ToClientNodeId, out var toNode))
                throw new ArgumentException($"ToClientNodeId '{edgeDto.ToClientNodeId}' not found");

            _context.GraphEdges.Add(
                new GraphEdge
                {
                    GraphId = graph.Id,
                    FromNodeId = fromNode.Id,
                    ToNodeId = toNode.Id,
                    Weight = edgeDto.Weight,
                    IsDirected = edgeDto.IsDirected,
                }
            );
        }

        await _context.SaveChangesAsync();
        await tx.CommitAsync();

        graph.Nodes = await _context.GraphNodes.Where(n => n.GraphId == graph.Id).ToListAsync();
        graph.Edges = await _context.GraphEdges.Where(ed => ed.GraphId == graph.Id).ToListAsync();

        _logger.LogInformation("Graph created: id={GraphId}, name={Name}, userId={UserId}", graph.Id, graph.Name, userId);
        return graph;
    }

    public async Task<Graph> UpdateGraphAsync(int id, UpdateGraphDto dto, int userId)
    {
        var graph = await _context.Graphs
            .Include(g => g.Nodes)
            .Include(g => g.Edges)
            .FirstOrDefaultAsync(g => g.Id == id && g.CreatedByUserId == userId);

        if (graph == null)
            throw new InvalidOperationException($"Graph {id} not found or you do not have permission to update it");

        await using var tx = await _context.Database.BeginTransactionAsync();

        if (!string.IsNullOrWhiteSpace(dto.Name))
            graph.Name = dto.Name.Trim();

        if (dto.Nodes != null || dto.Edges != null)
        {
            var newNodes = dto.Nodes ?? new List<NodeDto>();
            var newEdges = dto.Edges ?? new List<EdgeDto>();

            _context.GraphEdges.RemoveRange(graph.Edges);
            await _context.SaveChangesAsync();

            _context.GraphNodes.RemoveRange(graph.Nodes);
            await _context.SaveChangesAsync();

            var nodeMap = new Dictionary<string, GraphNode>();
            foreach (var nodeDto in newNodes)
            {
                if (string.IsNullOrWhiteSpace(nodeDto.ClientNodeId))
                    throw new ArgumentException("Node ClientNodeId is required");

                var node = new GraphNode
                {
                    GraphId = graph.Id,
                    ClientNodeId = nodeDto.ClientNodeId,
                    Label = nodeDto.Label,
                    X = nodeDto.X,
                    Y = nodeDto.Y,
                    Metadata = nodeDto.Metadata,
                };
                _context.GraphNodes.Add(node);
                nodeMap[nodeDto.ClientNodeId] = node;
            }

            await _context.SaveChangesAsync();

            foreach (var edgeDto in newEdges)
            {
                if (edgeDto.Weight < 0)
                    throw new ArgumentException("Edge weight cannot be negative");

                if (!nodeMap.TryGetValue(edgeDto.FromClientNodeId, out var fromNode))
                    throw new ArgumentException($"FromClientNodeId '{edgeDto.FromClientNodeId}' not found");

                if (!nodeMap.TryGetValue(edgeDto.ToClientNodeId, out var toNode))
                    throw new ArgumentException($"ToClientNodeId '{edgeDto.ToClientNodeId}' not found");

                _context.GraphEdges.Add(
                    new GraphEdge
                    {
                        GraphId = graph.Id,
                        FromNodeId = fromNode.Id,
                        ToNodeId = toNode.Id,
                        Weight = edgeDto.Weight,
                        IsDirected = edgeDto.IsDirected,
                    }
                );
            }

            await _context.SaveChangesAsync();
        }

        graph.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await tx.CommitAsync();

        graph.Nodes = await _context.GraphNodes.Where(n => n.GraphId == graph.Id).ToListAsync();
        graph.Edges = await _context.GraphEdges.Where(ed => ed.GraphId == graph.Id).ToListAsync();

        _logger.LogInformation("Graph updated: id={GraphId}, userId={UserId}", id, userId);
        return graph;
    }

    public async Task DeleteGraphAsync(int id, int userId)
    {
        var graph = await _context.Graphs.FirstOrDefaultAsync(g => g.Id == id && g.CreatedByUserId == userId);
        if (graph == null)
            throw new InvalidOperationException($"Graph {id} not found or you do not have permission to delete it");

        _context.Graphs.Remove(graph);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Graph deleted: id={GraphId}, userId={UserId}", id, userId);
    }
}
