using System.Text.Json;

namespace TestAutomation.Api.DTOs;

public class CreateFixtureDto
{
    public Guid FunctionalRequirementId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? PageUrl { get; set; }
    public JsonDocument? SetupScript { get; set; }
    public JsonDocument? TeardownScript { get; set; }
}

public class UpdateFixtureDto : CreateFixtureDto
{
    public Guid Id { get; set; }
}
