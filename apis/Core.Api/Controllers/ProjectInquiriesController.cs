using System.Security.Claims;
using Core.Api.Data;
using Core.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectInquiriesController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly ILogger<ProjectInquiriesController> _logger;

    public ProjectInquiriesController(
        CoreDbContext context,
        ILogger<ProjectInquiriesController> logger
    )
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetProjectInquiries()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var inquiries = await _context
            .ProjectInquiries.Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(inquiries);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProjectInquiry(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var inquiry = await _context
            .ProjectInquiries.Include(p => p.Messages)
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (inquiry == null)
        {
            return NotFound(new { error = "Project inquiry not found" });
        }

        return Ok(inquiry);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProjectInquiry([FromBody] ProjectInquiryRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrEmpty(userEmail))
        {
            return BadRequest(new { error = "User email not found" });
        }

        var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown User";

        var inquiry = new ProjectInquiry
        {
            UserId = userId,
            UserEmail = userEmail,
            UserName = userName,
            ProjectType = request.ProjectType,
            Message = request.Message,
            Status = "New",
            CreatedAt = DateTime.UtcNow,
            Messages = new List<ProjectInquiryMessage>
            {
                new ProjectInquiryMessage
                {
                    SenderId = userId,
                    SenderName = userName,
                    Message = request.Message,
                    CreatedAt = DateTime.UtcNow,
                    IsFromClient = true,
                },
            },
        };

        _context.ProjectInquiries.Add(inquiry);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProjectInquiry), new { id = inquiry.Id }, inquiry);
    }

    [HttpPost("{id}/messages")]
    public async Task<IActionResult> AddMessage(
        int id,
        [FromBody] ProjectInquiryMessageRequest request
    )
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var inquiry = await _context.ProjectInquiries.FirstOrDefaultAsync(p =>
            p.Id == id && p.UserId == userId
        );

        if (inquiry == null)
        {
            return NotFound(new { error = "Project inquiry not found" });
        }

        var userName = User.FindFirst(ClaimTypes.Name)?.Value ?? "Unknown User";

        var message = new ProjectInquiryMessage
        {
            ProjectInquiryId = id,
            SenderId = userId,
            SenderName = userName,
            Message = request.Message,
            CreatedAt = DateTime.UtcNow,
            IsFromClient = true,
        };

        _context.ProjectInquiryMessages.Add(message);

        // Update the inquiry status and timestamp
        inquiry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(message);
    }
}

public class ProjectInquiryRequest
{
    public required string ProjectType { get; set; }
    public required string Message { get; set; }
}

public class ProjectInquiryMessageRequest
{
    public required string Message { get; set; }
}
