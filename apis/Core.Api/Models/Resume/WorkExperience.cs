using System.Collections.Generic;
using Core.Api.Models.Common;

namespace Core.Api.Models.Resume;

public class WorkExperience : BaseEntity
{
    public Guid ResumeId { get; set; }

    // Basic details
    public string JobTitle { get; set; } = string.Empty; // e.g. "Senior Full Stack Developer"
    public string CompanyName { get; set; } = string.Empty; // e.g. "Tech Company"
    public string? Location { get; set; } // optional: "Brussels, Belgium"

    // Dates
    public DateTime StartDate { get; set; } // e.g. 2020-01-01
    public DateTime? EndDate { get; set; } // null if currently employed
    public bool IsCurrent { get; set; } // convenience flag

    // Description
    public string? Description { get; set; } // e.g. "Leading development of enterprise web apps..."

    // Achievements
    public List<WorkAchievement>? Achievements { get; set; } // bullet points under each job

    // Display options (optional, like Publication)
    public int SortOrder { get; set; }
    public bool Highlighted { get; set; }

    // Metadata
    public string? UserId { get; set; } // Who added this record
    public bool IsPublished { get; set; } = true;

    // Many-to-many with Technology
    public ICollection<WorkExperienceTechnology> WorkExperienceTechnologies { get; set; } =
        new List<WorkExperienceTechnology>();

    // Navigation property
    public Resume? Resume { get; set; }
}
