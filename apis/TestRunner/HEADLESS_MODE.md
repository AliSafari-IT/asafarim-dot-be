# TestCafe Headless Mode Configuration

## Overview
The TestRunner now supports forced headless mode for production environments where GUI browsers are not available or desired.

## Environment Variables

### `.env.production`
```env
PORT=4000
NODE_ENV=production
API_URL=http://127.0.0.1:5106
API_KEY=test-runner-api-key-2024
LOG_LEVEL=info
FORCE_HEADLESS=true
BROWSER=chrome:headless
```

### `.env` (Development)
```env
PORT=4000
API_KEY=test-runner-api-key-2024
API_URL=http://localhost:5106
# FORCE_HEADLESS is NOT set - allows both headed and headless browsers
```

## How It Works

### Production Mode (`FORCE_HEADLESS=true`)
When `FORCE_HEADLESS=true` is set:
1. **Only headless browsers** are used
2. Chrome runs with additional flags: `--no-sandbox --disable-dev-shm-usage`
3. Browser candidates (in order):
   - `chrome:headless --no-sandbox --disable-dev-shm-usage`
   - `chrome:headless`
   - `firefox:headless`

### Development Mode (default)
When `FORCE_HEADLESS` is not set or false:
1. **Both headed and headless browsers** are tried
2. Browser candidates (Windows):
   - `edge`
   - `edge:headless`
   - `chrome`
   - `chrome:headless`
   - `firefox`
   - `firefox:headless`

## Chrome Flags Explained

- `--no-sandbox`: Required when running Chrome as root or in containerized environments
- `--disable-dev-shm-usage`: Prevents Chrome from using /dev/shm (shared memory), useful in Docker/limited memory environments

## Deployment

### On Production Server
1. Ensure `.env.production` has `FORCE_HEADLESS=true`
2. Install Chrome/Chromium headless:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install chromium-browser
   
   # Or Google Chrome
   wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
   sudo dpkg -i google-chrome-stable_current_amd64.deb
   ```
3. Restart TestRunner service:
   ```bash
   sudo systemctl restart testrunner
   ```

### Verify Headless Mode
Check logs for:
```
🎭 Force headless mode enabled
🔄 Attempting browser: chrome:headless --no-sandbox --disable-dev-shm-usage
```

## Troubleshooting

### Tests hang at "Starting test execution..."
**Cause**: Chrome cannot start in headless mode

**Solutions**:
1. Verify Chrome/Chromium is installed:
   ```bash
   which google-chrome
   which chromium-browser
   ```
2. Test Chrome headless manually:
   ```bash
   google-chrome --headless --no-sandbox --disable-gpu --dump-dom https://example.com
   ```
3. Check TestRunner logs for browser errors
4. Try Firefox as fallback by setting `BROWSER=firefox:headless`

### "Chrome not found" error
**Solution**: Install Chrome or use Chromium:
```bash
# Install Chromium
sudo apt-get install chromium-browser

# Update BROWSER env var
BROWSER=chromium:headless
```

### Permission errors
**Solution**: Ensure TestRunner user has permissions:
```bash
sudo chown -R testrunner:testrunner /path/to/testrunner
```

## Testing

### Test Headless Mode Locally
1. Set environment variable:
   ```bash
   export FORCE_HEADLESS=true
   ```
2. Run TestRunner:
   ```bash
   pnpm api
   ```
3. Run a test suite and verify it uses headless Chrome

### Test in Docker
```dockerfile
FROM node:18

# Install Chrome
RUN apt-get update && apt-get install -y \
    chromium \
    && rm -rf /var/lib/apt/lists/*

ENV FORCE_HEADLESS=true
ENV BROWSER=chromium:headless

# ... rest of Dockerfile
```

## Performance Notes

- Headless browsers are **faster** than headed browsers
- Use less memory and CPU
- No display server (X11/Wayland) required
- Ideal for CI/CD pipelines and production servers
