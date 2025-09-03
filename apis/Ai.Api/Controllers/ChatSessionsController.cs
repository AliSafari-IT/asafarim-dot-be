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
    [Route("api/[controller]")]
    [Authorize]
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

        // GET: api/chatsessions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChatSessionDto>>> GetChatSessions()
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var sessions = await _context
                .ChatSessions.Where(s => s.UserId == userId && !s.IsDeleted)
                .OrderByDescending(s => s.LastMessageAt ?? s.UpdatedAt)
                .Select(s => new ChatSessionDto
                {
                    Id = s.Id,
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

        // GET: api/chatsessions/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ChatSessionDto>> GetChatSession(Guid id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var session = await _context
                .ChatSessions.Include(s => s.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId && !s.IsDeleted);

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
            };

            return Ok(sessionDto);
        }

        // POST: api/chatsessions
        [HttpPost]
        public async Task<ActionResult<ChatSessionDto>> CreateChatSession(
            CreateChatSessionDto createDto
        )
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var session = new ChatSession
            {
                Id = Guid.NewGuid(),
                UserId = userId,
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

        // PUT: api/chatsessions/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateChatSession(Guid id, UpdateChatSessionDto updateDto)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var session = await _context.ChatSessions.FirstOrDefaultAsync(s =>
                s.Id == id && s.UserId == userId && !s.IsDeleted
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

        // DELETE: api/chatsessions/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChatSession(Guid id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var session = await _context.ChatSessions.FirstOrDefaultAsync(s =>
                s.Id == id && s.UserId == userId && !s.IsDeleted
            );

            if (session == null)
                return NotFound();

            session.IsDeleted = true;
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/chatsessions/{id}/archive
        [HttpPost("{id}/archive")]
        public async Task<IActionResult> ArchiveChatSession(Guid id)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var session = await _context.ChatSessions.FirstOrDefaultAsync(s =>
                s.Id == id && s.UserId == userId && !s.IsDeleted
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
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
