using System.Collections.Concurrent;
using System.Net;

namespace Identity.Api.Middleware;

/// <summary>
/// Simple in-memory rate limiting middleware for authentication endpoints
/// For production, consider using Redis or a distributed cache
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private static readonly ConcurrentDictionary<string, ClientRequestInfo> _clients = new();
    private static readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(5);
    private static DateTime _lastCleanup = DateTime.UtcNow;

    // Rate limit configuration
    private const int MaxRequestsPerMinute = 30;  // Increased for multiple components checking auth
    private const int MaxRequestsPerHour = 300;   // Increased accordingly

    public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Only apply rate limiting to sensitive auth endpoints
        // Exclude /auth/me as it's used frequently for auth checks
        var path = context.Request.Path.Value?.ToLower() ?? "";
        if (!path.Contains("/auth/login") && 
            !path.Contains("/auth/register"))
        {
            await _next(context);
            return;
        }

        var clientId = GetClientIdentifier(context);
        var now = DateTime.UtcNow;

        // Cleanup old entries periodically
        if (now - _lastCleanup > _cleanupInterval)
        {
            CleanupOldEntries();
            _lastCleanup = now;
        }

        // Get or create client info
        var clientInfo = _clients.GetOrAdd(clientId, _ => new ClientRequestInfo());

        bool isRateLimited = false;
        bool isMinuteLimit = false;
        
        lock (clientInfo)
        {
            // Remove requests older than 1 hour
            clientInfo.RequestTimestamps.RemoveAll(t => now - t > TimeSpan.FromHours(1));

            // Count requests in the last minute
            var requestsLastMinute = clientInfo.RequestTimestamps.Count(t => now - t < TimeSpan.FromMinutes(1));
            var requestsLastHour = clientInfo.RequestTimestamps.Count;

            // Check rate limits
            if (requestsLastMinute >= MaxRequestsPerMinute)
            {
                isRateLimited = true;
                isMinuteLimit = true;
            }
            else if (requestsLastHour >= MaxRequestsPerHour)
            {
                isRateLimited = true;
                isMinuteLimit = false;
            }
            else
            {
                // Add current request
                clientInfo.RequestTimestamps.Add(now);
            }
        }

        if (isRateLimited)
        {
            if (isMinuteLimit)
            {
                _logger.LogWarning("Rate limit exceeded (per minute) for client: {ClientId}, Path: {Path}", 
                    clientId, path);
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = "60";
                await context.Response.WriteAsJsonAsync(new 
                { 
                    message = "Too many requests. Please try again in a minute.",
                    retryAfter = 60
                });
            }
            else
            {
                _logger.LogWarning("Rate limit exceeded (per hour) for client: {ClientId}, Path: {Path}", 
                    clientId, path);
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = "3600";
                await context.Response.WriteAsJsonAsync(new 
                { 
                    message = "Too many requests. Please try again later.",
                    retryAfter = 3600
                });
            }
            return;
        }

        await _next(context);
    }

    private string GetClientIdentifier(HttpContext context)
    {
        // Try to get IP from X-Forwarded-For header (behind proxy)
        if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
        {
            var ip = forwardedFor.ToString().Split(',')[0].Trim();
            if (!string.IsNullOrEmpty(ip))
                return ip;
        }

        // Fallback to connection IP
        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private void CleanupOldEntries()
    {
        var now = DateTime.UtcNow;
        var keysToRemove = new List<string>();

        foreach (var kvp in _clients)
        {
            lock (kvp.Value)
            {
                // Remove entries with no recent requests (older than 1 hour)
                if (!kvp.Value.RequestTimestamps.Any() || 
                    kvp.Value.RequestTimestamps.All(t => now - t > TimeSpan.FromHours(1)))
                {
                    keysToRemove.Add(kvp.Key);
                }
            }
        }

        foreach (var key in keysToRemove)
        {
            _clients.TryRemove(key, out _);
        }

        if (keysToRemove.Any())
        {
            _logger.LogInformation("Cleaned up {Count} rate limit entries", keysToRemove.Count);
        }
    }

    private class ClientRequestInfo
    {
        public List<DateTime> RequestTimestamps { get; } = new();
    }
}

/// <summary>
/// Extension method for adding rate limiting middleware
/// </summary>
public static class RateLimitingMiddlewareExtensions
{
    public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RateLimitingMiddleware>();
    }
}
