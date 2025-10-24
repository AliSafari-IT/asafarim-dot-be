#!/bin/bash

# Navigate to Identity API and start it
echo "Starting Identity.Api..."
cd ../../apis/Identity.Api
dotnet run watch &
IDENTITY_API_PID=$!
cd ../../showcases/TaskManagement

# Navigate to Identity Portal and start it
echo "Starting identity-portal..."
cd ../../apps/identity-portal
pnpm dev &
IDENTITY_PORTAL_PID=$!
cd ../../showcases/TaskManagement

# Navigate to backend and start ASP.NET Core API
echo "Starting TaskManagement.Api..."
cd TaskManagement.Api
dotnet run watch &
BACKEND_PID=$!
cd ..

# Navigate to frontend and start React app
echo "Starting taskmanagement-web..."
cd taskmanagement-web
pnpm dev &
FRONTEND_PID=$!
cd ..

# Wait for all processes
echo "Identity API PID: $IDENTITY_API_PID"
echo "Identity Portal PID: $IDENTITY_PORTAL_PID"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "All services are running. Press Ctrl+C to stop."

# Trap Ctrl+C to kill all processes
trap "kill $IDENTITY_API_PID $IDENTITY_PORTAL_PID $BACKEND_PID $FRONTEND_PID" SIGINT

wait