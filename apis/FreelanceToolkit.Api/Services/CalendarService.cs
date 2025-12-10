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

        // Convert to UTC
        var startTimeUtc = dto.StartTime.ToUniversalTime();
        var endTimeUtc = dto.EndTime.ToUniversalTime();

        var booking = _mapper.Map<CalendarBooking>(dto);
        booking.Id = Guid.NewGuid();
        booking.UserId = userId;
        booking.StartTime = startTimeUtc;
        booking.EndTime = endTimeUtc;
        booking.CreatedAt = DateTime.UtcNow;

        // Check for overlaps - allow booking but keep as Pending for review
        if (await HasOverlapAsync(startTimeUtc, endTimeUtc, userId))
        {
            _logger.LogWarning(
                "[CalendarService] Booking {BookingId} overlaps with existing booking - marked as Pending",
                booking.Id
            );
            // Booking will remain in Pending status for manual review
        }

        _context.CalendarBookings.Add(booking);
        await _context.SaveChangesAsync();

        var result = await GetByIdAsync(booking.Id, userId);

        _logger.LogInformation(
            "[CalendarService] Booking {BookingId} created with status {Status}. Email will be sent manually by user.",
            booking.Id,
            booking.Status
        );

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
        Guid? clientId = null,
        string status = "All"
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

        // Apply status filter
        switch (status?.ToLower())
        {
            case "pending":
                _logger.LogInformation(
                    "[CalendarService.GetAllAsync] Filtering by status: Pending"
                );
                query = query.Where(b => b.Status == BookingStatus.Pending);
                break;
            case "confirmed":
                _logger.LogInformation(
                    "[CalendarService.GetAllAsync] Filtering by status: Confirmed"
                );
                query = query.Where(b => b.Status == BookingStatus.Confirmed);
                break;
            case "completed":
                _logger.LogInformation(
                    "[CalendarService.GetAllAsync] Filtering by status: Completed"
                );
                query = query.Where(b => b.Status == BookingStatus.Completed);
                break;
            case "noshow":
                _logger.LogInformation("[CalendarService.GetAllAsync] Filtering by status: NoShow");
                query = query.Where(b => b.Status == BookingStatus.NoShow);
                break;
            case "cancelled":
                _logger.LogInformation(
                    "[CalendarService.GetAllAsync] Filtering by status: Cancelled"
                );
                query = query.Where(b => b.Status == BookingStatus.Cancelled);
                break;
            case "all":
            default:
                _logger.LogInformation(
                    "[CalendarService.GetAllAsync] Filtering by status: All (excluding Cancelled)"
                );
                query = query.Where(b => b.Status != BookingStatus.Cancelled);
                break;
        }

        var bookings = await query.OrderBy(b => b.StartTime).ToListAsync();
        _logger.LogInformation(
            "[CalendarService.GetAllAsync] Returning {Count} bookings for status filter '{Status}'",
            bookings.Count,
            status
        );

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
            _logger.LogWarning(
                "[CalendarService] Booking {BookingId} updated with overlapping time slot. Status set to Pending for review.",
                id
            );
            booking.Status = BookingStatus.Pending;
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
            _logger.LogWarning(
                "[CalendarService] Booking {BookingId} rescheduled to overlapping time slot. Status set to Pending for review.",
                id
            );
            booking.Status = BookingStatus.Pending;
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
