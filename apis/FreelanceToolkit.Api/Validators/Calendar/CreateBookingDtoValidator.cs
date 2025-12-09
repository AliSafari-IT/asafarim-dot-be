using FluentValidation;
using FreelanceToolkit.Api.DTOs.Calendar;

namespace FreelanceToolkit.Api.Validators.Calendar;

public class CreateBookingDtoValidator : AbstractValidator<CreateBookingDto>
{
    public CreateBookingDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Booking title is required")
            .MaximumLength(200)
            .WithMessage("Title cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.StartTime)
            .NotEmpty()
            .WithMessage("Start time is required")
            .GreaterThan(DateTime.UtcNow.AddMinutes(-5))
            .WithMessage("Start time cannot be in the past");

        RuleFor(x => x.EndTime)
            .NotEmpty()
            .WithMessage("End time is required")
            .GreaterThan(x => x.StartTime)
            .WithMessage("End time must be after start time");

        RuleFor(x => x)
            .Must(x => (x.EndTime - x.StartTime).TotalHours <= 24)
            .WithMessage("Booking cannot exceed 24 hours");

        RuleFor(x => x.Location)
            .MaximumLength(500)
            .WithMessage("Location cannot exceed 500 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Location));

        RuleFor(x => x.MeetingUrl)
            .MaximumLength(500)
            .WithMessage("Meeting URL cannot exceed 500 characters")
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out _))
            .WithMessage("Meeting URL must be a valid URL")
            .When(x => !string.IsNullOrWhiteSpace(x.MeetingUrl));

        RuleFor(x => x.Notes)
            .MaximumLength(2000)
            .WithMessage("Notes cannot exceed 2000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Notes));
    }
}
