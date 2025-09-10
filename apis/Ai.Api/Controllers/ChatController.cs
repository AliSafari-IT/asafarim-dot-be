using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ai.Api.Data;
using Ai.Api.DTOs;
using Ai.Api.Models;
using Ai.Api.OpenAI;
using System.Security.Claims;

namespace Ai.Api.Controllers
{
    [ApiController]
    [Route("")]
    public class ChatController : ControllerBase
    {
        private readonly IOpenAiService _openAIService;
        private readonly SharedDbContext _context;
        private readonly ILogger<ChatController> _logger;

        public ChatController(
            IOpenAiService openAIService,
            SharedDbContext context,
            ILogger<ChatController> logger)
        {
            _openAIService = openAIService;
            _context = context;
            _logger = logger;
        }

        [HttpPost("chat")]
        public async Task<ActionResult<ChatResponseDto>> SendMessage([FromBody] SendMessageDto request)
        {
            var userId = "anonymous"; // Remove authentication requirement

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            ChatSession session;
            List<ChatMessage> existingMessages = new();

            try
            {
                // Handle session creation or retrieval
                if (request.SessionId.HasValue)
                {
                    // Existing session
                    var sessions = await _context
                        .ChatSessions
                        .Where(s => !s.IsDeleted)
                        .Include(s => s.Messages.OrderBy(m => m.CreatedAt))
                        .FirstOrDefaultAsync(s => s.Id == request.SessionId.Value && s.UserId == userId && !s.IsDeleted);

                    if (sessions == null)
                        return NotFound("Chat session not found");

                    session = sessions;
                    existingMessages = session.Messages.ToList();
                }
                else
                {
                    // Create new session
                    var sessionTitle = !string.IsNullOrEmpty(request.SessionTitle) 
                        ? request.SessionTitle 
                        : GenerateSessionTitle(request.Message);

                    session = new ChatSession
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Title = sessionTitle,
                        Description = $"Started with: {request.Message.Substring(0, Math.Min(100, request.Message.Length))}...",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        IsArchived = false,
                        IsDeleted = false,
                        MessageCount = 0
                    };

                    _context.ChatSessions.Add(session);
                }

                // Add user message to database
                var userMessage = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    SessionId = session.Id,
                    UserId = userId,
                    Role = "user",
                    Content = request.Message,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ChatMessages.Add(userMessage);

                // Prepare conversation context for AI
                var conversationHistory = existingMessages
                    .Concat(new[] { userMessage })
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => $"{m.Role}: {m.Content}")
                    .ToList();

                // Get AI response
                var aiResponse = await _openAIService.GetChatCompletionAsync(conversationHistory);
                stopwatch.Stop();

                // Add AI message to database
                var aiMessage = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    SessionId = session.Id,
                    UserId = userId,
                    Role = "assistant",
                    Content = aiResponse,
                    CreatedAt = DateTime.UtcNow,
                    ModelUsed = "gpt-4o-mini", // You can get this from configuration
                    ResponseTimeMs = stopwatch.ElapsedMilliseconds
                };

                _context.ChatMessages.Add(aiMessage);

                // Update session metadata
                session.LastMessageAt = DateTime.UtcNow;
                session.UpdatedAt = DateTime.UtcNow;
                session.MessageCount = session.Messages.Count + 2; // +2 for user and AI messages

                await _context.SaveChangesAsync();

                // Prepare response
                var response = new ChatResponseDto
                {
                    SessionId = session.Id,
                    Answer = aiResponse,
                    Session = new ChatSessionDto
                    {
                        Id = session.Id,
                        Title = session.Title,
                        Description = session.Description,
                        CreatedAt = session.CreatedAt,
                        UpdatedAt = session.UpdatedAt,
                        IsArchived = session.IsArchived,
                        LastMessageAt = session.LastMessageAt,
                        MessageCount = session.MessageCount
                    },
                    Messages = existingMessages
                        .Concat(new[] { userMessage, aiMessage })
                        .OrderBy(m => m.CreatedAt)
                        .Select(m => new ChatMessageDto
                        {
                            Id = m.Id,
                            Role = m.Role,
                            Content = m.Content,
                            CreatedAt = m.CreatedAt,
                            TokensUsed = m.TokensUsed,
                            ModelUsed = m.ModelUsed,
                            ResponseTimeMs = m.ResponseTimeMs
                        })
                        .ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing chat message");
                return StatusCode(500, "An error occurred while processing your message");
            }
        }

        private string? GetCurrentUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        private string GenerateSessionTitle(string firstMessage)
        {
            // Generate a title based on the first message
            var words = firstMessage.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (words.Length <= 5)
                return firstMessage.Substring(0, Math.Min(50, firstMessage.Length));

            return string.Join(' ', words.Take(5)) + "...";
        }
    }
}
