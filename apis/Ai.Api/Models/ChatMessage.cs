using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ai.Api.Models
{
    [Table("chat_messages")]
    public class ChatMessage
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Required]
        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("role")]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty; // "user" or "assistant"

        [Required]
        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("tokens_used")]
        public int? TokensUsed { get; set; }

        [Column("model_used")]
        [MaxLength(100)]
        public string? ModelUsed { get; set; }

        [Column("response_time_ms")]
        public long? ResponseTimeMs { get; set; }

        // Navigation property
        [ForeignKey("SessionId")]
        public virtual ChatSession Session { get; set; } = null!;
    }
}
