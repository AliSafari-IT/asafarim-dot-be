using System;
using System.ComponentModel.DataAnnotations;
using Core.Api.Models.Common;

namespace Core.Api.Models
{
    public class ProjectInquiry : BaseEntity
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string UserEmail { get; set; } = string.Empty;

        [Required]
        public string UserName { get; set; } = string.Empty;

        [Required]
        public string ProjectType { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public string Status { get; set; } = "New"; // New, InDiscussion, Accepted, Declined

        // For tracking conversation thread
        public List<ProjectInquiryMessage> Messages { get; set; } = new();
    }

    public class ProjectInquiryMessage : BaseEntity
    {
        [Required]
        public Guid ProjectInquiryId { get; set; }

        [Required]
        public string SenderId { get; set; } = string.Empty;

        [Required]
        public string SenderName { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public bool IsFromClient { get; set; }
    }
}
