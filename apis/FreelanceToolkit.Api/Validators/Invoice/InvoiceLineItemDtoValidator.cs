using FluentValidation;
using FreelanceToolkit.Api.DTOs.Invoice;

namespace FreelanceToolkit.Api.Validators.Invoice;

public class InvoiceLineItemDtoValidator : AbstractValidator<InvoiceLineItemDto>
{
    public InvoiceLineItemDtoValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Line item description is required")
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters");

        RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than 0");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Unit price cannot be negative");

        RuleFor(x => x.DiscountPercent)
            .InclusiveBetween(0, 100)
            .WithMessage("Discount must be between 0 and 100")
            .When(x => x.DiscountPercent.HasValue);
    }
}
