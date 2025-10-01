using System;

namespace Core.Api.Models.Resume
{
    public class Education
    {
        public Guid Id { get; set; }
        public Guid ResumeId { get; set; }

        public string Institution { get; set; } = string.Empty;
        public string Degree { get; set; } = string.Empty; // e.g., "Bachelor of Science"
        public string FieldOfStudy { get; set; } = string.Empty; // e.g., "Computer Science"

        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; } // null if still studying

        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Resume? Resume { get; set; }
    }
}
