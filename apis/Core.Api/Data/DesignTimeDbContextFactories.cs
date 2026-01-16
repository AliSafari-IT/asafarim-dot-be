using System;
using System.IO;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Core.Api.Data;

public class CoreDbContextDesignTimeFactory : IDesignTimeDbContextFactory<CoreDbContext>
{
    public CoreDbContext CreateDbContext(string[] args)
    {
        var connectionString = ResolveConnectionString(
            "CONNECTIONSTRINGS__DEFAULTCONNECTION",
            "ConnectionStrings__DefaultConnection"
        );

        var optionsBuilder = new DbContextOptionsBuilder<CoreDbContext>();
        optionsBuilder.UseNpgsql(
            connectionString,
            npgsqlOptions =>
                npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
        );

        return new CoreDbContext(optionsBuilder.Options);
    }

    private static string ResolveConnectionString(params string[] environmentVariableNames)
    {
        foreach (var name in environmentVariableNames)
        {
            var v = Environment.GetEnvironmentVariable(name);
            if (!string.IsNullOrWhiteSpace(v))
            {
                return v;
            }
        }

        const string envFile = "/etc/asafarim/env";
        if (File.Exists(envFile))
        {
            var text = File.ReadAllText(envFile);
            foreach (var name in environmentVariableNames)
            {
                var pattern = @"^\s*" + Regex.Escape(name) + @"=""(?<v>[^""]+)""\s*$";
                var m = Regex.Match(text, pattern, RegexOptions.Multiline);
                if (m.Success)
                {
                    var v = m.Groups["v"].Value;
                    if (!string.IsNullOrWhiteSpace(v))
                    {
                        return v;
                    }
                }
            }
        }

        throw new InvalidOperationException(
            "Database connection string not found. Set CONNECTIONSTRINGS__DEFAULTCONNECTION (or ConnectionStrings__DefaultConnection) in your environment, or ensure /etc/asafarim/env contains it."
        );
    }
}
