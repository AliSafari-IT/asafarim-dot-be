namespace Core.Api.Models.Resume;

public class ProjectTechnology
{
    public Guid ProjectId { get; set; }
    
    public Guid TechnologyId { get; set; }
    
    public virtual Project? Project { get; set; }
    
    public virtual Technology? Technology { get; set; }
}
