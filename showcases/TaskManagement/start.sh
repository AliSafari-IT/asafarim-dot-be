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

# Trap Ctrl+C to kill all processes
trap "kill $IDENTITY_API_PID $IDENTITY_PORTAL_PID $WEB_PID $CORE_API_PID $AI_API_PID $TASKMANAGEMENT_API_PID $TASKMANAGEMENT_WEB_PID" SIGINT

wait