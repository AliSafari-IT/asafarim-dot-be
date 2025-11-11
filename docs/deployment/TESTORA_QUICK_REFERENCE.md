# Testora Production Deployment - Quick Reference

## Architecture Overview

```
testora.asafarim.be (HTTPS)
    ↓
Nginx (reverse proxy)
    ├→ /api/* → http://127.0.0.1:5106 (TestAutomation.Api)
    ├→ /signalr → http://127.0.0.1:5106 (WebSocket)
    └→ /* → /var/www/asafarim-dot-be/apps/test-automation-ui (React SPA)

TestAutomation.Api (port 5106)
    ↓
PostgreSQL (localhost:5432)

TestRunner (port 4000)
    ↓ (internal API calls)
    TestAutomation.Api
```

## Three Services to Deploy

### 1. TestAutomation.Api (.NET Backend)

- **Port**: 5106 (internal only, proxied via nginx)
- **Runtime**: .NET 8
- **Database**: PostgreSQL
- **Service**: `dotnet-testora.service`
- **Logs**: `/var/www/asafarim-dot-be/logs/testora-api-*.txt`

### 2. TestRunner (Node.js Test Executor)

- **Port**: 4000 (internal only)
- **Runtime**: Node.js 18+
- **Service**: `testrunner.service`
- **Logs**: `journalctl -u testrunner`

### 3. test-automation-ui (React Frontend)

- **Port**: 443 (HTTPS via nginx)
- **Build Output**: `/var/www/asafarim-dot-be/apps/test-automation-ui/`
- **Nginx Config**: `/etc/nginx/sites-available/testora.asafarim.be.conf`

---

## Deployment Steps (Summary)

### Step 1: Prepare Server

```bash
# Install dependencies
sudo apt-get update
sudo apt-get install -y postgresql nodejs npm nginx certbot python3-certbot-nginx

# Create directories
sudo mkdir -p /var/www/asafarim-dot-be/{apis/TestAutomation.Api,apis/TestRunner,apps/test-automation-ui}
sudo mkdir -p /var/www/asafarim-dot-be/logs
sudo chown -R www-data:www-data /var/www/asafarim-dot-be
```

### Step 2: Setup Database

```bash
# Create database
sudo -u postgres psql

CREATE DATABASE testora_production;
CREATE USER testora_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE testora_production TO testora_user;
\c testora_production
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

### Step 3: Deploy TestAutomation.Api

```bash
# Build on dev machine
cd apis/TestAutomation.Api
dotnet publish -c Release -o ./publish

