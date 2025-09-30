using System;
using System.Collections.Generic;

namespace Core.Api.Models;

public class WorkExperience
{
    public int Id { get; set; }

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
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UserId { get; set; } // Who added this record
    public bool IsPublished { get; set; } = true;
}

public class WorkAchievement
{
    public int Id { get; set; }
    public int WorkExperienceId { get; set; }
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    public WorkExperience? WorkExperience { get; set; }
}
