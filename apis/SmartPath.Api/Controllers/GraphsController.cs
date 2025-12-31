using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.Services;

namespace SmartPath.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GraphsController : ControllerBase
{
    private readonly IGraphService _graphService;
    private readonly IPathfindingService _pathfindingService;
    private readonly ILogger<GraphsController> _logger;

    public GraphsController(
        IGraphService graphService,
        IPathfindingService pathfindingService,
        ILogger<GraphsController> logger
    )
    {
        _graphService = graphService;
        _pathfindingService = pathfindingService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<GraphDto>>> GetGraphs()
    {
        try
        {
            var graphs = await _graphService.GetAllGraphsAsync();
            var dtos = graphs.Select(MapToDto).ToList();
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving graphs");
            return StatusCode(500, new { error = "Failed to retrieve graphs" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GraphDto>> GetGraph(int id)
    {
        try
        {
            var graph = await _graphService.GetGraphByIdAsync(id);
            if (graph == null)
                return NotFound(new { error = $"Graph {id} not found" });

            return Ok(MapToDto(graph));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving graph {GraphId}", id);
            return StatusCode(500, new { error = "Failed to retrieve graph" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<GraphDto>> CreateGraph([FromBody] CreateGraphDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { error = "Graph name is required" });

            var userId = GetUserId();
            var graph = await _graphService.CreateGraphAsync(dto, userId);
            return CreatedAtAction(nameof(GetGraph), new { id = graph.Id }, MapToDto(graph));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating graph");
            return StatusCode(500, new { error = "Failed to create graph" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GraphDto>> UpdateGraph(int id, [FromBody] UpdateGraphDto dto)
    {
        try
        {
            var graph = await _graphService.UpdateGraphAsync(id, dto);
            return Ok(MapToDto(graph));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating graph {GraphId}", id);
            return StatusCode(500, new { error = "Failed to update graph" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGraph(int id)
    {
        try
        {
            await _graphService.DeleteGraphAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting graph {GraphId}", id);
            return StatusCode(500, new { error = "Failed to delete graph" });
        }
    }

    [HttpPost("{id}/shortest-path")]
    public async Task<ActionResult<PathfindingResult>> FindShortestPath(
        int id,
        [FromBody] ShortestPathRequest request
    )
    {
        try
        {
            if (request.StartNodeId <= 0 || request.EndNodeId <= 0)
                return BadRequest(new { error = "Valid start and end node IDs are required" });

            if (string.IsNullOrWhiteSpace(request.Algorithm))
                return BadRequest(new { error = "Algorithm must be specified (astar or dijkstra)" });

            var result = await _pathfindingService.FindShortestPathAsync(
                id,
                request.StartNodeId,
                request.EndNodeId,
                request.Algorithm,
                request.AllowDiagonal ?? false
            );

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding shortest path in graph {GraphId}", id);
            return StatusCode(500, new { error = "Failed to find shortest path" });
        }
    }

    private GraphDto MapToDto(Entities.Graph graph)
    {
        return new GraphDto
        {
            Id = graph.Id,
            Name = graph.Name,
            CreatedAt = graph.CreatedAt,
            UpdatedAt = graph.UpdatedAt,
            Nodes = graph.Nodes.Select(n => new NodeDto
            {
                Id = n.Id,
                Label = n.Label,
                X = n.X,
                Y = n.Y,
                Metadata = n.Metadata,
            }).ToList(),
            Edges = graph.Edges.Select(e => new EdgeDto
            {
                Id = e.Id,
                FromNodeId = e.FromNodeId,
                ToNodeId = e.ToNodeId,
                Weight = e.Weight,
                IsDirected = e.IsDirected,
            }).ToList(),
        };
    }

    private int GetUserId()
    {
        if (!HttpContext.Items.TryGetValue("UserId", out var userIdObj) || userIdObj == null)
        {
            if (HttpContext.Items.TryGetValue("UserSyncError", out var errorObj))
            {
                throw new InvalidOperationException("User sync failed: " + errorObj);
            }
            throw new InvalidOperationException("User context not available");
        }

        if (!int.TryParse(userIdObj.ToString(), out var userId) || userId == 0)
        {
            throw new InvalidOperationException("Invalid user ID");
        }

        return userId;
    }
}

public class ShortestPathRequest
{
    public int StartNodeId { get; set; }
    public int EndNodeId { get; set; }
    public string Algorithm { get; set; } = string.Empty;
    public bool? AllowDiagonal { get; set; }
}
