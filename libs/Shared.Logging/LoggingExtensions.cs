using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Context;
using Serilog.Events;
using Serilog.Formatting.Json;

namespace Shared.Logging;

public static class LoggingExtensions
{
    /// <summary>
    /// Configure Serilog with shared defaults.
    /// Call this early in Program.cs.
    /// </summary>
    public static WebApplicationBuilder AddSharedSerilog(
        this WebApplicationBuilder builder,
        string appName)
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("System", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            .Enrich.WithEnvironmentName()
            .Enrich.WithMachineName()
            .Enrich.WithProperty("Application", appName)
            .ReadFrom.Configuration(builder.Configuration)
            .WriteTo.Console(new JsonFormatter())
            .CreateLogger();

        builder.Host.UseSerilog();

        return builder;
    }

    /// <summary>
    /// Adds correlation-id + basic Serilog request logging.
    /// </summary>
    public static IApplicationBuilder UseRequestLoggingWithCorrelation(this IApplicationBuilder app)
    {
        app.Use(async (context, next) =>
        {
            var correlationId =
                context.Request.Headers["X-Correlation-Id"].FirstOrDefault()
                ?? Guid.NewGuid().ToString("N");

            context.Response.Headers["X-Correlation-Id"] = correlationId;

            var userId = context.User?.Identity?.IsAuthenticated == true
                ? context.User.Identity!.Name
                : "anonymous";

            using (LogContext.PushProperty("CorrelationId", correlationId))
            using (LogContext.PushProperty("UserId", userId!))
            {
                await next();
            }
        });

        app.UseSerilogRequestLogging(); // nice per-request info

        return app;
    }
}
