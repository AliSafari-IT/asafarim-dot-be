namespace FreelanceToolkit.Api.DTOs.Calendar;

public class CreateBookingDto
{
    public Guid? ClientId { get; set; }
    public string Title { get; set; } = default!;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Location { get; set; }
    public string? MeetingUrl { get; set; }
    public string? Notes { get; set; }
}
