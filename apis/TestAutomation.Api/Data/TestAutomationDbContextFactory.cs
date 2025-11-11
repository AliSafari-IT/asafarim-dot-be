using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace TestAutomation.Api.Data;

public class TestAutomationDbContextFactory : IDesignTimeDbContextFactory<TestAutomationDbContext>
{
    public TestAutomationDbContext CreateDbContext(string[] args)
    {
        // Build config from appsettings.json + environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<TestAutomationDbContext>();
        var connStr = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Database=TestAutomation;Username=postgres;Password=postgres";

        optionsBuilder.UseNpgsql(connStr);
        return new TestAutomationDbContext(optionsBuilder.Options);
    }
}