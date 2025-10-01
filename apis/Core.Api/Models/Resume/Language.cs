namespace Core.Api.Models.Resume;

public enum LanguageLevel
{
    Basic,
    Intermediate,
    Fluent,
    Native
}

public class Language
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }

    public string Name { get; set; } = string.Empty;
    public LanguageLevel Level { get; set; }

    public Resume? Resume { get; set; }
}
