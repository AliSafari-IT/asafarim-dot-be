// apis/TestAutomation.Api/DTOs/CreateFunctionalRequirementDto.cs

using System.Text.Json;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.DTOs;

public class CreateFunctionalRequirementDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
