using FreelanceToolkit.Api.Models;

namespace FreelanceToolkit.Api.DTOs;

public class CalendarBookingDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int DurationMinutes { get; set; }
    public BookingStatus Status { get; set; }
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public string? MeetingReason { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? ClientId { get; set; }
}

public class CreateBookingDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public int DurationMinutes { get; set; } = 30;
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string? ClientPhone { get; set; }
    public string? MeetingReason { get; set; }
    public Guid? ClientId { get; set; }
}

public class UpdateBookingDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? StartTime { get; set; }
    public int? DurationMinutes { get; set; }
    public string? MeetingLink { get; set; }
    public string? Location { get; set; }
    public BookingStatus? Status { get; set; }
}

public class BookingFilterDto
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public BookingStatus? Status { get; set; }
    public Guid? ClientId { get; set; }
}

public class AvailableSlotDto
{
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int DurationMinutes { get; set; }
}

public class CalendarSettingsDto
{
    public TimeSpan WorkHoursStart { get; set; }
    public TimeSpan WorkHoursEnd { get; set; }
    public List<DayOfWeek> WorkDays { get; set; } = new();
    public int DefaultMeetingDuration { get; set; }
    public int BufferTime { get; set; }
    public int MaxDailyMeetings { get; set; }
}

public class UpdateCalendarSettingsDto
{
    public TimeSpan? WorkHoursStart { get; set; }
    public TimeSpan? WorkHoursEnd { get; set; }
    public List<DayOfWeek>? WorkDays { get; set; }
    public int? DefaultMeetingDuration { get; set; }
    public int? BufferTime { get; set; }
    public int? MaxDailyMeetings { get; set; }
}
