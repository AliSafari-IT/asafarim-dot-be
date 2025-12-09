namespace FreelanceToolkit.Api.DTOs.Calendar;

public class UpdateBookingDto
{
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Location { get; set; }
    public string? MeetingUrl { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled
}
