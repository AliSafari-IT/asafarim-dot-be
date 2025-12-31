namespace SmartPath.Api.Services;

public interface IPathfindingService
{
    Task<PathfindingResult> FindShortestPathAsync(
        int graphId,
        int startNodeId,
        int endNodeId,
        string algorithm,
        bool allowDiagonal = false
    );
}

public class PathfindingResult
{
    public List<int> PathNodeIds { get; set; } = new();
    public double TotalCost { get; set; }
    public List<int> VisitedNodeIdsInOrder { get; set; } = new();
    public List<EdgeTrace> ExpandedEdgesInOrder { get; set; } = new();
    public PathfindingDiagnostics Diagnostics { get; set; } = new();
}

public class EdgeTrace
{
    public int FromId { get; set; }
    public int ToId { get; set; }
}

public class PathfindingDiagnostics
{
    public int Iterations { get; set; }
    public long DurationMs { get; set; }
}
