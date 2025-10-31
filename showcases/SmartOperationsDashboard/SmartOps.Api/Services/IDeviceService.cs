using SmartOps.Api.DTOs;

namespace SmartOps.Api.Services;

/// <summary>
/// Device service for CRUD operations
/// </summary>
public interface IDeviceService
{
    /// <summary>
    /// Get all devices with optional filtering
    /// </summary>
    Task<(List<DeviceDto> devices, int total)> GetDevicesAsync(DeviceFilterDto filter);

    /// <summary>
    /// Get device by ID
    /// </summary>
    Task<DeviceDto?> GetDeviceByIdAsync(Guid id);

    /// <summary>
    /// Create new device
    /// </summary>
    Task<DeviceDto> CreateDeviceAsync(CreateDeviceDto dto, Guid createdBy);

    /// <summary>
    /// Update device
    /// </summary>
    Task<DeviceDto> UpdateDeviceAsync(Guid id, UpdateDeviceDto dto);

    /// <summary>
    /// Delete device
    /// </summary>
    Task DeleteDeviceAsync(Guid id);

    /// <summary>
    /// Get device summary (counts and recent readings)
    /// </summary>
    Task<object> GetSummaryAsync();
}
