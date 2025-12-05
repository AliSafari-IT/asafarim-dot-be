using System.Security.Claims;
using Ai.Api.Data;
using Ai.Api.DTOs;
using Ai.Api.Models;
using Ai.Api.OpenAI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ai.Api.Controllers
{
    [ApiController]
    [Route("")]
    public class ChatMessagesController : ControllerBase
    {
        private readonly SharedDbContext _context;
        private readonly ILogger<ChatMessagesController> _logger;
        private readonly IOpenAiService _openAiService;

        public ChatMessagesController(
            SharedDbContext context,
            ILogger<ChatMessagesController> logger,
            IOpenAiService openAiService
        )
        {
            _context = context;
            _logger = logger;
            _openAiService = openAiService;
        }

        // PUT: chatmessages/{id}
        [HttpPut("chatmessages/{id}")]
        public async Task<ActionResult<ChatResponseDto>> UpdateChatMessage(Guid id, [FromBody] UpdateChatMessageDto updateDto)
        {
            var userId = GetCurrentUserId() ?? "anonymous";
            
            var message = await _context.ChatMessages
                .Include(m => m.Session)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (message == null)
                return NotFound();

            // Update content
            message.Content = updateDto.Content;
            
            // If we don't need to regenerate, just save and return
            if (!updateDto.RegenerateResponse || message.Role != "user")
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }

            // --- REGENERATION LOGIC ---
            
            // 1. Find and delete the subsequent assistant message
            var nextMessage = await _context.ChatMessages
                .Where(m => m.SessionId == message.SessionId && m.CreatedAt > message.CreatedAt)
                .OrderBy(m => m.CreatedAt)
                .FirstOrDefaultAsync();

            if (nextMessage != null && nextMessage.Role == "assistant")
            {
                _context.ChatMessages.Remove(nextMessage);
            }

            await _context.SaveChangesAsync();

            // 2. Build conversation history up to the edited message
            var history = await _context.ChatMessages
                .Where(m => m.SessionId == message.SessionId)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            var conversationContext = history
                .Select(m => $"{m.Role}: {m.Content}")
                .ToList();

            // 3. Generate new response
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var aiResponse = await _openAiService.GetChatCompletionAsync(conversationContext);
            stopwatch.Stop();

            // 4. Save new AI message
            var aiMessage = new ChatMessage
            {
                Id = Guid.NewGuid(),
                SessionId = message.SessionId,
                UserId = userId,
                Role = "assistant",
                Content = aiResponse,
                CreatedAt = DateTime.UtcNow,
                ModelUsed = "gpt-4o-mini",
                ResponseTimeMs = stopwatch.ElapsedMilliseconds
            };

            _context.ChatMessages.Add(aiMessage);
            
            // Update session stats
            if (message.Session != null)
            {
                message.Session.LastMessageAt = DateTime.UtcNow;
                message.Session.UpdatedAt = DateTime.UtcNow;
                message.Session.MessageCount = history.Count + 1; 
            }

            await _context.SaveChangesAsync();

            var response = new ChatResponseDto
            {
                SessionId = message.SessionId,
                Answer = aiResponse,
                Session = new ChatSessionDto
                {
                    Id = message.Session!.Id,
                    Title = message.Session.Title,
                    MessageCount = message.Session.MessageCount,
                },
                Messages = history.Concat(new[] { aiMessage })
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new ChatMessageDto
                    {
                        Id = m.Id,
                        Role = m.Role,
                        Content = m.Content,
                        CreatedAt = m.CreatedAt
                    }).ToList()
            };

            return Ok(response);
        }

        // DELETE: chatmessages/{id}
        [HttpDelete("chatmessages/{id}")]
        public async Task<IActionResult> DeleteChatMessage(Guid id)
        {
            var message = await _context.ChatMessages.FirstOrDefaultAsync(m => m.Id == id);

            if (message == null)
                return NotFound();

            // If user message, check if next is assistant
            if (message.Role == "user")
            {
                var nextMessage = await _context.ChatMessages
                    .Where(m => m.SessionId == message.SessionId && m.CreatedAt > message.CreatedAt)
                    .OrderBy(m => m.CreatedAt)
                    .FirstOrDefaultAsync();

                if (nextMessage != null && nextMessage.Role == "assistant")
                {
                    _context.ChatMessages.Remove(nextMessage);
                }
            }

            _context.ChatMessages.Remove(message);
            
            // Update session message count (simplified)
            var session = await _context.ChatSessions.FindAsync(message.SessionId);
            if (session != null)
            {
                 session.MessageCount = Math.Max(0, session.MessageCount - 1);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
