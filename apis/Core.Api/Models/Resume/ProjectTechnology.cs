namespace Core.Api.Models.Resume
{
    public class ProjectTechnology
    {
        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public Guid TechnologyId { get; set; }
        public Technology Technology { get; set; } = null!;
    }
}
