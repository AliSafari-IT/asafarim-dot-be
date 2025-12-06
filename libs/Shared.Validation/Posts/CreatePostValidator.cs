using FluentValidation;

// using ASafariM.Application.Posts.Dtos; // adjust

namespace ASafariM.Shared.Validation.Posts;

public class CreatePostValidator : AbstractValidator<CreatePostDto>
{
    public CreatePostValidator()
    {
        RuleFor(x => x.Title).NotEmpty().Length(5, 200);

        RuleFor(x => x.Slug)
            .NotEmpty()
            .Length(3, 200)
            .Matches("^[a-z0-9-]+$")
            .WithMessage("Slug may only contain lowercase letters, numbers and hyphens.");

        RuleFor(x => x.Content).NotEmpty().MinimumLength(20);

        RuleFor(x => x.Summary).MaximumLength(500).When(x => !string.IsNullOrWhiteSpace(x.Summary));

        RuleFor(x => x.Excerpt).MaximumLength(500).When(x => !string.IsNullOrWhiteSpace(x.Excerpt));

        RuleForEach(x => x.Tags).MaximumLength(50).When(x => x.Tags != null);

        RuleForEach(x => x.Categories).MaximumLength(50).When(x => x.Categories != null);
    }
}
