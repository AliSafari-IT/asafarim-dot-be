using SmartOps.Api.DTOs;

namespace SmartOps.Api.Services;

/// <summary>
/// Reading service for metrics data
/// </summary>
public interface IReadingService
{
    /// <summary>
    /// Get readings with optional filtering
    /// </summary>
    Task<(List<ReadingDto> readings, int total)> GetReadingsAsync(ReadingFilterDto filter);
    
    /// <summary>
    /// Get reading by ID
    /// </summary>
    Task<ReadingDto?> GetReadingByIdAsync(Guid id);
    
    /// <summary>
    /// Get latest reading for a device
    /// </summary>
    Task<ReadingDto?> GetLatestReadingAsync(Guid deviceId);
    
    /// <summary>
    /// Create new reading (typically from device)
    /// </summary>
    Task<ReadingDto> CreateReadingAsync(CreateReadingDto dto);
    
    /// <summary>
    /// Get statistics for a device over time period
    /// </summary>
    Task<ReadingStatsDto> GetReadingStatsAsync(Guid deviceId, DateTime startDate, DateTime endDate);
}
