-- Check EF Core migration history
SELECT 
    "MigrationId",
    "ProductVersion"
FROM 
    "__EFMigrationsHistory"
WHERE 
    "MigrationId" LIKE '%SocialLink%'
ORDER BY 
    "MigrationId" DESC;

-- Show all recent migrations
SELECT 
    "MigrationId",
    "ProductVersion"
FROM 
    "__EFMigrationsHistory"
ORDER BY 
    "MigrationId" DESC
LIMIT 10;
