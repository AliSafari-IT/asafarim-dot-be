using System.Security.Claims;
using FreelanceToolkit.Api.DTOs.Calendar;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceToolkit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendarService;
    private readonly IEmailService _emailService;

    public CalendarController(ICalendarService calendarService, IEmailService emailService)
    {
        _calendarService = calendarService;
        _emailService = emailService;
    }

    /// <summary>
    /// Get all bookings with optional date range, client filters, and status filter
    /// </summary>
    [HttpGet("bookings")]
    [ProducesResponseType(typeof(List<BookingResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<BookingResponseDto>>> GetAll(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] Guid? clientId = null,
        [FromQuery] string status = "All"
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var bookings = await _calendarService.GetAllAsync(
            userId,
            startDate,
            endDate,
            clientId,
            status
        );
        return Ok(bookings);
    }

    /// <summary>
    /// Get upcoming bookings
    /// </summary>
    [HttpGet("bookings/upcoming")]
    [ProducesResponseType(typeof(List<BookingResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<BookingResponseDto>>> GetUpcoming([FromQuery] int count = 5)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var bookings = await _calendarService.GetUpcomingAsync(userId, count);
        return Ok(bookings);
    }

    /// <summary>
    /// Get a booking by ID
    /// </summary>
    [HttpGet("bookings/{id}")]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingResponseDto>> GetById(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var booking = await _calendarService.GetByIdAsync(id, userId);
            return Ok(booking);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Booking with ID {id} not found" });
        }
    }

    /// <summary>
    /// Create a new booking
    /// </summary>
    [HttpPost("bookings")]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BookingResponseDto>> Create([FromBody] CreateBookingDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var booking = await _calendarService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing booking
    /// </summary>
    [HttpPut("bookings/{id}")]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingResponseDto>> Update(
        Guid id,
        [FromBody] UpdateBookingDto dto
    )
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var booking = await _calendarService.UpdateAsync(id, dto, userId);
            return Ok(booking);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Booking with ID {id} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a booking
    /// </summary>
    [HttpDelete("bookings/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _calendarService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Booking with ID {id} not found" });
        }
    }

    /// <summary>
    /// Reschedule a booking
    /// </summary>
    [HttpPost("bookings/{id}/reschedule")]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingResponseDto>> Reschedule(
        Guid id,
        [FromBody] RescheduleRequest request
    )
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var booking = await _calendarService.RescheduleAsync(
                id,
                request.NewStartTime,
                request.NewEndTime,
                userId
            );
            return Ok(booking);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Booking with ID {id} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Cancel a booking
    /// </summary>
    [HttpPost("bookings/{id}/cancel")]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingResponseDto>> Cancel(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var booking = await _calendarService.CancelAsync(id, userId);
            return Ok(booking);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Booking with ID {id} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Mark a booking as completed
    /// </summary>
    [HttpPost("bookings/{id}/complete")]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingResponseDto>> Complete(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var booking = await _calendarService.CompleteAsync(id, userId);
            return Ok(booking);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Booking with ID {id} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check for time slot availability
    /// </summary>
    [HttpPost("bookings/check-availability")]
    [ProducesResponseType(typeof(AvailabilityResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<AvailabilityResponse>> CheckAvailability(
        [FromBody] AvailabilityRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var hasOverlap = await _calendarService.HasOverlapAsync(
            request.StartTime,
            request.EndTime,
            userId,
            request.ExcludeBookingId
        );

        return Ok(
            new AvailabilityResponse
            {
                IsAvailable = !hasOverlap,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
            }
        );
    }

    /// <summary>
    /// Send confirmation email for a booking
    /// </summary>
    [HttpPost("bookings/{id}/send-confirmation")]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingResponseDto>> SendConfirmation(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var booking = await _calendarService.GetByIdAsync(id, userId);

            if (string.IsNullOrWhiteSpace(booking.ClientEmail))
                return BadRequest(new { message = "Booking has no client email address" });

            await _emailService.SendBookingConfirmationAsync(
                booking.Title,
                booking.ClientName ?? "Client",
                booking.StartTime,
                booking.EndTime,
                booking.Location,
                booking.MeetingUrl,
                booking.Description,
                booking.ClientEmail
            );

            return Ok(booking);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Booking with ID {id} not found" });
        }
    }

    /// <summary>
    /// Get upcoming bookings for dashboard (limited)
    /// </summary>
    [HttpGet("dashboard/upcoming-bookings")]
    [ProducesResponseType(typeof(List<BookingResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<BookingResponseDto>>> GetDashboardUpcomingBookings(
        [FromQuery] int limit = 5
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var bookings = await _calendarService.GetUpcomingAsync(userId, limit);
        return Ok(bookings);
    }
}

public record RescheduleRequest(DateTime NewStartTime, DateTime NewEndTime);

public record AvailabilityRequest(
    DateTime StartTime,
    DateTime EndTime,
    Guid? ExcludeBookingId = null
);

public record AvailabilityResponse
{
    public bool IsAvailable { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}
