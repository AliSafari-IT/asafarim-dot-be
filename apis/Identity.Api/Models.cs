namespace Identity.Api;

public record RegisterRequest(string Email, string Password, string? UserName);

public record LoginRequest(string Email, string Password);

public record MeResponse(string Id, string? Email, string? UserName);
