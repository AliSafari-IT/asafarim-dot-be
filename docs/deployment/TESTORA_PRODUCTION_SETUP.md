# Testora Test Automation Platform - Production Deployment Guide

## Overview
Testora is a multi-component test automation platform consisting of:
- **TestAutomation.Api** - ASP.NET Core 8 backend API (port 5106)
- **test-automation-ui** - React frontend (port 5180)
- **TestRunner** - Node.js test execution service (port 4000)
- **PostgreSQL** - Database

Production domain: `testora.asafarim.be`

---

## 1. Infrastructure Requirements

### Server Specifications
- **OS**: Linux (Ubuntu 20.04+ or similar)
- **CPU**: 4+ cores (for parallel test execution)
- **RAM**: 8GB+ (4GB for API, 2GB for TestRunner, 2GB for system)
- **Storage**: 50GB+ (for test results, logs, screenshots)
- **Network**: Public IP with domain DNS configured

### Services to Install
```bash
# Core services
- nginx (reverse proxy)
- PostgreSQL 14+
- Node.js 18+
- .NET 8 Runtime
- Chromium/Chrome (for TestCafe)

# Optional but recommended
- Certbot (SSL certificates)
- Systemd (service management)
- Fail2ban (security)
```

---

## 2. Database Setup

### PostgreSQL Configuration

```bash
# 1. Create database and user
sudo -u postgres psql

CREATE DATABASE testora_production;
CREATE USER testora_user WITH PASSWORD 'your_secure_password';
ALTER ROLE testora_user SET client_encoding TO 'utf8';
ALTER ROLE testora_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE testora_user SET default_transaction_deferrable TO on;
ALTER ROLE testora_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE testora_production TO testora_user;

# 2. Enable required extensions
\c testora_production
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# 3. Exit psql
\q
```

### Connection String
```
Host=localhost;Port=5432;Database=testora_production;Username=testora_user;Password=your_secure_password;
```

---

## 3. Application Deployment

### 3.1 TestAutomation.Api (.NET Backend)

#### Directory Structure
```
/var/www/asafarim-dot-be/
├── apis/
│   └── TestAutomation.Api/
│       ├── bin/Release/net8.0/
│       ├── appsettings.Production.json
│       └── TestAutomation.Api.dll
└── logs/
    └── testora-api/
```

#### Build & Publish
```bash
# On development machine
cd apis/TestAutomation.Api
dotnet publish -c Release -o ./publish

# Copy to production server
scp -r ./publish/* user@production-server:/var/www/asafarim-dot-be/apis/TestAutomation.Api/
```

#### Configuration File
**File**: `/var/www/asafarim-dot-be/apis/TestAutomation.Api/appsettings.Production.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=testora_production;Username=testora_user;Password=YOUR_SECURE_PASSWORD"
  },
  "IdentityApi": {
    "BaseUrl": "https://identity.asafarim.be",
    "JwtSecret": "0+a0ZklJy6DVL6osEj73W6P9inMk3+Ocn8KkQoUDR78=",
    "Key": "0+a0ZklJy6DVL6osEj73W6P9inMk3+Ocn8KkQoUDR78=",
    "Expires": 1800,
    "Issuer": "asafarim-identity",
    "Audience": "asafarim-clients"
  },
  "TestRunner": {
    "BaseUrl": "http://127.0.0.1:4000",
    "ApiKey": "your_secure_api_key_here"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  },
  "Cors": {
    "AllowedOrigins": [
      "https://asafarim.be",
      "https://www.asafarim.be",
      "https://identity.asafarim.be",
      "https://testora.asafarim.be"
    ]
  },
  "AllowedHosts": "*"
}
```

#### Database Migrations
```bash
# Run migrations on production
cd /var/www/asafarim-dot-be/apis/TestAutomation.Api
dotnet ef database update --configuration Release
```

#### Systemd Service
**File**: `/etc/systemd/system/dotnet-testora.service`

```ini
[Unit]
Description=Testora Test Automation API (.NET)
After=network.target postgresql.service

[Service]
WorkingDirectory=/var/www/asafarim-dot-be/apis/TestAutomation.Api
ExecStart=/usr/bin/dotnet /var/www/asafarim-dot-be/apis/TestAutomation.Api/TestAutomation.Api.dll
Restart=always
RestartSec=5
SyslogIdentifier=dotnet-testora
User=www-data

# Environment variables
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false
Environment=DOTNET_ENVIRONMENT=Production
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://127.0.0.1:5106

# Load environment variables from file
EnvironmentFile=/etc/asafarim/env

# Hardening
NoNewPrivileges=true
ProtectSystem=full
ProtectHome=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

#### Enable & Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable dotnet-testora
sudo systemctl start dotnet-testora
sudo systemctl status dotnet-testora
```

