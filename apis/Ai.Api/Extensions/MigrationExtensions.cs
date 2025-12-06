using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Shared.Logging;

namespace Ai.Api.Extensions
{
    public static class MigrationExtensions
    {
        public static IHost MigrateDatabase<T>(this IHost host)
            where T : DbContext
        {
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var db = services.GetRequiredService<T>();
                    db.Database.Migrate();

                    SharedLogger.Info("Database migration completed successfully");
                }
                catch (Exception ex)
                {
                    SharedLogger.Error("An error occurred while migrating the database", ex);
                }
            }
            return host;
        }
    }
}
