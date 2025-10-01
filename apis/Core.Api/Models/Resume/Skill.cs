namespace Core.Api.Models.Resume;

public enum SkillLevel
{
    Beginner = 1,
    Intermediate = 2,
    Advanced = 3,
    Expert = 4
}

public class Skill
{
    public Guid Id { get; set; }

    // Links the skill to a specific resume (many skills per resume)
    public Guid ResumeId { get; set; }

    // Name of the skill (e.g., "C#", "Project Management")
    public string Name { get; set; } = string.Empty;

    // Optional: categorize skills (e.g., "Technical", "Soft", "Language")
    public string Category { get; set; } = string.Empty;

    // Optional: level of proficiency (Beginner, Intermediate, Expert)
    public SkillLevel Level { get; set; }
    // Optional: numeric rating (e.g., 1–5 scale)
    public int Rating { get; set; }

    // Date added (for auditing)
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property to Resume
    public Resume? Resume { get; set; }
}
