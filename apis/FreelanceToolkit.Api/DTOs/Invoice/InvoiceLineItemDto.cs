namespace FreelanceToolkit.Api.DTOs.Invoice;

public class InvoiceLineItemDto
{
    public Guid? Id { get; set; }
    public string Description { get; set; } = default!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? DiscountPercent { get; set; }
    public decimal Total => Quantity * UnitPrice * (1 - (DiscountPercent ?? 0) / 100);
}
