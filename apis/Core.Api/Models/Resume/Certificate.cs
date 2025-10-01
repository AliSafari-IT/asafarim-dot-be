using System;

namespace Core.Api.Models.Resume
{
    public class Certificate
    {
        public Guid Id { get; set; }
        public Guid ResumeId { get; set; }

        public string Name { get; set; } = string.Empty; // e.g., "AWS Certified Solutions Architect"
        public string Issuer { get; set; } = string.Empty; // e.g., "Amazon Web Services"

        public DateTime IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; } // null if no expiration

        public string CredentialId { get; set; } = string.Empty;
        public string CredentialUrl { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Resume? Resume { get; set; }
    }
}
