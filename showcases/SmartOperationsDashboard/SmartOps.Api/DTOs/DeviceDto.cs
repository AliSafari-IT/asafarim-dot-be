namespace SmartOps.Api.DTOs;

/// <summary>
/// Device data transfer object for API communication
/// </summary>
public class DeviceDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = "Offline";
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid CreatedBy { get; set; }
}

/// <summary>
/// Create device request DTO
/// </summary>
public class CreateDeviceDto
{
    public string Name { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Offline";
    public string Location { get; set; } = string.Empty;
    public string? Description { get; set; }
}

/// <summary>
/// Update device request DTO
/// </summary>
public class UpdateDeviceDto
{
    public string? Name { get; set; }
    public string SerialNumber { get; set; } = string.Empty;

    public string? Location { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
}

/// <summary>
/// Device filter for querying
/// </summary>
public class DeviceFilterDto
{
    public string? Name { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? Status { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
