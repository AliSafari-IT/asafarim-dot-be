using System;
using System.ComponentModel.DataAnnotations;
using Core.Api.Models.Common;

namespace Core.Api.Models
{
    public class UserConversation : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string UserEmail { get; set; } = string.Empty;

        public string Status { get; set; } = "Open"; // Open, Replied, Closed

        public string ReferenceNumber { get; set; } = string.Empty;

        public List<ConversationMessage> Messages { get; set; } = new();
    }

    public class ConversationMessage : BaseEntity
    {
        [Required]
        public Guid ConversationId { get; set; }

        public string? ReferencedConversationNumber { get; set; } // Optional reference to another conversation

        [Required]
        public string Subject { get; set; }

        [Required]
        public string Message { get; set; }

        public List<MessageAttachment> Attachments { get; set; } = new();

        public List<MessageLink> Links { get; set; } = new();

        public bool IsFromUser { get; set; } = true;
    }

    public class MessageAttachment : BaseEntity
    {
        [Required]
        public Guid MessageId { get; set; }

        [Required]
        public string FileName { get; set; }

        [Required]
        public string FileType { get; set; }

        [Required]
        public string FileUrl { get; set; }
    }

    public class MessageLink : BaseEntity
    {
        [Required]
        public Guid MessageId { get; set; }

        [Required]
        public string Url { get; set; }

        public string? Description { get; set; }
    }
}
