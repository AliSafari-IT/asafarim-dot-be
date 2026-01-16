using Core.Api.Models.Common;

namespace Core.Api.Models.Resume
{
    public class Education : BaseEntity
    {
        public Guid ResumeId { get; set; }

        public string Institution { get; set; } = string.Empty;
        public string Degree { get; set; } = string.Empty; // e.g., "Bachelor of Science"
        public string FieldOfStudy { get; set; } = string.Empty; // e.g., "Computer Science"

        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; } // null if still studying

        public string Description { get; set; } = string.Empty;

        public Resume? Resume { get; set; }
    }
}
