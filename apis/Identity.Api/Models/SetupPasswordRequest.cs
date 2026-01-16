namespace Identity.Api.Models;

public class SetupPasswordRequest
{
    public required string UserId { get; set; }
    public required string Password { get; set; }
}
