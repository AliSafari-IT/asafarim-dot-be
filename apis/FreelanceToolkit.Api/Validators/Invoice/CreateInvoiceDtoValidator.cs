using FluentValidation;
using FreelanceToolkit.Api.DTOs.Invoice;

namespace FreelanceToolkit.Api.Validators.Invoice;

public class CreateInvoiceDtoValidator : AbstractValidator<CreateInvoiceDto>
{
    public CreateInvoiceDtoValidator()
    {
        RuleFor(x => x.ClientId).NotEmpty().WithMessage("Client is required");

        RuleFor(x => x.IssueDate).NotEmpty().WithMessage("Issue date is required");

        RuleFor(x => x.DueDate)
            .NotEmpty()
            .WithMessage("Due date is required")
            .GreaterThanOrEqualTo(x => x.IssueDate)
            .WithMessage("Due date must be on or after issue date");

        RuleFor(x => x.LineItems)
            .NotEmpty()
            .WithMessage("At least one line item is required")
            .Must(items => items.Count <= 100)
            .WithMessage("Cannot have more than 100 line items");

        RuleForEach(x => x.LineItems).SetValidator(new InvoiceLineItemDtoValidator());

        RuleFor(x => x.TaxPercent)
            .InclusiveBetween(0, 100)
            .WithMessage("Tax percent must be between 0 and 100")
            .When(x => x.TaxPercent.HasValue);

        RuleFor(x => x.Notes)
            .MaximumLength(2000)
            .WithMessage("Notes cannot exceed 2000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Notes));

        RuleFor(x => x.PaymentInstructions)
            .MaximumLength(1000)
            .WithMessage("Payment instructions cannot exceed 1000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.PaymentInstructions));
    }
}
