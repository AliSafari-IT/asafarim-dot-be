namespace TestAutomation.Api.DTOs;

public class CreateTestSuiteDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid FixtureId { get; set; }
    public int ExecutionOrder { get; set; }
    public bool IsActive { get; set; }
}

public class UpdateTestSuiteDto : CreateTestSuiteDto
{
    public Guid Id { get; set; }
}
