#!/bin/bash
echo "======================================"
echo " Killing running browsers..."
echo "======================================"

# Use Windows taskkill commands (Git Bash on Windows)
cmd //c "taskkill /F /IM chrome.exe /T 2>nul"
cmd //c "taskkill /F /IM msedge.exe /T 2>nul"
cmd //c "taskkill /F /IM edge.exe /T 2>nul"
cmd //c "taskkill /F /IM firefox.exe /T 2>nul"
cmd //c "taskkill /F /IM chromium.exe /T 2>nul"

echo ""
echo "✅ Browsers closed successfully."
echo "--------------------------------------"
