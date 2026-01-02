using Ganss.Xss;

namespace SmartPath.Api.Services.ContentSanitization;

public interface IHtmlContentSanitizer
{
    string SanitizeArticleHtml(string html);
    void ValidateContentSize(string? json, string? html, string fieldName);
}

public class HtmlContentSanitizer : IHtmlContentSanitizer
{
    private const int MaxContentSizeBytes = 200 * 1024; // 200KB
    private readonly ILogger<HtmlContentSanitizer> _logger;
    private readonly HtmlSanitizer _sanitizer;

    public HtmlContentSanitizer(ILogger<HtmlContentSanitizer> logger)
    {
        _logger = logger;
        _sanitizer = new HtmlSanitizer();

        // Configure allowed tags
        _sanitizer.AllowedTags.Clear();
        _sanitizer.AllowedTags.UnionWith(
            new[]
            {
                "p",
                "br",
                "strong",
                "em",
                "u",
                "s",
                "h1",
                "h2",
                "h3",
                "ul",
                "ol",
                "li",
                "blockquote",
                "pre",
                "code",
                "a",
            }
        );

        // Configure allowed attributes
        _sanitizer.AllowedAttributes.Clear();
        _sanitizer.AllowedAttributes.Add("href");

        // Configure allowed URI schemes
        _sanitizer.AllowedSchemes.Clear();
        _sanitizer.AllowedSchemes.UnionWith(new[] { "http", "https", "mailto" });

        // Remove img, style, scripts, iframes
        _sanitizer.AllowedTags.Remove("img");
        _sanitizer.AllowedTags.Remove("style");
        _sanitizer.AllowedTags.Remove("script");
        _sanitizer.AllowedTags.Remove("iframe");
    }

    public string SanitizeArticleHtml(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return string.Empty;

        try
        {
            var sanitized = _sanitizer.Sanitize(html);
            _logger.LogDebug(
                "HTML sanitized successfully. Original length: {OriginalLength}, Sanitized length: {SanitizedLength}",
                html.Length,
                sanitized.Length
            );
            return sanitized;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sanitizing HTML content");
            throw;
        }
    }

    public void ValidateContentSize(string? json, string? html, string fieldName)
    {
        if (
            !string.IsNullOrEmpty(json)
            && System.Text.Encoding.UTF8.GetByteCount(json) > MaxContentSizeBytes
        )
        {
            throw new InvalidOperationException(
                $"Field '{fieldName}' JSON content exceeds maximum size of 200KB"
            );
        }

        if (
            !string.IsNullOrEmpty(html)
            && System.Text.Encoding.UTF8.GetByteCount(html) > MaxContentSizeBytes
        )
        {
            throw new InvalidOperationException(
                $"Field '{fieldName}' HTML content exceeds maximum size of 200KB"
            );
        }
    }
}
