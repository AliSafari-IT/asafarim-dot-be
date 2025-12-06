using FluentValidation;

// using ASafariM.Application.Projects.Dtos; // adjust

namespace ASafariM.Shared.Validation.Projects;

public class UpdateProjectValidator : AbstractValidator<UpdateProjectDto>
{
    public UpdateProjectValidator()
    {
        Include(new CreateProjectValidator());

        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
    }
}
