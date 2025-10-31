using System.Security.Claims;
using Ai.Api.Data;
using Ai.Api.DTOs;
using Ai.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ai.Api.Controllers
{
    [ApiController]
    [Route("")]
    public class ChatSessionsController : ControllerBase
    {
        private readonly SharedDbContext _context;
        private readonly ILogger<ChatSessionsController> _logger;

        public ChatSessionsController(
            SharedDbContext context,
            ILogger<ChatSessionsController> logger
        )
        {
            _context = context;
            _logger = logger;
        }

        // GET: chatsessions
        [HttpGet("chatsessions")]
        public async Task<ActionResult<IEnumerable<ChatSessionDto>>> GetChatSessions()
        {
            var userId = GetCurrentUserId() ?? "anonymous";

            var sessions = await _context
                .ChatSessions.Where(s => !s.IsDeleted && s.UserId == userId)
                .OrderByDescending(s => s.LastMessageAt ?? s.UpdatedAt)
                .Select(s => new ChatSessionDto
                {
                    Id = s.Id,
                    UserId = s.UserId,
                    Title = s.Title,
                    Description = s.Description,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt,
                    IsArchived = s.IsArchived,
                    LastMessageAt = s.LastMessageAt,
                    MessageCount = s.MessageCount,
                })
                .ToListAsync();

            return Ok(sessions);
        }

        // GET: chatsessions/{id}
        [HttpGet("chatsessions/{id}")]
        public async Task<ActionResult<ChatSessionDto>> GetChatSession(Guid id)
        {
            //  var userId = "anonymous"; // Remove authentication requirement

            var session = await _context
                .ChatSessions.Include(s => s.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted);

            if (session == null)
                return NotFound();

            var sessionDto = new ChatSessionDto
            {
                Id = session.Id,
                Title = session.Title,
                Description = session.Description,
                CreatedAt = session.CreatedAt,
                UpdatedAt = session.UpdatedAt,
                IsArchived = session.IsArchived,
                LastMessageAt = session.LastMessageAt,
                MessageCount = session.MessageCount,
                Messages = session
                    .Messages.Select(m => new ChatMessageDto
                    {
                        Id = m.Id,
                        Content = m.Content,
                        Role = m.Role,
                        CreatedAt = m.CreatedAt,
                    })
                    .ToList(),
            };

            return Ok(sessionDto);
        }

        // POST: chatsessions
        [HttpPost("chatsessions")]
        public async Task<ActionResult<ChatSessionDto>> CreateChatSession(
            CreateChatSessionDto createDto
        )
        {
            Console.WriteLine("\n=== CreateChatSession called ===");
            var userId = GetCurrentUserId();
            Console.WriteLine($"UserId from GetCurrentUserId: {userId ?? "NULL"}");
            
            var session = new ChatSession
            {
                Id = Guid.NewGuid(),
                UserId = userId ?? "anonymous",
                Title = createDto.Title,
                Description = createDto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsArchived = false,
                IsDeleted = false,
                MessageCount = 0,
            };

            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();

            var sessionDto = new ChatSessionDto
            {
                Id = session.Id,
                Title = session.Title,
                Description = session.Description,
                CreatedAt = session.CreatedAt,
                UpdatedAt = session.UpdatedAt,
                IsArchived = session.IsArchived,
                LastMessageAt = session.LastMessageAt,
                MessageCount = session.MessageCount,
            };

            return CreatedAtAction(nameof(GetChatSession), new { id = session.Id }, sessionDto);
        }

        // PUT: chatsessions/{id}
        [HttpPut("chatsessions/{id}")]
        public async Task<IActionResult> UpdateChatSession(Guid id, UpdateChatSessionDto updateDto)
        {
            //  var userId = "anonymous"; // Remove authentication requirement

            var session = await _context.ChatSessions.FirstOrDefaultAsync(s =>
                s.Id == id && !s.IsDeleted
            );

            if (session == null)
                return NotFound();

            session.Title = updateDto.Title;
            session.Description = updateDto.Description;
            session.IsArchived = updateDto.IsArchived;
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: chatsessions/{id}
        [HttpDelete("chatsessions/{id}")]
        public async Task<IActionResult> DeleteChatSession(Guid id)
        {
            //  var userId = "anonymous"; // Remove authentication requirement

            var session = await _context.ChatSessions.FirstOrDefaultAsync(s =>
                s.Id == id && !s.IsDeleted
            );

            if (session == null)
                return NotFound();

            session.IsDeleted = true;
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: chatsessions/{id}/archive
        [HttpPost("chatsessions/{id}/archive")]
        public async Task<IActionResult> ArchiveChatSession(Guid id)
        {
            //  var userId = "anonymous"; // Remove authentication requirement

            var session = await _context.ChatSessions.FirstOrDefaultAsync(s =>
                s.Id == id && !s.IsDeleted
            );

            if (session == null)
                return NotFound();

            session.IsArchived = !session.IsArchived;
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private string? GetCurrentUserId()
        {
            Console.WriteLine($"\n=== GetCurrentUserId called ===");
            
            // Check if cookie exists
            if (HttpContext.Request.Cookies.TryGetValue("atk", out var token))
            {
                Console.WriteLine($"✅ Found 'atk' cookie with token: {token.Substring(0, Math.Min(50, token.Length))}...");
            }
            else
            {
                Console.WriteLine($"❌ No 'atk' cookie found");
            }
            
            // Check User claims
            Console.WriteLine($"User.Identity.IsAuthenticated: {User.Identity?.IsAuthenticated}");
            Console.WriteLine($"User.Identity.AuthenticationType: {User.Identity?.AuthenticationType}");
            Console.WriteLine($"User.Claims count: {User.Claims.Count()}");
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"  Claim: {claim.Type} = {claim.Value}");
            }
            
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"Extracted userId: {userId ?? "NULL"}");
            return userId;
        }
    }
}
