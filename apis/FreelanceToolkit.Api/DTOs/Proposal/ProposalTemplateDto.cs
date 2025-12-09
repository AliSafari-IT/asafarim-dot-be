namespace FreelanceToolkit.Api.DTOs.Proposal;

public class ProposalTemplateDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = default!;
    public string Content { get; set; } = default!;
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
}