---

### 3.2 TestRunner (Node.js Service)

#### Directory Structure
```
/var/www/asafarim-dot-be/
└── apis/
    └── TestRunner/
        ├── dist/
        ├── node_modules/
        ├── .env.production
        └── package.json
```

#### Build & Deploy
```bash
# On development machine
cd apis/TestRunner
npm run build

# Copy to production
scp -r ./dist ./node_modules ./package.json user@production-server:/var/www/asafarim-dot-be/apis/TestRunner/
```

#### Environment Configuration
**File**: `/var/www/asafarim-dot-be/apis/TestRunner/.env.production`

```bash
PORT=4000
NODE_ENV=production
API_URL=http://127.0.0.1:5106
API_KEY=your_secure_api_key_here
LOG_LEVEL=info
```

#### Systemd Service
**File**: `/etc/systemd/system/testrunner.service`

```ini
[Unit]
Description=Testora TestRunner Service (Node.js)
After=network.target

[Service]
WorkingDirectory=/var/www/asafarim-dot-be/apis/TestRunner
ExecStart=/usr/bin/node /var/www/asafarim-dot-be/apis/TestRunner/dist/index.js
Restart=always
RestartSec=5
SyslogIdentifier=testrunner
User=www-data

# Environment
Environment=NODE_ENV=production
Environment=PORT=4000
Environment=API_URL=http://127.0.0.1:5106
EnvironmentFile=/etc/asafarim/env

# Hardening
NoNewPrivileges=true
ProtectSystem=full
ProtectHome=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

#### Enable & Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable testrunner
sudo systemctl start testrunner
sudo systemctl status testrunner
```

---

### 3.3 Frontend (React UI)

#### Build
```bash
# On development machine
cd apps/test-automation-ui
npm run build

# Output: dist/ directory
```

#### Deploy to Web Server
```bash
# Copy built files to nginx root
scp -r ./dist/* user@production-server:/var/www/asafarim-dot-be/apps/test-automation-ui/
```

#### Nginx Configuration
**File**: `/etc/nginx/sites-available/testora.asafarim.be.conf`

```nginx
# testora.asafarim.be - Test Automation Platform
# HTTP -> HTTPS redirect
server {
  listen 80;
  listen [::]:80;
  server_name testora.asafarim.be;
  
  return 301 https://$host$request_uri;
}

# HTTPS server
server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name testora.asafarim.be;

  # SSL configuration
  ssl_certificate /etc/letsencrypt/live/testora.asafarim.be/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/testora.asafarim.be/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;
  ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
  ssl_session_timeout 1d;
  ssl_session_cache shared:SSL:10m;
  ssl_session_tickets off;

  # HSTS
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

  # Root directory for React app
  root /var/www/asafarim-dot-be/apps/test-automation-ui;

  # Logging
  access_log /var/log/nginx/testora.asafarim.be.access.log;
  error_log /var/log/nginx/testora.asafarim.be.error.log warn;

  # Common security headers
  include /etc/nginx/snippets/asafarim/common.conf;

  # API proxy configuration
  location /api/ {
    proxy_pass http://127.0.0.1:5106;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    proxy_request_buffering off;
  }

  # WebSocket support for SignalR
  location /signalr {
    proxy_pass http://127.0.0.1:5106;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    proxy_request_buffering off;
  }

  # React SPA routing
  location / {
    try_files $uri $uri/ /index.html;
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }

  # Static assets caching
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

#### Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/testora.asafarim.be.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. SSL Certificates

### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d testora.asafarim.be

# Auto-renewal (already enabled by default)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

---

## 5. Environment Variables

### System-wide Configuration
**File**: `/etc/asafarim/env`

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=testora_production
DB_USER=testora_user
DB_PASSWORD=your_secure_password

# API Keys
TESTRUNNER_API_KEY=your_secure_api_key_here

# JWT Configuration
JWT_SECRET=0+a0ZklJy6DVL6osEj73W6P9inMk3+Ocn8KkQoUDR78=
JWT_ISSUER=asafarim-identity
JWT_AUDIENCE=asafarim-clients

# Service URLs
IDENTITY_API_URL=https://identity.asafarim.be
TESTORA_API_URL=http://127.0.0.1:5106
TESTRUNNER_URL=http://127.0.0.1:4000
```

---

## 6. Logging & Monitoring

### Log Locations
```
/var/log/nginx/testora.asafarim.be.access.log
/var/log/nginx/testora.asafarim.be.error.log
/var/www/asafarim-dot-be/logs/testora-api-*.txt (daily rotation)
```

