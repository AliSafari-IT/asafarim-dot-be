namespace SmartOps.Api.Models;

/// <summary>
/// Device operational status enum
/// </summary>
public enum DeviceStatus
{
    Offline = 0,
    Online = 1,
    Idle = 2,
    Running = 3,
    Error = 4,
    Maintenance = 5
}
