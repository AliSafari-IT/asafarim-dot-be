using Core.Api.Data;
using Core.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserConversationsController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly ILogger<UserConversationsController> _logger;

    public UserConversationsController(
        CoreDbContext context,
        ILogger<UserConversationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserConversations()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var conversations = await _context.UserConversations
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(conversations);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserConversation(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var conversation = await _context.UserConversations
            .Include(c => c.Messages)
            .ThenInclude(m => m.Attachments)
            .Include(c => c.Messages)
            .ThenInclude(m => m.Links)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (conversation == null)
        {
            return NotFound(new { error = "Conversation not found" });
        }

        return Ok(conversation);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUserConversation([FromBody] UserConversationRequest request)
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

        // Generate a reference number for the conversation
        var referenceNumber = $"CONV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";

        var conversation = new UserConversation
        {
            ReferenceNumber = referenceNumber,
            UserId = userId,
            UserEmail = userEmail,
            Status = "Open",
            Messages = new List<ConversationMessage>
            {
                new ConversationMessage
                {
                    Subject = request.Subject,
                    Message = request.Message,
                    IsFromUser = true,
                    CreatedAt = DateTime.UtcNow,
                    Attachments = request.Attachments?.Select(a => new MessageAttachment
                    {
                        FileName = a.FileName,
                        FileType = a.FileType,
                        FileUrl = a.FileUrl
                    }).ToList() ?? new List<MessageAttachment>(),
                    Links = request.Links?.Select(l => new MessageLink
                    {
                        Url = l.Url,
                        Description = l.Description
                    }).ToList() ?? new List<MessageLink>()
                }
            }
        };

        _context.UserConversations.Add(conversation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUserConversation), new { id = conversation.Id }, conversation);
    }
}

public class UserConversationRequest
{
    public required string Subject { get; set; }
    public required string Message { get; set; }
    public List<AttachmentRequest>? Attachments { get; set; }
    public List<LinkRequest>? Links { get; set; }
}

public class AttachmentRequest
{
    public required string FileName { get; set; }
    public required string FileType { get; set; }
    public required string FileUrl { get; set; }
}

public class LinkRequest
{
    public required string Url { get; set; }
    public string? Description { get; set; }
}
