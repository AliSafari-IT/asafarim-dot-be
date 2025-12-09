using FluentValidation;
using FreelanceToolkit.Api.DTOs.Proposal;

namespace FreelanceToolkit.Api.Validators.Proposal;

public class ProposalLineItemDtoValidator : AbstractValidator<ProposalLineItemDto>
{
    public ProposalLineItemDtoValidator()
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
    }
}
