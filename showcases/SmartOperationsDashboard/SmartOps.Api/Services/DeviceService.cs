using Microsoft.EntityFrameworkCore;
using SmartOps.Api.Data;
using SmartOps.Api.DTOs;
using SmartOps.Api.Models;

namespace SmartOps.Api.Services;

/// <summary>
/// Device service implementation
/// </summary>
public class DeviceService : IDeviceService
{
    private readonly SmartOpsDbContext _dbContext;

    public DeviceService(SmartOpsDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<(List<DeviceDto> devices, int total)> GetDevicesAsync(DeviceFilterDto filter)
    {
        var query = _dbContext.Devices.AsQueryable();

        // Filter by status
        if (!string.IsNullOrEmpty(filter.Status))
        {
            if (Enum.TryParse<DeviceStatus>(filter.Status, true, out var status))
            {
                query = query.Where(d => d.Status == status);
            }
        }

        // Filter by location
        if (!string.IsNullOrEmpty(filter.Location))
        {
            query = query.Where(d => d.Location.Contains(filter.Location));
        }

        var total = await query.CountAsync();

        var devices = await query
            .OrderByDescending(d => d.UpdatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(d => new DeviceDto
            {
                Id = d.Id,
                Name = d.Name,
                SerialNumber = d.SerialNumber,
                Location = d.Location,
                Status = d.Status.ToString(),
                Description = d.Description,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                CreatedBy = d.CreatedBy,
            })
            .ToListAsync();

        return (devices, total);
    }

    public async Task<DeviceDto?> GetDeviceByIdAsync(Guid id)
    {
        var device = await _dbContext.Devices.FindAsync(id);
        if (device == null)
            return null;

        return new DeviceDto
        {
            Id = device.Id,
            Name = device.Name,
            SerialNumber = device.SerialNumber,
            Location = device.Location,
            Status = device.Status.ToString(),
            Description = device.Description,
            CreatedAt = device.CreatedAt,
            UpdatedAt = device.UpdatedAt,
            CreatedBy = device.CreatedBy,
        };
    }

    public async Task<DeviceDto> CreateDeviceAsync(CreateDeviceDto dto, Guid createdBy)
    {
        // Parse status from DTO, default to Offline if not provided or invalid
        var status = DeviceStatus.Offline;
        if (!string.IsNullOrEmpty(dto.Status))
        {
            if (Enum.TryParse<DeviceStatus>(dto.Status, true, out var parsedStatus))
            {
                status = parsedStatus;
            }
        }

        var device = new Device
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            SerialNumber = dto.SerialNumber,
            Location = dto.Location,
            Description = dto.Description,
            Status = status,
            CreatedBy = createdBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _dbContext.Devices.Add(device);
        await _dbContext.SaveChangesAsync();

        return new DeviceDto
        {
            Id = device.Id,
            Name = device.Name,
            SerialNumber = device.SerialNumber,
            Location = device.Location,
            Status = device.Status.ToString(),
            Description = device.Description,
            CreatedAt = device.CreatedAt,
            UpdatedAt = device.UpdatedAt,
            CreatedBy = device.CreatedBy,
        };
    }

    public async Task<DeviceDto> UpdateDeviceAsync(Guid id, UpdateDeviceDto dto)
    {
        var device = await _dbContext.Devices.FindAsync(id);
        if (device == null)
            throw new KeyNotFoundException($"Device {id} not found");

        if (!string.IsNullOrEmpty(dto.Name))
            device.Name = dto.Name;

        if (!string.IsNullOrEmpty(dto.Location))
            device.Location = dto.Location;

        if (dto.Description != null)
            device.Description = dto.Description;

        if (!string.IsNullOrEmpty(dto.Status))
        {
            if (Enum.TryParse<DeviceStatus>(dto.Status, true, out var status))
                device.Status = status;
        }

        device.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return new DeviceDto
        {
            Id = device.Id,
            Name = device.Name,
            SerialNumber = device.SerialNumber,
            Location = device.Location,
            Status = device.Status.ToString(),
            Description = device.Description,
            CreatedAt = device.CreatedAt,
            UpdatedAt = device.UpdatedAt,
            CreatedBy = device.CreatedBy,
        };
    }

    public async Task DeleteDeviceAsync(Guid id)
    {
        var device = await _dbContext.Devices.FindAsync(id);
        if (device == null)
            throw new KeyNotFoundException($"Device {id} not found");

        _dbContext.Devices.Remove(device);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<object> GetSummaryAsync()
    {
        var totalDevices = await _dbContext.Devices.CountAsync();
        var activeDevices = await _dbContext
            .Devices.Where(d => d.Status == DeviceStatus.Online || d.Status == DeviceStatus.Running)
            .CountAsync();
        var offlineDevices = await _dbContext
            .Devices.Where(d => d.Status == DeviceStatus.Offline)
            .CountAsync();

        var recentReadings = await _dbContext
            .Readings.OrderByDescending(r => r.RecordedAt)
            .Take(10)
            .Select(r => new
            {
                r.Id,
                r.DeviceId,
                r.Temperature,
                r.Humidity,
                r.Pressure,
                r.PowerConsumption,
                r.OperationCount,
                r.RecordedAt,
            })
            .ToListAsync();

        return new
        {
            totalDevices,
            activeDevices,
            offlineDevices,
            recentReadings,
        };
    }
}
