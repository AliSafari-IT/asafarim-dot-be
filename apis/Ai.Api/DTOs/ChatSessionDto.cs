namespace Ai.Api.DTOs
{
    public class ChatSessionDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsArchived { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public int MessageCount { get; set; }
        public List<ChatMessageDto> Messages { get; set; } = new List<ChatMessageDto>();
    }

    public class CreateChatSessionDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UpdateChatSessionDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsArchived { get; set; }
    }

    public class ChatMessageDto
    {
        public Guid Id { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int? TokensUsed { get; set; }
        public string? ModelUsed { get; set; }
        public long? ResponseTimeMs { get; set; }
    }

    public class SendMessageDto
    {
        public Guid? SessionId { get; set; } // null for new session
        public string Message { get; set; } = string.Empty;
        public string? SessionTitle { get; set; } // for new sessions
    }

    public class ChatResponseDto
    {
        public Guid SessionId { get; set; }
        public string Answer { get; set; } = string.Empty;
        public ChatSessionDto Session { get; set; } = null!;
        public List<ChatMessageDto> Messages { get; set; } = new List<ChatMessageDto>();
    }
}
