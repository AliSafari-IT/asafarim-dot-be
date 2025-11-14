# Debug backend

# Node.js backend
sudo journalctl -u nodejs-testora.service -f

# .NET backend
sudo journalctl -u dotnet-testora.service -f


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