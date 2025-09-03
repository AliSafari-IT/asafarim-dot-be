using System;
using System.IO;
using System.Threading.Tasks;
using Ai.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Ai.Api
{
    public class UpdateDatabase
    {
        public static async Task Main(string[] args)
        {
            Console.WriteLine("Starting database migration...");

            try
            {
                // Build configuration
                var configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json")
                    .AddJsonFile(
                        $"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"}.json",
                        optional: true
                    )
                    .Build();

                // Setup services
                var services = new ServiceCollection();

                // Get connection string
                var connectionString = configuration.GetConnectionString("SharedConnection");
                Console.WriteLine($"Using connection string: {connectionString}");

                // Add DbContext
                services.AddDbContext<SharedDbContext>(options =>
                    options.UseNpgsql(connectionString)
                );

                // Build service provider
                var serviceProvider = services.BuildServiceProvider();

                // Get DbContext
                using var dbContext = serviceProvider.GetRequiredService<SharedDbContext>();

                // Apply migrations
                Console.WriteLine("Applying migrations...");
                await dbContext.Database.MigrateAsync();

                Console.WriteLine("Database migration completed successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during migration: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }
        }
    }
}
