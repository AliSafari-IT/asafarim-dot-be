namespace Core.Api.Models.Resume;

public class ProjectWorkExperience
{
    public Guid ProjectId { get; set; }
    
    public Guid WorkExperienceId { get; set; }
    
    public virtual Project? Project { get; set; }
    
    public virtual WorkExperience? WorkExperience { get; set; }
}
