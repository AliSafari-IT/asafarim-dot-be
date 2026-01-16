# Build and restart Identity API
Write-Host "=== Building and Restarting Identity API ===" -ForegroundColor Yellow

# Kill any existing process on port 5101
$portInUse = Get-NetTCPConnection -LocalPort 5101 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "🔄 Killing process on port 5101 (PID: $($portInUse.OwningProcess))" -ForegroundColor Yellow
    Stop-Process -Id $portInUse.OwningProcess -Force
    Start-Sleep -Seconds 2
}

# Build the project
Write-Host "🔨 Building Identity.Api..." -ForegroundColor Yellow
Set-Location apis/Identity.Api
& dotnet build --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green

# Start the API
Write-Host "🚀 Starting Identity API..." -ForegroundColor Yellow
& dotnet run --no-build
