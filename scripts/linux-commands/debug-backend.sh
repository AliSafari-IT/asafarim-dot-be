# Debug backend

# Node.js backend
sudo journalctl -u nodejs-testora.service -f

# .NET backend
sudo journalctl -u dotnet-testora.service -f
sudo journalctl -u dotnet-ai.service -f
sudo journalctl -u dotnet-core.service -f
sudo journalctl -u dotnet-identity.service -f
sudo journalctl -u dotnet-smartops.service -f
sudo journalctl -u dotnet-taskmanagement.service -f

# Check if All TESTORA environment variables now loaded correctly:
sudo cat /proc/$(pgrep -f "node.*testrunner/index.js")/environ | tr '\0' '\n' | grep -E "TESTORA__" | sort

# kill running testcafe instances
pkill -f testcafe

# kill running chrome instances
taskkill /F /IM chrome.exe

# Kill running testcafe and chrome instances
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  taskkill /F /IM chrome.exe /T 2> /dev/null
  taskkill /F /IM chromium.exe /T 2> /dev/null
  taskkill /F /IM testcafe.cmd /T 2> /dev/null
else
  # Linux/Mac
  pkill -f "chrome" || true
  pkill -f "chromium" || true
  pkill -f "testcafe" || true
fi

# For Git Bash on Windows, use this:
cmd //c taskkill /F /IM chrome.exe /T 2>nul
cmd //c taskkill /F /IM firefox.exe /T 2>nul
cmd //c taskkill /F /IM edge.exe /T 2>nul
cmd //c taskkill /F /IM msedge.exe /T 2>nul