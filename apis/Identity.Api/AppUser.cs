using System;
using Microsoft.AspNetCore.Identity;

namespace Identity.Api;

public class AppUser : IdentityUser<Guid> 
{ 
    /// <summary>
    /// User's preferred language (ISO 639-1 code: en, nl)
    /// </summary>
    public string PreferredLanguage { get; set; } = "en";
}
