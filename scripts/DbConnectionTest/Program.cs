using System;
using System.Threading.Tasks;
using Npgsql;

class Program
{
    static async Task Main()
    {
        // Connection strings from your appsettings.json files
        string[] connectionStrings = new[]
        {
            "Host=localhost;Port=5432;Database=asafarim;Username=postgres;Password=Ali+123456/",
            "Host=localhost;Port=5432;Database=jobs;Username=postgres;Password=Ali+123456/",
            "Host=localhost;Port=5432;Database=shared_db;Username=postgres;Password=Ali+123456/"
        };

        string[] dbNames = new[] { "asafarim", "jobs", "shared_db" };

        for (int i = 0; i < connectionStrings.Length; i++)
        {
            Console.WriteLine($"Testing connection to {dbNames[i]} database...");
            
            try
            {
                using var connection = new NpgsqlConnection(connectionStrings[i]);
                await connection.OpenAsync();
                
                // Execute a simple query
                using var cmd = new NpgsqlCommand("SELECT current_database(), current_user, version();", connection);
                using var reader = await cmd.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    Console.WriteLine($"Successfully connected to database: {reader.GetString(0)}");
                    Console.WriteLine($"Current user: {reader.GetString(1)}");
                    Console.WriteLine($"PostgreSQL version: {reader.GetString(2)}");
                }
                
                Console.WriteLine("Connection test successful!");
                Console.WriteLine();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error connecting to {dbNames[i]} database: {ex.Message}");
                Console.WriteLine();
            }
        }
    }
}
