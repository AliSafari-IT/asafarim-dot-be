using FluentValidation;

// using ASafariM.Application.Posts.Dtos; // adjust

namespace ASafariM.Shared.Validation.Posts;

public class UpdatePostValidator : AbstractValidator<UpdatePostDto>
{
    public UpdatePostValidator()
    {
        Include(new CreatePostValidator());

        RuleFor(x => x.Id).NotEmpty().WithMessage("Id is required.");
    }
}
