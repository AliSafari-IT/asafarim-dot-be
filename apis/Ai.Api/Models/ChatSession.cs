using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ai.Api.Models
{
    [Table("chat_sessions")]
    public class ChatSession
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("user_id")]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("title")]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [Required]
        [Column("is_archived")]
        public bool IsArchived { get; set; } = false;

        [Required]
        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("last_message_at")]
        public DateTime? LastMessageAt { get; set; }

        [Column("message_count")]
        public int MessageCount { get; set; } = 0;

        // Navigation property for chat messages
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
