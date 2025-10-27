#!/bin/bash
# exit on error
set -e

# Get the root directory (parent of showcases)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# first rebuild share ui and i18n packages
pnpm --filter @asafarim/shared-ui-react run build
pnpm --filter @asafarim/shared-i18n run build

# build all api projects: identity, core,ai, taskmanagement
pnpm --filter @asafarim/identity-api run build
pnpm --filter @asafarim/core-api run build
pnpm --filter @asafarim/ai-api run build
pnpm --filter @asafarim/taskmanagement-api run build

# kill all dotnet processes (Windows compatible)
# Try multiple methods to kill dotnet processes
taskkill /f /im dotnet.exe /t 2>/dev/null || true
taskkill /f /im "Identity.Api.exe" /t 2>/dev/null || true
taskkill /f /im "Core.Api.exe" /t 2>/dev/null || true
taskkill /f /im "Ai.Api.exe" /t 2>/dev/null || true
taskkill /f /im "TaskManagement.Api.exe" /t 2>/dev/null || true
# Also try PowerShell if available
powershell -Command "Get-Process | Where-Object {$_.ProcessName -like '*dotnet*' -or $_.ProcessName -like '*Identity*' -or $_.ProcessName -like '*Core*' -or $_.ProcessName -like '*Ai*'} | Stop-Process -Force -ErrorAction SilentlyContinue" 2>/dev/null || true

# start all api projects: identity, core,ai, taskmanagement
(cd "$ROOT_DIR/apis/Identity.Api" && dotnet run watch) &
IDENTITY_API_PID=$!

(cd "$ROOT_DIR/apis/Core.Api" && dotnet run watch) &
CORE_API_PID=$!

(cd "$ROOT_DIR/apis/Ai.Api" && dotnet run watch) &
AI_API_PID=$!

(cd "$ROOT_DIR/showcases/TaskManagement/TaskManagement.Api" && dotnet run watch) &
TASKMANAGEMENT_API_PID=$!

# start frontend apps: identity-portal, web, taskmanagement-web
echo "Starting identity-portal..."
(cd "$ROOT_DIR/apps/identity-portal" && pnpm dev) &
IDENTITY_PORTAL_PID=$!

echo "Starting web app..."
(cd "$ROOT_DIR/apps/web" && pnpm dev) &
WEB_PID=$!

echo "Starting taskmanagement-web..."
(cd "$ROOT_DIR/showcases/TaskManagement/taskmanagement-web" && pnpm dev) &
TASKMANAGEMENT_WEB_PID=$!

# Wait for all processes
echo "Identity API PID: $IDENTITY_API_PID"
echo "Identity Portal PID: $IDENTITY_PORTAL_PID"
echo "Web App PID: $WEB_PID"

echo "Core API PID: $CORE_API_PID"
echo "AI API PID: $AI_API_PID"
echo "TaskManagement API PID: $TASKMANAGEMENT_API_PID"
echo "TaskManagement Web App PID: $TASKMANAGEMENT_WEB_PID"
echo "All services are running. Press Ctrl+C to stop."

# Windows-compatible cleanup function
cleanup() {
    echo "Stopping all services..."
    # Kill all dotnet processes
    taskkill /f /im dotnet.exe /t 2>/dev/null || true
    taskkill /f /im "Identity.Api.exe" /t 2>/dev/null || true
    taskkill /f /im "Core.Api.exe" /t 2>/dev/null || true
    taskkill /f /im "Ai.Api.exe" /t 2>/dev/null || true
    taskkill /f /im "TaskManagement.Api.exe" /t 2>/dev/null || true

    # Kill frontend processes
    taskkill /f /im node.exe /t 2>/dev/null || true
    taskkill /f /im "vite.exe" /t 2>/dev/null || true

    # Also try PowerShell cleanup
    powershell -Command "Get-Process | Where-Object {\$_.ProcessName -like '*dotnet*' -or \$_.ProcessName -like '*node*' -or \$_.ProcessName -like '*Identity*' -or \$_.ProcessName -like '*Core*' -or \$_.ProcessName -like '*Ai*'} | Stop-Process -Force -ErrorAction SilentlyContinue" 2>/dev/null || true

    exit 0
}

# Windows-compatible wait mechanism
# Since Windows doesn't have the same signal handling, we'll use a simple loop
echo "All services are running. Press Ctrl+C to stop."

# Set up basic signal handling for Windows (fallback)
trap cleanup INT TERM

# Wait for any key press or process termination
while true; do
    # Check if processes are still running (basic health check)
    if ! tasklist | findstr /i "dotnet\|node\|Identity.Api\|Core.Api\|Ai.Api\|TaskManagement.Api" > /dev/null 2>&1; then
        echo "Some processes have stopped. Exiting..."
        cleanup
    fi

    # Sleep for 5 seconds before checking again
    sleep 5
done