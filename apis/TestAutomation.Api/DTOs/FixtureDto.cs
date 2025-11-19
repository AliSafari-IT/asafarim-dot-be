using System.Text.Json;

namespace TestAutomation.Api.DTOs;

public class CreateFixtureDto
{
    public Guid FunctionalRequirementId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? PageUrl { get; set; }

    // Shared Imports
    public string? SharedImportsPath { get; set; } // Relative path to shared constants/functions
    public string? SharedImportsContent { get; set; } // Raw TypeScript code to inject

    // Fixture Hooks
    public string? BeforeHook { get; set; }
    public string? AfterHook { get; set; }
    public string? BeforeEachHook { get; set; }
    public string? AfterEachHook { get; set; }

    // Authentication
    public string? HttpAuthUsername { get; set; }
    public string? HttpAuthPassword { get; set; }

    // Scripts and Hooks
    public string? ClientScripts { get; set; }
    public string? RequestHooks { get; set; }
    public string? Metadata { get; set; }
    public JsonDocument? SetupScript { get; set; }
    public JsonDocument? TeardownScript { get; set; }
}

public class UpdateFixtureDto : CreateFixtureDto
{
    public Guid Id { get; set; }
}
