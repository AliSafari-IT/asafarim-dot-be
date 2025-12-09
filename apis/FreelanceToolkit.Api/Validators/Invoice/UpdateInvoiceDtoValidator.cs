using FluentValidation;
using FreelanceToolkit.Api.DTOs.Invoice;

namespace FreelanceToolkit.Api.Validators.Invoice;

public class UpdateInvoiceDtoValidator : AbstractValidator<UpdateInvoiceDto>
{
    public UpdateInvoiceDtoValidator()
    {
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

        RuleFor(x => x.Status)
            .Must(status => new[] { "Unpaid", "Paid", "Overdue", "Cancelled" }.Contains(status))
            .WithMessage("Status must be one of: Unpaid, Paid, Overdue, Cancelled");

        RuleFor(x => x.PaidAt)
            .NotEmpty()
            .WithMessage("Paid date is required when status is Paid")
            .When(x => x.Status == "Paid");
    }
}
