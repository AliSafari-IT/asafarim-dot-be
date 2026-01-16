using Core.Api.Models.Common;

namespace Core.Api.Models.Resume
{
    public class Technology : BaseEntity
    {
        public string Name { get; set; } = string.Empty; // e.g., "C#", "React", "Docker"
        public string Category { get; set; } = string.Empty; // e.g., "Language", "Framework", "Tool"

        // Navigation collections for many-to-many relations
        public ICollection<ProjectTechnology> ProjectTechnologies { get; set; } = new List<ProjectTechnology>();
        public ICollection<WorkExperienceTechnology> WorkExperienceTechnologies { get; set; } = new List<WorkExperienceTechnology>();
    }
}
