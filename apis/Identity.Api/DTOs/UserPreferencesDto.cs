using System.ComponentModel.DataAnnotations;

namespace Identity.Api.DTOs;

public class UserPreferencesDto
{
    [Required]
    [RegularExpression("^(en|nl|fr|de|es|it|pt|ru|zh|ja|ko|fa)$", ErrorMessage = "Language must be 'en', 'nl', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'zh', 'ja', 'ko' or 'fa'")]
    public string PreferredLanguage { get; set; } = "en";
}

public class UserPreferencesResponse
{
    public string PreferredLanguage { get; set; } = "en";
}
