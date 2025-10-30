namespace SmartOps.Api.Models;

/// <summary>
/// Reading entity - represents a metric reading from a device at a point in time
/// </summary>
public class Reading
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }

    // Metric data
    public double Temperature { get; set; }
    public double Humidity { get; set; }
    public double Pressure { get; set; }
    public double PowerConsumption { get; set; }
    public int OperationCount { get; set; }

    // Timestamp
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

    // Navigation
    public Device? Device { get; set; }
}
