namespace Identity.Api;

public class AuthOptions
{
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;
    public string Key { get; set; } = default!; // symmetric key for dev
    public string CookieDomain { get; set; } = ".asafarim.local";
    public int AccessMinutes { get; set; } = 15;
    public int RefreshDays { get; set; } = 30;
}