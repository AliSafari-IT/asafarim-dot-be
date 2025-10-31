# PowerShell script to reset the SmartOps database and apply migrations

# Database connection details
$dbHost = "localhost"
$dbPort = 5432
$dbName = "smartops"
$dbUser = "postgres"
$dbPassword = "*YES*"

# Set PGPASSWORD environment variable for non-interactive psql
$env:PGPASSWORD = $dbPassword

Write-Host "Dropping database $dbName..." -ForegroundColor Yellow
psql -h $dbHost -p $dbPort -U $dbUser -c "DROP DATABASE IF EXISTS $dbName;" | Out-Null

Write-Host "Creating database $dbName..." -ForegroundColor Yellow
psql -h $dbHost -p $dbPort -U $dbUser -c "CREATE DATABASE $dbName;" | Out-Null

Write-Host "Database reset complete!" -ForegroundColor Green
Write-Host "Now run: dotnet ef database update" -ForegroundColor Cyan

# Clear PGPASSWORD
Remove-Item env:PGPASSWORD
