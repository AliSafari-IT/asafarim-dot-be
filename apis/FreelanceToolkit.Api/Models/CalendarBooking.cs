namespace FreelanceToolkit.Api.Models;

public enum BookingStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed,
    NoShow,
}

public class CalendarBooking
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public string? MeetingReason { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime? ReminderSentAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public Guid? ClientId { get; set; }
    public Client? Client { get; set; }

    // Foreign key - references user ID from Identity.Api
    public string UserId { get; set; } = string.Empty;
}
