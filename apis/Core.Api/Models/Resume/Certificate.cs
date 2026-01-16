using System;
using Core.Api.Models.Common;

namespace Core.Api.Models.Resume
{
    public class Certificate : BaseEntity
    {
        public Guid ResumeId { get; set; }

        public string Name { get; set; } = string.Empty; // e.g., "AWS Certified Solutions Architect"
        public string Issuer { get; set; } = string.Empty; // e.g., "Amazon Web Services"

        public DateTime IssueDate { get; set; }
        public DateTime? ExpiryDate { get; set; } // null if no expiration

        public string CredentialId { get; set; } = string.Empty;
        public string CredentialUrl { get; set; } = string.Empty;

        public Resume? Resume { get; set; }
    }
}
