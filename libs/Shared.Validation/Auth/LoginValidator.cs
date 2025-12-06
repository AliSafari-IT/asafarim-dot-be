using FluentValidation;

// using ASafariM.Application.Auth.Dtos; // adjust

namespace ASafariM.Shared.Validation.Auth;

public class LoginValidator : AbstractValidator<LoginDto>
{
    public LoginValidator()
    {
        RuleFor(x => x.EmailOrUsername)
            .NotEmpty()
            .WithMessage("Email or username is required.")
            .MinimumLength(3);

        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
    }
}
