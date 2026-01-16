# Drop and recreate the asafarim database
$pgUser = "postgres"
$pgPassword = "Ali+123456/"
$pgHost = "localhost"
$dbName = "asafarim"

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $pgPassword

# Drop the database if it exists
Write-Host "Dropping database $dbName..."
psql -U $pgUser -h $pgHost -c "DROP DATABASE IF EXISTS $dbName;"

# Create a new database
Write-Host "Creating database $dbName..."
psql -U $pgUser -h $pgHost -c "CREATE DATABASE $dbName;"

Write-Host "Database recreated successfully!"

# Clear the password from environment
Remove-Item env:PGPASSWORD
