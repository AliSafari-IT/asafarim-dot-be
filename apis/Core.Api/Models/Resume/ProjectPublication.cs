namespace Core.Api.Models.Resume;

public class ProjectPublication
{
    public Guid ProjectId { get; set; }
    
    public int PublicationId { get; set; }
    
    public virtual Project? Project { get; set; }
    
    public virtual Core.Api.Models.Publication? Publication { get; set; }
}
