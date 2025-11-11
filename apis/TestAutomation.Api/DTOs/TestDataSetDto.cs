// apis/TestAutomation.Api/DTOs/TestDataSetDto.cs

using System.Text.Json;

namespace TestAutomation.Api.DTOs;

public class CreateTestDataSetDto
{
    public Guid TestCaseId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public JsonDocument? Data { get; set; } // Changed from InputData/ExpectedOutput
    public bool IsActive { get; set; } = true;
}

public class UpdateTestDataSetDto : CreateTestDataSetDto
{
    public Guid Id { get; set; }
}