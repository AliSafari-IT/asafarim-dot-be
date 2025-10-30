namespace SmartOps.Api.DTOs;

/// <summary>
/// Reading data transfer object
/// </summary>
public class ReadingDto
{
    public Guid Id { get; set; }
    public Guid DeviceId { get; set; }
    public double Temperature { get; set; }
    public double Humidity { get; set; }
    public double Pressure { get; set; }
    public double PowerConsumption { get; set; }
    public int OperationCount { get; set; }
    public DateTime RecordedAt { get; set; }
}

/// <summary>
/// Create reading request DTO
/// </summary>
public class CreateReadingDto
{
    public Guid DeviceId { get; set; }
    public double Temperature { get; set; }
    public double Humidity { get; set; }
    public double Pressure { get; set; }
    public double PowerConsumption { get; set; }
    public int OperationCount { get; set; }
    public DateTime RecordedAt { get; set; }
}

/// <summary>
/// Reading statistics DTO
/// </summary>
public class ReadingStatsDto
{
    public Guid DeviceId { get; set; }
    public double AvgTemperature { get; set; }
    public double AvgHumidity { get; set; }
    public double AvgPressure { get; set; }
    public double TotalPowerConsumption { get; set; }
    public int TotalOperations { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int ReadingCount { get; set; }
}

/// <summary>
/// Reading filter for querying
/// </summary>
public class ReadingFilterDto
{
    public Guid? DeviceId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
