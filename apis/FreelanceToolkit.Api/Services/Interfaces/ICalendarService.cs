using FreelanceToolkit.Api.DTOs.Calendar;

namespace FreelanceToolkit.Api.Services.Interfaces;

public interface ICalendarService
{
    Task<BookingResponseDto> CreateAsync(CreateBookingDto dto, string userId);
    Task<BookingResponseDto> GetByIdAsync(Guid id, string userId);
    Task<List<BookingResponseDto>> GetAllAsync(
        string userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        Guid? clientId = null
    );
    Task<BookingResponseDto> UpdateAsync(Guid id, UpdateBookingDto dto, string userId);
    Task DeleteAsync(Guid id, string userId);
    Task<BookingResponseDto> RescheduleAsync(
        Guid id,
        DateTime newStartTime,
        DateTime newEndTime,
        string userId
    );
    Task<BookingResponseDto> CancelAsync(Guid id, string userId);
    Task<BookingResponseDto> CompleteAsync(Guid id, string userId);
    Task<bool> HasOverlapAsync(
        DateTime startTime,
        DateTime endTime,
        string userId,
        Guid? excludeBookingId = null
    );
    Task<List<BookingResponseDto>> GetUpcomingAsync(string userId, int count = 5);
}
