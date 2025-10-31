using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SmartOps.Api.Data;

public class SmartOpsDbContextFactory : IDesignTimeDbContextFactory<SmartOpsDbContext>
{
    public SmartOpsDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<SmartOpsDbContext>();
        
        // Use the same connection string as in Program.cs
        var connectionString = "Host=localhost;Port=5432;Database=smartops;Username=postgres;Password=Ali+123456/";
        
        optionsBuilder.UseNpgsql(
            connectionString,
            npgsqlOptions =>
            {
                npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                npgsqlOptions.MigrationsAssembly("SmartOps.Api");
            }
        );

        return new SmartOpsDbContext(optionsBuilder.Options);
    }
}
