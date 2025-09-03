using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Ai.Api.Data
{
    public class SharedDbContextFactory : IDesignTimeDbContextFactory<SharedDbContext>
    {
        public SharedDbContext CreateDbContext(string[] args)
        {
            // Build configuration from appsettings.json
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddJsonFile(
                    $"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development"}.json",
                    optional: true
                )
                .Build();

            var connectionString = configuration.GetConnectionString("SharedConnection");

            var optionsBuilder = new DbContextOptionsBuilder<SharedDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            return new SharedDbContext(optionsBuilder.Options);
        }
    }
}
