using FluentValidation;
using FreelanceToolkit.Api.DTOs.Client;

namespace FreelanceToolkit.Api.Validators.Client;

public class UpdateClientDtoValidator : AbstractValidator<UpdateClientDto>
{
    public UpdateClientDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Client name is required")
            .MaximumLength(200)
            .WithMessage("Client name cannot exceed 200 characters");

        RuleFor(x => x.Email)
            .EmailAddress()
            .WithMessage("Invalid email format")
            .MaximumLength(255)
            .WithMessage("Email cannot exceed 255 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Phone)
            .MaximumLength(50)
            .WithMessage("Phone cannot exceed 50 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Phone));

        RuleFor(x => x.Company)
            .MaximumLength(200)
            .WithMessage("Company name cannot exceed 200 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Company));

        RuleFor(x => x.Address)
            .MaximumLength(500)
            .WithMessage("Address cannot exceed 500 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Address));

        RuleFor(x => x.City)
            .MaximumLength(100)
            .WithMessage("City cannot exceed 100 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.City));

        RuleFor(x => x.State)
            .MaximumLength(100)
            .WithMessage("State cannot exceed 100 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.State));

        RuleFor(x => x.ZipCode)
            .MaximumLength(20)
            .WithMessage("Zip code cannot exceed 20 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.ZipCode));

        RuleFor(x => x.Country)
            .MaximumLength(100)
            .WithMessage("Country cannot exceed 100 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Country));

        RuleFor(x => x.TaxId)
            .MaximumLength(50)
            .WithMessage("Tax ID cannot exceed 50 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.TaxId));

        RuleFor(x => x.Notes)
            .MaximumLength(2000)
            .WithMessage("Notes cannot exceed 2000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Notes));

        RuleFor(x => x.Tags)
            .Must(tags => tags == null || tags.Count <= 20)
            .WithMessage("Cannot have more than 20 tags")
            .Must(tags => tags == null || tags.All(t => t.Length <= 50))
            .WithMessage("Each tag cannot exceed 50 characters");
    }
}
