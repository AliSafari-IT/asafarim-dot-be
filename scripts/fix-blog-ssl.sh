#!/usr/bin/env bash

# Script to fix the blog.asafarim.be SSL configuration
# This script:
# 1) Updates the blog.asafarim.be Nginx configuration to match working subdomains
# 2) Reloads Nginx to apply changes

set -euo pipefail

# Check if running as root
if [[ $(id -u) -ne 0 ]]; then
  echo "This script must be run as root" >&2
  exit 1
fi

# Backup the current configuration
BACKUP_FILE="/etc/nginx/sites-enabled/blog.asafarim.be.conf.bak"
echo "==> Creating backup of current configuration to $BACKUP_FILE"
cp /etc/nginx/sites-enabled/blog.asafarim.be.conf "$BACKUP_FILE"

# Create new configuration based on working pattern
echo "==> Creating new configuration for blog.asafarim.be"
cat > /etc/nginx/sites-enabled/blog.asafarim.be.conf << 'EOF'
# blog.asafarim.be - Docusaurus Blog
server {
  server_name blog.asafarim.be;

  root /var/www/asafarim-dot-be/apps/blog;

  include /etc/nginx/snippets/asafarim/common.conf;
  include /etc/nginx/snippets/asafarim/api-routes.conf;

  access_log /var/log/nginx/blog.asafarim.be.access.log;
  error_log  /var/log/nginx/blog.asafarim.be.error.log warn;

  listen [::]:443 ssl; # managed by Certbot
  listen 443 ssl; # managed by Certbot
  ssl_certificate /etc/letsencrypt/live/blog.asafarim.be/fullchain.pem; # managed by Certbot
  ssl_certificate_key /etc/letsencrypt/live/blog.asafarim.be/privkey.pem; # managed by Certbot
  include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

  add_header Strict-Transport-Security "max-age=31536000" always; # managed by Certbot
}

server {
  if ($host = blog.asafarim.be) {
    return 301 https://$host$request_uri;
  } # managed by Certbot

  listen 80;
  listen [::]:80;
  server_name blog.asafarim.be;
  return 404; # managed by Certbot
}
EOF

# Test Nginx configuration
echo "==> Testing Nginx configuration"
nginx -t

if [ $? -eq 0 ]; then
  echo "==> Reloading Nginx"
  systemctl reload nginx
  echo "✓ blog.asafarim.be SSL configuration has been fixed"
else
  echo "❌ Nginx configuration test failed. Restoring backup..."
  cp "$BACKUP_FILE" /etc/nginx/sites-enabled/blog.asafarim.be.conf
  echo "Original configuration restored. Please check the error and try again."
  exit 1
fi
