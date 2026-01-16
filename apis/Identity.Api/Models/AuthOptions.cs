using Identity.Api.Models.Common;

namespace Identity.Api.Models;

public class AuthOptions : BaseEntity
{
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;
    public string Key { get; set; } = default!; // symmetric key for dev
    public string CookieDomain { get; set; } = ".asafarim.local";
    public int AccessMinutes { get; set; } = 240; // 4 hours for development
    public int RefreshDays { get; set; } = 30;
    public PasswordSetupOptions? PasswordSetup { get; set; }
}

public class PasswordSetupOptions
{
    public string BaseUrl { get; set; } = "http://localhost:5177";
}
