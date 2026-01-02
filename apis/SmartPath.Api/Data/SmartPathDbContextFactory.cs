using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace SmartPath.Api.Data;

public sealed class SmartPathDbContextFactory : IDesignTimeDbContextFactory<SmartPathDbContext>
{
    public SmartPathDbContext CreateDbContext(string[] args)
    {
        // Use appsettings + env vars at design-time without booting the whole web host.
        var environment =
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connStr =
            config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "No connection string found. Expected ConnectionStrings:DefaultConnection."
            );

        var options = new DbContextOptionsBuilder<SmartPathDbContext>()
            .UseNpgsql(connStr)
            .Options;

        return new SmartPathDbContext(options);
    }
}
