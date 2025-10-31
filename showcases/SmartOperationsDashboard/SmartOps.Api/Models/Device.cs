namespace SmartOps.Api.Models;

/// <summary>
/// Device entity - represents a physical device in the system
/// </summary>
public class Device
{
    public Guid Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DeviceStatus Status { get; set; } = DeviceStatus.Offline;
    public string? Description { get; set; }
    public DateTime? LastSeen { get; set; }

    
    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid CreatedBy { get; set; }
    
    // Navigation
    public ICollection<Reading> Readings { get; set; } = new List<Reading>();
}
