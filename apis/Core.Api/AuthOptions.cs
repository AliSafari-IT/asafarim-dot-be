namespace Core.Api;

public sealed class AuthOptions
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int AccessMinutes { get; set; } = 60;
    public int RefreshDays { get; set; } = 7;
    public string CookieDomain { get; set; } = ".asafarim.local";
}
