# Check database connection and start Identity API
Write-Host "=== Identity API Debug Script ===" -ForegroundColor Yellow

# Check if PostgreSQL is running
try {
    $result = & psql -U postgres -h localhost -c "SELECT 1;" -t
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL is not running" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ PostgreSQL connection failed: $_" -ForegroundColor Red
    exit 1
}

# Check if database exists
Write-Host "`n🔍 Checking database 'asafarim'..." -ForegroundColor Yellow
try {
    $result = & psql -U postgres -h localhost -c "SELECT 1 FROM pg_database WHERE datname='asafarim';" -t
    if ($result.Trim() -eq "1") {
        Write-Host "✅ Database 'asafarim' exists" -ForegroundColor Green
    } else {
        Write-Host "❌ Database 'asafarim' does not exist" -ForegroundColor Red
        Write-Host "Creating database..." -ForegroundColor Yellow
        & psql -U postgres -h localhost -c "CREATE DATABASE asafarim;"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database created" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to create database" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Database check failed: $_" -ForegroundColor Red
    exit 1
}

# Check if AspNetNet tables exist
Write-Host "`n🔍 Checking Identity tables..." -ForegroundColor Yellow
try {
    $tables = & psql -U postgres -h localhost -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'AspNet%';" -t -d asafarim
    $tableCount = [int]$tables.Trim()
    if ($tableCount -gt 0) {
        Write-Host "✅ Found $tableCount Identity tables" -ForegroundColor Green
    } else {
        Write-Host "❌ No Identity tables found" -ForegroundColor Red
        Write-Host "Running migrations..." -ForegroundColor Yellow
        & dotnet ef database update --project apis/Identity.Api
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migrations applied" -ForegroundColor Green
        } else {
            Write-Host "❌ Migration failed" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Table check failed: $_" -ForegroundColor Red
    exit 1
}

# Check if port 5101 is in use
Write-Host "`n🔍 Checking port 5101..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 5101 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️ Port 5101 is in use by PID $($portInUse.OwningProcess)" -ForegroundColor Yellow
    Write-Host "Killing process..." -ForegroundColor Yellow
    Stop-Process -Id $portInUse.OwningProcess -Force
    Start-Sleep -Seconds 2
}

# Start Identity API
Write-Host "`n🚀 Starting Identity API..." -ForegroundColor Yellow
Set-Location apis/Identity.Api
& dotnet run --no-build