# Copy to production
scp -r ./publish/* user@server:/var/www/asafarim-dot-be/apis/TestAutomation.Api/

# Run migrations on server
cd /var/www/asafarim-dot-be/apis/TestAutomation.Api
dotnet ef database update --configuration Release

# Create systemd service
sudo cp /path/to/dotnet-testora.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable dotnet-testora
sudo systemctl start dotnet-testora
```

### Step 4: Deploy TestRunner

```bash
# Build on dev machine
cd apis/TestRunner
npm run build

# Copy to production
scp -r ./dist ./node_modules ./package.json user@server:/var/www/asafarim-dot-be/apis/TestRunner/

# Create systemd service
sudo cp /path/to/testrunner.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable testrunner
sudo systemctl start testrunner
```

### Step 5: Deploy Frontend

```bash
# Build on dev machine
cd apps/test-automation-ui
npm run build

# Copy to production
scp -r ./dist/* user@server:/var/www/asafarim-dot-be/apps/test-automation-ui/
```

### Step 6: Configure Nginx

```bash
# Copy nginx config
sudo cp /path/to/testora.asafarim.be.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/testora.asafarim.be.conf /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7: Setup SSL Certificates

```bash
# Generate Let's Encrypt certificate
sudo certbot certonly --nginx -d testora.asafarim.be

# Auto-renewal is enabled by default
sudo systemctl enable certbot.timer
```

---

## Configuration Files

### 1. appsettings.Production.json

Location: `/var/www/asafarim-dot-be/apis/TestAutomation.Api/appsettings.Production.json`

**Key Settings**:

- `ConnectionStrings.DefaultConnection` - PostgreSQL connection string
- `IdentityApi.BaseUrl` - <https://identity.asafarim.be>
- `TestRunner.BaseUrl` - <http://127.0.0.1:4000>
- `TestRunner.ApiKey` - Secure API key for TestRunner communication

### 2. Environment Variables

Location: `/etc/asafarim/env`

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testora_production
DB_USER=testora_user
DB_PASSWORD=your_secure_password
TESTRUNNER_API_KEY=your_secure_api_key_here
JWT_SECRET=0+a0ZklJy6DVL6osEj73W6P9inMk3+Ocn8KkQoUDR78=
```

### 3. Nginx Configuration

Location: `/etc/nginx/sites-available/testora.asafarim.be.conf`

**Key Proxies**:

- `/api/*` → <http://127.0.0.1:5106> (API backend)
- `/signalr` → <http://127.0.0.1:5106> (WebSocket for real-time updates)
- `/*` → React SPA (try_files $uri $uri/ /index.html)

---

## Verification Checklist

After deployment, verify:

```bash
# 1. Check services are running
sudo systemctl status dotnet-testora
sudo systemctl status testrunner

# 2. Check ports are listening
sudo netstat -tlnp | grep -E '5106|4000'

# 3. Test API health
curl https://testora.asafarim.be/api/health

# 4. Check database connection
psql -h localhost -U testora_user -d testora_production -c "SELECT 1"

# 5. View logs
sudo journalctl -u dotnet-testora -n 20
sudo journalctl -u testrunner -n 20

# 6. Test frontend loads
curl -I https://testora.asafarim.be/
```

---

## Common Issues & Solutions

### API Service Won't Start

```bash
# Check logs
sudo journalctl -u dotnet-testora -n 50

# Verify database connection
psql -h localhost -U testora_user -d testora_production

# Check if port is in use
sudo lsof -i :5106
```

### TestRunner Not Connecting

```bash
# Check if port 4000 is listening
sudo netstat -tlnp | grep 4000

# Verify API key matches in both configs
grep API_KEY /etc/asafarim/env
grep ApiKey /var/www/asafarim-dot-be/apis/TestAutomation.Api/appsettings.Production.json
```

### Frontend Not Loading

```bash
# Check nginx config
sudo nginx -t

# Check if files are in place
ls -la /var/www/asafarim-dot-be/apps/test-automation-ui/

# Check nginx logs
sudo tail -f /var/log/nginx/testora.asafarim.be.error.log
```

### Database Connection Issues

```bash
# Test connection
psql -h localhost -U testora_user -d testora_production

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

## Monitoring Commands

```bash
# View real-time API logs
sudo journalctl -u dotnet-testora -f

# View real-time TestRunner logs
sudo journalctl -u testrunner -f

# View nginx access logs
sudo tail -f /var/log/nginx/testora.asafarim.be.access.log

# View nginx error logs
sudo tail -f /var/log/nginx/testora.asafarim.be.error.log

# Monitor system resources
htop

# Check disk usage
df -h

# Check database size
psql -U testora_user -d testora_production -c "SELECT pg_size_pretty(pg_database_size('testora_production'))"
```

---

## Restart Services

```bash
# Restart API
sudo systemctl restart dotnet-testora

# Restart TestRunner
sudo systemctl restart testrunner

# Restart nginx
sudo systemctl reload nginx

# Restart all
sudo systemctl restart dotnet-testora testrunner nginx
```

---

## Backup & Recovery

### Backup Database

```bash
# Manual backup
pg_dump -U testora_user testora_production | gzip > testora_backup_$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip < testora_backup_20240101.sql.gz | psql -U testora_user testora_production
```

### Backup Application Files

```bash
# Backup API
tar -czf testora-api-backup.tar.gz /var/www/asafarim-dot-be/apis/TestAutomation.Api/

# Backup TestRunner
tar -czf testrunner-backup.tar.gz /var/www/asafarim-dot-be/apis/TestRunner/

# Backup Frontend
tar -czf testora-ui-backup.tar.gz /var/www/asafarim-dot-be/apps/test-automation-ui/
```

---

## Performance Tuning

### PostgreSQL

```sql
-- Increase connections
ALTER SYSTEM SET max_connections = 200;

-- Increase shared buffers
ALTER SYSTEM SET shared_buffers = '2GB';

-- Reload
SELECT pg_reload_conf();
```

### Nginx

```nginx
# In /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 2048;
gzip on;
```

### .NET Runtime

```bash
# In systemd service
Environment=DOTNET_TieredCompilation=1
Environment=DOTNET_TieredCompilationQuickJit=1
```

---

## Security Hardening

### Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw default deny incoming
sudo ufw enable
```

### API Key Rotation

```bash
# Generate new key
openssl rand -base64 32

# Update in /etc/asafarim/env
# Restart services
sudo systemctl restart dotnet-testora testrunner
```

---

## Full Documentation

For complete details, see: `docs/deployment/TESTORA_PRODUCTION_SETUP.md`
