@echo off
REM Batch script to reset the SmartOps database

setlocal enabledelayedexpansion

set PGPASSWORD=*YES*

echo Dropping database smartops...
psql -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS smartops;" >nul 2>&1

echo Creating database smartops...
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE smartops;" >nul 2>&1

echo.
echo Database reset complete!
echo.
echo Next, run: dotnet ef database update
echo.

endlocal
