namespace Core.Api.Models.Resume
{
    public class Technology
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty; // e.g., "C#", "React", "Docker"
        public string Category { get; set; } = string.Empty; // e.g., "Language", "Framework", "Tool"

        // Navigation collections for many-to-many relations
        public ICollection<ProjectTechnology> ProjectTechnologies { get; set; } = new List<ProjectTechnology>();
        public ICollection<WorkExperienceTechnology> WorkExperienceTechnologies { get; set; } = new List<WorkExperienceTechnology>();
    }
}
