using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public class PathfindingService : IPathfindingService
{
    private readonly SmartPathDbContext _context;
    private readonly ILogger<PathfindingService> _logger;

    public PathfindingService(SmartPathDbContext context, ILogger<PathfindingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PathfindingResult> FindShortestPathAsync(
        int graphId,
        int startNodeId,
        int endNodeId,
        string algorithm,
        bool allowDiagonal = false
    )
    {
        var startTime = DateTime.UtcNow;
        var sw = System.Diagnostics.Stopwatch.StartNew();

        var graph = await _context.Graphs
            .Include(g => g.Nodes)
            .Include(g => g.Edges)
            .FirstOrDefaultAsync(g => g.Id == graphId);

        if (graph == null)
            throw new InvalidOperationException($"Graph {graphId} not found");

        var startNode = graph.Nodes.FirstOrDefault(n => n.Id == startNodeId);
        var endNode = graph.Nodes.FirstOrDefault(n => n.Id == endNodeId);

        if (startNode == null || endNode == null)
            throw new InvalidOperationException("Start or end node not found");

        PathfindingResult result = algorithm.ToLower() switch
        {
            "astar" => AStarSearch(graph, startNode, endNode),
            "dijkstra" => DijkstraSearch(graph, startNode, endNode),
            _ => throw new InvalidOperationException($"Unknown algorithm: {algorithm}"),
        };

        sw.Stop();
        result.Diagnostics.DurationMs = sw.ElapsedMilliseconds;

        _logger.LogInformation(
            "Pathfinding completed: graph={GraphId}, algorithm={Algorithm}, cost={Cost}, duration={Duration}ms",
            graphId,
            algorithm,
            result.TotalCost,
            result.Diagnostics.DurationMs
        );

        return result;
    }

    private PathfindingResult AStarSearch(Graph graph, GraphNode start, GraphNode goal)
    {
        var result = new PathfindingResult();
        var openSet = new PriorityQueue<GraphNode, double>();
        var cameFrom = new Dictionary<int, int>();
        var gScore = new Dictionary<int, double>();
        var fScore = new Dictionary<int, double>();
        var visited = new HashSet<int>();
        var iterations = 0;

        foreach (var node in graph.Nodes)
        {
            gScore[node.Id] = double.MaxValue;
            fScore[node.Id] = double.MaxValue;
        }

        gScore[start.Id] = 0;
        fScore[start.Id] = Heuristic(start, goal);
        openSet.Enqueue(start, fScore[start.Id]);

        while (openSet.Count > 0)
        {
            iterations++;
            var current = openSet.Dequeue();

            if (current.Id == goal.Id)
            {
                result.TotalCost = gScore[goal.Id];
                result.PathNodeIds = ReconstructPath(cameFrom, goal.Id);
                result.Diagnostics.Iterations = iterations;
                return result;
            }

            if (visited.Contains(current.Id))
                continue;

            visited.Add(current.Id);
            result.VisitedNodeIdsInOrder.Add(current.Id);

            var neighbors = GetNeighbors(graph, current);
            foreach (var (neighbor, edgeWeight) in neighbors)
            {
                if (visited.Contains(neighbor.Id))
                    continue;

                var tentativeGScore = gScore[current.Id] + edgeWeight;

                if (tentativeGScore < gScore[neighbor.Id])
                {
                    cameFrom[neighbor.Id] = current.Id;
                    gScore[neighbor.Id] = tentativeGScore;
                    fScore[neighbor.Id] = gScore[neighbor.Id] + Heuristic(neighbor, goal);
                    openSet.Enqueue(neighbor, fScore[neighbor.Id]);
                    result.ExpandedEdgesInOrder.Add(new EdgeTrace { FromId = current.Id, ToId = neighbor.Id });
                }
            }
        }

        result.Diagnostics.Iterations = iterations;
        throw new InvalidOperationException("No path found between nodes");
    }

    private PathfindingResult DijkstraSearch(Graph graph, GraphNode start, GraphNode goal)
    {
        var result = new PathfindingResult();
        var distances = new Dictionary<int, double>();
        var cameFrom = new Dictionary<int, int>();
        var visited = new HashSet<int>();
        var pq = new PriorityQueue<GraphNode, double>();
        var iterations = 0;

        foreach (var node in graph.Nodes)
            distances[node.Id] = double.MaxValue;

        distances[start.Id] = 0;
        pq.Enqueue(start, 0);

        while (pq.Count > 0)
        {
            iterations++;
            var current = pq.Dequeue();

            if (visited.Contains(current.Id))
                continue;

            visited.Add(current.Id);
            result.VisitedNodeIdsInOrder.Add(current.Id);

            if (current.Id == goal.Id)
            {
                result.TotalCost = distances[goal.Id];
                result.PathNodeIds = ReconstructPath(cameFrom, goal.Id);
                result.Diagnostics.Iterations = iterations;
                return result;
            }

            var neighbors = GetNeighbors(graph, current);
            foreach (var (neighbor, edgeWeight) in neighbors)
            {
                if (visited.Contains(neighbor.Id))
                    continue;

                var alt = distances[current.Id] + edgeWeight;
                if (alt < distances[neighbor.Id])
                {
                    distances[neighbor.Id] = alt;
                    cameFrom[neighbor.Id] = current.Id;
                    pq.Enqueue(neighbor, alt);
                    result.ExpandedEdgesInOrder.Add(new EdgeTrace { FromId = current.Id, ToId = neighbor.Id });
                }
            }
        }

        result.Diagnostics.Iterations = iterations;
        throw new InvalidOperationException("No path found between nodes");
    }

    private List<(GraphNode, double)> GetNeighbors(Graph graph, GraphNode node)
    {
        var neighbors = new List<(GraphNode, double)>();

        var outgoing = graph.Edges.Where(e => e.FromNodeId == node.Id).ToList();
        foreach (var edge in outgoing)
        {
            if (edge.Weight < 0)
                throw new InvalidOperationException("Negative weights not supported");

            var neighbor = graph.Nodes.FirstOrDefault(n => n.Id == edge.ToNodeId);
            if (neighbor != null)
                neighbors.Add((neighbor, edge.Weight));
        }

        if (!outgoing.Any(e => e.IsDirected))
        {
            var incoming = graph.Edges.Where(e => e.ToNodeId == node.Id && !e.IsDirected).ToList();
            foreach (var edge in incoming)
            {
                var neighbor = graph.Nodes.FirstOrDefault(n => n.Id == edge.FromNodeId);
                if (neighbor != null && !neighbors.Any(n => n.Item1.Id == neighbor.Id))
                    neighbors.Add((neighbor, edge.Weight));
            }
        }

        return neighbors;
    }

    private double Heuristic(GraphNode from, GraphNode to)
    {
        var dx = from.X - to.X;
        var dy = from.Y - to.Y;
        return Math.Sqrt(dx * dx + dy * dy);
    }

    private List<int> ReconstructPath(Dictionary<int, int> cameFrom, int current)
    {
        var path = new List<int> { current };
        while (cameFrom.ContainsKey(current))
        {
            current = cameFrom[current];
            path.Insert(0, current);
        }
        return path;
    }
}
