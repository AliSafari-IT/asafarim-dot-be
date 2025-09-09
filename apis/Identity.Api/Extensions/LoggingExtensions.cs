using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;
using System;

namespace Identity.Api.Extensions
{
    public static class LoggingExtensions
    {
        public static IHostBuilder ConfigureStructuredLogging(this IHostBuilder hostBuilder)
        {
            return hostBuilder.UseSerilog((context, services, configuration) =>
            {
                var env = context.HostingEnvironment;
                var appName = "Identity.Api";
                
                configuration
                    .MinimumLevel.Information()
                    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                    .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
                    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)
                    .Enrich.FromLogContext()
                    .Enrich.WithProperty("Application", appName)
                    .Enrich.WithProperty("Environment", env.EnvironmentName);

                // Always log to console
                configuration.WriteTo.Console();

                // In production, also log to file with daily rotation
                if (env.IsProduction())
                {
                    var logsPath = Environment.GetEnvironmentVariable("LOGS_PATH") ?? "/var/log/asafarim";
                    configuration.WriteTo.File(
                        $"{logsPath}/{appName}-.log",
                        rollingInterval: RollingInterval.Day,
                        retainedFileCountLimit: 14,
                        fileSizeLimitBytes: 10 * 1024 * 1024, // 10MB
                        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
                    );
                }
            });
        }
    }
}
