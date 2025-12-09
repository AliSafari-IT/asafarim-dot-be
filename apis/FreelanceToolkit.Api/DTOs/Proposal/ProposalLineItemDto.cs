namespace FreelanceToolkit.Api.DTOs.Proposal;

public class ProposalLineItemDto
{
    public Guid? Id { get; set; }
    public string Description { get; set; } = default!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Total => Quantity * UnitPrice;
}
