using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;

namespace Ai.Api.Extensions
{
    public static class MigrationExtensions
    {
        public static IHost MigrateDatabase<T>(this IHost host) where T : DbContext
        {
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var db = services.GetRequiredService<T>();
                    db.Database.Migrate();
                    
                    var logger = services.GetRequiredService<ILogger<T>>();
                    logger.LogInformation("Database migration completed successfully");
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<T>>();
                    logger.LogError(ex, "An error occurred while migrating the database");
                }
            }
            return host;
        }
    }
}
