using AutoMapper;
using FreelanceToolkit.Api.Data;
using FreelanceToolkit.Api.DTOs.Calendar;
using FreelanceToolkit.Api.Models;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FreelanceToolkit.Api.Services;

public class CalendarService : ICalendarService
{
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IEmailService _emailService;
    private readonly ILogger<CalendarService> _logger;

    public CalendarService(
        ApplicationDbContext context,
        IMapper mapper,
        IEmailService emailService,
        ILogger<CalendarService> logger
    )
    {
        _context = context;
        _mapper = mapper;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<BookingResponseDto> CreateAsync(CreateBookingDto dto, string userId)
    {
        // Verify client if provided
        if (dto.ClientId.HasValue)
        {
            var clientExists = await _context.Clients.AnyAsync(c =>
                c.Id == dto.ClientId.Value && c.UserId == userId
            );

            if (!clientExists)
                throw new KeyNotFoundException($"Client with ID {dto.ClientId.Value} not found");
        }

        // Check for overlaps
        if (await HasOverlapAsync(dto.StartTime, dto.EndTime, userId))
        {
            throw new InvalidOperationException("This time slot overlaps with an existing booking");
        }

        var booking = _mapper.Map<CalendarBooking>(dto);
        booking.Id = Guid.NewGuid();
        booking.UserId = userId;
        booking.CreatedAt = DateTime.UtcNow;

        _context.CalendarBookings.Add(booking);
        await _context.SaveChangesAsync();

        var result = await GetByIdAsync(booking.Id, userId);

        // Send confirmation email if client email is provided
        if (!string.IsNullOrWhiteSpace(result.ClientEmail))
        {
            booking.DeliveryStatus = EmailDeliveryStatus.Pending;
            booking.LastAttemptAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "[CalendarService] Sending booking confirmation for {BookingId} to {ClientEmail}",
                booking.Id,
                result.ClientEmail
            );

            try
            {
                await _emailService.SendBookingConfirmationAsync(
                    result.Title,
                    result.ClientName ?? "Client",
                    result.StartTime,
                    result.EndTime,
                    result.Location,
                    result.MeetingUrl,
                    result.Description,
                    result.ClientEmail
                );

                booking.DeliveryStatus = EmailDeliveryStatus.Sent;
                booking.LastAttemptAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation(
                    "[CalendarService] Booking confirmation sent successfully for {BookingId}",
                    booking.Id
                );
            }
            catch (Exception ex)
            {
                booking.DeliveryStatus = EmailDeliveryStatus.Failed;
                booking.LastAttemptAt = DateTime.UtcNow;
                booking.RetryCount++;
                await _context.SaveChangesAsync();

                _logger.LogError(
                    ex,
                    "[CalendarService] Failed to send booking confirmation for {BookingId}: {ErrorMessage}",
                    booking.Id,
                    ex.Message
                );
            }
        }

        return result;
    }

    public async Task<BookingResponseDto> GetByIdAsync(Guid id, string userId)
    {
        var booking = await _context
            .CalendarBookings.Include(b => b.Client)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {id} not found");

        return _mapper.Map<BookingResponseDto>(booking);
    }

    public async Task<List<BookingResponseDto>> GetAllAsync(
        string userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        Guid? clientId = null
    )
    {
        var query = _context.CalendarBookings.Include(b => b.Client).Where(b => b.UserId == userId);

        if (startDate.HasValue)
        {
            query = query.Where(b => b.StartTime >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(b => b.EndTime <= endDate.Value);
        }

        if (clientId.HasValue)
        {
            query = query.Where(b => b.ClientId == clientId.Value);
        }

        var bookings = await query.OrderBy(b => b.StartTime).ToListAsync();

        return _mapper.Map<List<BookingResponseDto>>(bookings);
    }

    public async Task<BookingResponseDto> UpdateAsync(Guid id, UpdateBookingDto dto, string userId)
    {
        var booking = await _context
            .CalendarBookings.Include(b => b.Client)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {id} not found");

        // Check for overlaps (excluding this booking)
        if (await HasOverlapAsync(dto.StartTime, dto.EndTime, userId, id))
        {
            throw new InvalidOperationException("This time slot overlaps with an existing booking");
        }

        _mapper.Map(dto, booking);
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<BookingResponseDto>(booking);
    }

    public async Task DeleteAsync(Guid id, string userId)
    {
        var booking = await _context.CalendarBookings.FirstOrDefaultAsync(b =>
            b.Id == id && b.UserId == userId
        );

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {id} not found");

        _context.CalendarBookings.Remove(booking);
        await _context.SaveChangesAsync();
    }

    public async Task<BookingResponseDto> RescheduleAsync(
        Guid id,
        DateTime newStartTime,
        DateTime newEndTime,
        string userId
    )
    {
        var booking = await _context
            .CalendarBookings.Include(b => b.Client)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {id} not found");

        if (booking.Status == BookingStatus.Cancelled)
            throw new InvalidOperationException("Cannot reschedule a cancelled booking");

        if (newEndTime <= newStartTime)
            throw new InvalidOperationException("End time must be after start time");

        // Check for overlaps (excluding this booking)
        if (await HasOverlapAsync(newStartTime, newEndTime, userId, id))
        {
            throw new InvalidOperationException("This time slot overlaps with an existing booking");
        }

        booking.StartTime = newStartTime;
        booking.EndTime = newEndTime;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<BookingResponseDto>(booking);
    }

    public async Task<BookingResponseDto> CancelAsync(Guid id, string userId)
    {
        var booking = await _context
            .CalendarBookings.Include(b => b.Client)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {id} not found");

        if (booking.Status == BookingStatus.Completed)
            throw new InvalidOperationException("Cannot cancel a completed booking");

        booking.Status = BookingStatus.Cancelled;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<BookingResponseDto>(booking);
    }

    public async Task<BookingResponseDto> CompleteAsync(Guid id, string userId)
    {
        var booking = await _context
            .CalendarBookings.Include(b => b.Client)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

        if (booking == null)
            throw new KeyNotFoundException($"Booking with ID {id} not found");

        if (booking.Status == BookingStatus.Cancelled)
            throw new InvalidOperationException("Cannot complete a cancelled booking");

        booking.Status = BookingStatus.Completed;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return _mapper.Map<BookingResponseDto>(booking);
    }

    public async Task<bool> HasOverlapAsync(
        DateTime startTime,
        DateTime endTime,
        string userId,
        Guid? excludeBookingId = null
    )
    {
        var query = _context.CalendarBookings.Where(b =>
            b.UserId == userId && b.Status != BookingStatus.Cancelled
        );

        if (excludeBookingId.HasValue)
        {
            query = query.Where(b => b.Id != excludeBookingId.Value);
        }

        var hasOverlap = await query.AnyAsync(b =>
            (startTime >= b.StartTime && startTime < b.EndTime)
            || (endTime > b.StartTime && endTime <= b.EndTime)
            || (startTime <= b.StartTime && endTime >= b.EndTime)
        );

        return hasOverlap;
    }

    public async Task<List<BookingResponseDto>> GetUpcomingAsync(string userId, int count = 5)
    {
        var now = DateTime.UtcNow;

        var bookings = await _context
            .CalendarBookings.Include(b => b.Client)
            .Where(b =>
                b.UserId == userId && b.Status == BookingStatus.Confirmed && b.StartTime > now
            )
            .OrderBy(b => b.StartTime)
            .Take(count)
            .ToListAsync();

        return _mapper.Map<List<BookingResponseDto>>(bookings);
    }
}
