using FluentValidation;
using FreelanceToolkit.Api.DTOs.Proposal;

namespace FreelanceToolkit.Api.Validators.Proposal;

public class CreateProposalDtoValidator : AbstractValidator<CreateProposalDto>
{
    public CreateProposalDtoValidator()
    {
        RuleFor(x => x.ClientId).NotEmpty().WithMessage("Client is required");

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Proposal title is required")
            .MaximumLength(200)
            .WithMessage("Title cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("Description cannot exceed 2000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.ValidUntil)
            .GreaterThan(DateTime.UtcNow)
            .WithMessage("Valid until date must be in the future")
            .When(x => x.ValidUntil.HasValue);

        RuleFor(x => x.LineItems)
            .NotEmpty()
            .WithMessage("At least one line item is required")
            .Must(items => items.Count <= 100)
            .WithMessage("Cannot have more than 100 line items");

        RuleForEach(x => x.LineItems).SetValidator(new ProposalLineItemDtoValidator());

        RuleFor(x => x.TaxPercent)
            .InclusiveBetween(0, 100)
            .WithMessage("Tax percent must be between 0 and 100")
            .When(x => x.TaxPercent.HasValue);

        RuleFor(x => x.Terms)
            .MaximumLength(5000)
            .WithMessage("Terms cannot exceed 5000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Terms));

        RuleFor(x => x.Notes)
            .MaximumLength(2000)
            .WithMessage("Notes cannot exceed 2000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Notes));
    }
}
