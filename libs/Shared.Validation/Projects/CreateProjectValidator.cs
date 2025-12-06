using FluentValidation;

// using ASafariM.Application.Projects.Dtos; // adjust

namespace ASafariM.Shared.Validation.Projects;

public class CreateProjectValidator : AbstractValidator<CreateProjectDto>
{
    public CreateProjectValidator()
    {
        RuleFor(x => x.Title).NotEmpty().Length(3, 200);

        RuleFor(x => x.Slug)
            .NotEmpty()
            .Length(3, 200)
            .Matches("^[a-z0-9-]+$")
            .WithMessage("Slug may only contain lowercase letters, numbers and hyphens.");

        RuleFor(x => x.ShortDescription).NotEmpty().Length(10, 500);

        RuleFor(x => x.Description).NotEmpty().Length(20, 5000);

        RuleFor(x => x.StartDate)
            .LessThanOrEqualTo(x => x.EndDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("End date must be after start date.");

        RuleFor(x => x.Budget).GreaterThanOrEqualTo(0).When(x => x.Budget.HasValue);

        RuleForEach(x => x.Tags).MaximumLength(50).When(x => x.Tags != null);

        RuleForEach(x => x.TechStack).MaximumLength(50).When(x => x.TechStack != null);
    }
}
