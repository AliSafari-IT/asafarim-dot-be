using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Identity.Api;

namespace MigrationScript
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Starting database migration...");

            var host = Host.CreateDefaultBuilder(args)
                .ConfigureServices((hostContext, services) =>
                {
                    var configuration = hostContext.Configuration;
                    
                    services.AddDbContext<AppDbContext>(options =>
                        options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
                })
                .Build();

            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var dbContext = services.GetRequiredService<AppDbContext>();
                    Console.WriteLine("Applying migrations...");
                    await dbContext.Database.MigrateAsync();
                    Console.WriteLine("Migrations applied successfully!");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred while applying migrations: {ex.Message}");
                    Console.WriteLine(ex.StackTrace);
                }
            }
        }
    }
}
