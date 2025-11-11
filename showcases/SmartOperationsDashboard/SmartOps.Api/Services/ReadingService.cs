using Microsoft.EntityFrameworkCore;
using SmartOps.Api.Data;
using SmartOps.Api.DTOs;
using SmartOps.Api.Models;

namespace SmartOps.Api.Services;

/// <summary>
/// Reading service implementation
/// </summary>
public class ReadingService : IReadingService
{
    private readonly SmartOpsDbContext _dbContext;

    public ReadingService(SmartOpsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<(List<ReadingDto> readings, int total)> GetReadingsAsync(
        ReadingFilterDto filter
    )
    {
        var query = _dbContext.Readings.AsQueryable();

        if (filter.DeviceId.HasValue)
            query = query.Where(r => r.DeviceId == filter.DeviceId.Value);

        if (filter.StartDate.HasValue)
            query = query.Where(r => r.RecordedAt >= filter.StartDate.Value);

        if (filter.EndDate.HasValue)
            query = query.Where(r => r.RecordedAt <= filter.EndDate.Value);

        var total = await query.CountAsync();

        var readings = await query
            .OrderByDescending(r => r.RecordedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(r => new ReadingDto
            {
                Id = r.Id,
                DeviceId = r.DeviceId,
                Temperature = r.Temperature,
                Humidity = r.Humidity,
                Pressure = r.Pressure,
                PowerConsumption = r.PowerConsumption,
                OperationCount = r.OperationCount,
                RecordedAt = r.RecordedAt,
            })
            .ToListAsync();

        return (readings, total);
    }

    public async Task<ReadingDto?> GetReadingByIdAsync(Guid id)
    {
        var reading = await _dbContext.Readings.FindAsync(id);
        if (reading == null)
            return null;

        return new ReadingDto
        {
            Id = reading.Id,
            DeviceId = reading.DeviceId,
            Temperature = reading.Temperature,
            Humidity = reading.Humidity,
            Pressure = reading.Pressure,
            PowerConsumption = reading.PowerConsumption,
            OperationCount = reading.OperationCount,
            RecordedAt = reading.RecordedAt,
        };
    }

    public async Task<ReadingDto?> GetLatestReadingAsync(Guid deviceId)
    {
        var reading = await _dbContext
            .Readings.Where(r => r.DeviceId == deviceId)
            .OrderByDescending(r => r.RecordedAt)
            .FirstOrDefaultAsync();

        if (reading == null)
            return null;

        return new ReadingDto
        {
            Id = reading.Id,
            DeviceId = reading.DeviceId,
            Temperature = reading.Temperature,
            Humidity = reading.Humidity,
            Pressure = reading.Pressure,
            PowerConsumption = reading.PowerConsumption,
            OperationCount = reading.OperationCount,
            RecordedAt = reading.RecordedAt,
        };
    }

    public async Task<ReadingDto> CreateReadingAsync(CreateReadingDto dto)
    {
        // Verify device exists
        var device = await _dbContext.Devices.FindAsync(dto.DeviceId);
        if (device == null)
            throw new KeyNotFoundException($"Device {dto.DeviceId} not found");

        var reading = new Reading
        {
            Id = Guid.NewGuid(),
            DeviceId = dto.DeviceId,
            Temperature = dto.Temperature,
            Humidity = dto.Humidity,
            Pressure = dto.Pressure,
            PowerConsumption = dto.PowerConsumption,
            OperationCount = dto.OperationCount,
            RecordedAt = DateTime.UtcNow,
        };

        _dbContext.Readings.Add(reading);
        await _dbContext.SaveChangesAsync();

        return new ReadingDto
        {
            Id = reading.Id,
            DeviceId = reading.DeviceId,
            Temperature = reading.Temperature,
            Humidity = reading.Humidity,
            Pressure = reading.Pressure,
            PowerConsumption = reading.PowerConsumption,
            OperationCount = reading.OperationCount,
            RecordedAt = reading.RecordedAt,
        };
    }

    public async Task<ReadingStatsDto> GetReadingStatsAsync(
        Guid deviceId,
        DateTime startDate,
        DateTime endDate
    )
    {
        var readings = await _dbContext
            .Readings.Where(r =>
                r.DeviceId == deviceId && r.RecordedAt >= startDate && r.RecordedAt <= endDate
            )
            .ToListAsync();

        if (readings.Count == 0)
            throw new InvalidOperationException(
                $"No readings found for device {deviceId} in the specified period"
            );

        return new ReadingStatsDto
        {
            DeviceId = deviceId,
            AvgTemperature = readings.Average(r => r.Temperature),
            AvgHumidity = readings.Average(r => r.Humidity),
            AvgPressure = readings.Average(r => r.Pressure),
            TotalPowerConsumption = readings.Sum(r => r.PowerConsumption),
            TotalOperations = readings.Sum(r => r.OperationCount),
            StartDate = startDate,
            EndDate = endDate,
            ReadingCount = readings.Count,
        };
    }
}
