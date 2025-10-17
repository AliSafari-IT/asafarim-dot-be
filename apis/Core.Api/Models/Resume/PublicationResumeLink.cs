using Core.Api.Models;

namespace Core.Api.Models.Resume;

/// <summary>
/// Many-to-many relationship: Publication ↔ Resume
/// Tracks which resumes are linked to which publications
/// </summary>
public class PublicationResumeLink
{
    public Guid Id { get; set; }
    public int PublicationId { get; set; }
    public Guid ResumeId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    
    // Navigation properties
    public Publication? Publication { get; set; }
    public Resume? Resume { get; set; }
}