### View Logs
```bash
# API logs
sudo journalctl -u dotnet-testora -f

# TestRunner logs
sudo journalctl -u testrunner -f

# Nginx logs
sudo tail -f /var/log/nginx/testora.asafarim.be.access.log
sudo tail -f /var/log/nginx/testora.asafarim.be.error.log
```

### Health Checks
```bash
# API health
curl https://testora.asafarim.be/api/health

# Service status
sudo systemctl status dotnet-testora
sudo systemctl status testrunner
```

---

## 7. Deployment Checklist

### Pre-Deployment
- [ ] PostgreSQL database created and configured
- [ ] Database user with proper permissions
- [ ] SSL certificates obtained from Let's Encrypt
- [ ] Environment variables configured in `/etc/asafarim/env`
- [ ] Application secrets secured (API keys, JWT secret)

### Deployment Steps
- [ ] Build TestAutomation.Api in Release mode
- [ ] Build TestRunner and install dependencies
- [ ] Build React frontend
- [ ] Copy files to production server
- [ ] Run database migrations
- [ ] Create systemd service files
- [ ] Enable and start services
- [ ] Configure nginx
- [ ] Test all endpoints

### Post-Deployment
- [ ] Verify API health endpoint: `https://testora.asafarim.be/api/health`
- [ ] Test frontend loads: `https://testora.asafarim.be`
- [ ] Verify authentication with Identity API
- [ ] Test creating a test suite
- [ ] Test running a test
- [ ] Check logs for errors
- [ ] Monitor resource usage (CPU, memory, disk)

---

## 8. Troubleshooting

### API Service Won't Start
```bash
# Check service status
sudo systemctl status dotnet-testora

# View detailed logs
sudo journalctl -u dotnet-testora -n 50

# Check if port 5106 is in use
sudo netstat -tlnp | grep 5106

# Verify database connection
psql -h localhost -U testora_user -d testora_production -c "SELECT 1"
```

### TestRunner Service Won't Start
```bash
# Check service status
sudo systemctl status testrunner

# View logs
sudo journalctl -u testrunner -n 50

# Check if port 4000 is in use
sudo netstat -tlnp | grep 4000

# Test Node.js installation
node --version
npm --version
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check if ports 80/443 are listening
sudo netstat -tlnp | grep nginx
```

### Database Connection Issues
```bash
# Test connection
psql -h localhost -U testora_user -d testora_production

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

## 9. Performance Tuning

### PostgreSQL Optimization
```sql
-- Connection pooling (consider using PgBouncer)
-- Increase max_connections if needed
ALTER SYSTEM SET max_connections = 200;

-- Increase shared_buffers for better performance
ALTER SYSTEM SET shared_buffers = '2GB';

-- Increase work_mem for complex queries
ALTER SYSTEM SET work_mem = '16MB';

-- Reload configuration
SELECT pg_reload_conf();
```

### Nginx Optimization
```nginx
# In /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 2048;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### .NET Runtime Optimization
```bash
# In systemd service, add:
Environment=DOTNET_TieredCompilation=1
Environment=DOTNET_TieredCompilationQuickJit=1
Environment=DOTNET_TieredCompilationQuickJitForLoops=1
```

---

## 10. Security Hardening

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable
```

### API Key Rotation
```bash
# Generate new API key
openssl rand -base64 32

# Update in /etc/asafarim/env
# Restart services
sudo systemctl restart dotnet-testora testrunner
```

### Database Backups
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U testora_user testora_production | gzip > $BACKUP_DIR/testora_$TIMESTAMP.sql.gz

# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

---

## 11. Monitoring & Alerts

### Setup Monitoring
```bash
# Install monitoring tools
sudo apt-get install htop iotop nethogs

# Monitor in real-time
htop
```

### Key Metrics to Monitor
- CPU usage (should stay < 80%)
- Memory usage (should stay < 80%)
- Disk usage (should stay < 85%)
- Database connections (should stay < 150)
- API response time (should be < 500ms)
- Error rate (should be < 1%)

---

## 12. Rollback Procedure

### If Deployment Fails
```bash
# Stop services
sudo systemctl stop dotnet-testora testrunner

# Restore previous version
scp -r /var/backups/testora-api-backup/* /var/www/asafarim-dot-be/apis/TestAutomation.Api/

# Restart services
sudo systemctl start dotnet-testora testrunner

# Verify
sudo systemctl status dotnet-testora testrunner
```

---

## Contact & Support

For issues or questions:
- Check logs: `sudo journalctl -u dotnet-testora -f`
- Verify database: `psql -h localhost -U testora_user -d testora_production`
- Test API: `curl https://testora.asafarim.be/api/health`
