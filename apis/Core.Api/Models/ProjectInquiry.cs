using System;
using System.ComponentModel.DataAnnotations;

namespace Core.Api.Models
{
    public class ProjectInquiry
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public string UserEmail { get; set; }

        [Required]
        public string UserName { get; set; }

        [Required]
        public string ProjectType { get; set; }

        [Required]
        public string Message { get; set; }

        public string Status { get; set; } = "New"; // New, InDiscussion, Accepted, Declined

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // For tracking conversation thread
        public List<ProjectInquiryMessage> Messages { get; set; } = new();
    }

    public class ProjectInquiryMessage
    {
        public int Id { get; set; }

        [Required]
        public int ProjectInquiryId { get; set; }

        [Required]
        public string SenderId { get; set; }

        [Required]
        public string SenderName { get; set; }

        [Required]
        public string Message { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsFromClient { get; set; }
    }
}
