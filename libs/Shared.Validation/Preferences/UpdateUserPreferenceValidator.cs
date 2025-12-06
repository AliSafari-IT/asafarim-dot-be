using FluentValidation;

// using ASafariM.Application.Preferences.Dtos; // adjust

namespace ASafariM.Shared.Validation.Preferences;

public class UpdateUserPreferenceValidator : AbstractValidator<UpdateUserPreferenceDto>
{
    public UpdateUserPreferenceValidator()
    {
        RuleFor(x => x.ItemsPerPage).InclusiveBetween(5, 100).When(x => x.ItemsPerPage.HasValue);

        RuleFor(x => x.NotificationFrequencyInHours)
            .InclusiveBetween(1, 24 * 7)
            .When(x => x.NotificationFrequencyInHours.HasValue);

        RuleFor(x => x.FontSize).InclusiveBetween(10, 32).When(x => x.FontSize.HasValue);

        RuleFor(x => x.TextScalingFactor)
            .InclusiveBetween(0.5m, 3m)
            .When(x => x.TextScalingFactor.HasValue);
    }
}
