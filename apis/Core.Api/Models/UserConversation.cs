using System;
using System.ComponentModel.DataAnnotations;

namespace Core.Api.Models
{
    public class UserConversation
    {
        public int Id { get; set; }

        [Required]
        public string ReferenceNumber { get; set; } // Format: CONV-YYYYMMDD-XXXX

        [Required]
        public string UserId { get; set; }

        [Required]
        public string UserEmail { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Open"; // Open, Replied, Closed

        public List<ConversationMessage> Messages { get; set; } = new();
    }

    public class ConversationMessage
    {
        public int Id { get; set; }

        [Required]
        public int ConversationId { get; set; }

        public string? ReferencedConversationNumber { get; set; } // Optional reference to another conversation

        [Required]
        public string Subject { get; set; }

        [Required]
        public string Message { get; set; }

        public List<MessageAttachment> Attachments { get; set; } = new();

        public List<MessageLink> Links { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsFromUser { get; set; } = true;
    }

    public class MessageAttachment
    {
        public int Id { get; set; }

        [Required]
        public int MessageId { get; set; }

        [Required]
        public string FileName { get; set; }

        [Required]
        public string FileType { get; set; }

        [Required]
        public string FileUrl { get; set; }
    }

    public class MessageLink
    {
        public int Id { get; set; }

        [Required]
        public int MessageId { get; set; }

        [Required]
        public string Url { get; set; }

        public string? Description { get; set; }
    }
}
