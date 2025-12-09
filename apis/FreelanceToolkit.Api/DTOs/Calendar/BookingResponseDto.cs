namespace FreelanceToolkit.Api.DTOs.Calendar;

public class BookingResponseDto
{
    public Guid Id { get; set; }
    public Guid? ClientId { get; set; }
    public string? ClientName { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int DurationMinutes => (int)(EndTime - StartTime).TotalMinutes;
    public string? Location { get; set; }
    public string? MeetingUrl { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}
